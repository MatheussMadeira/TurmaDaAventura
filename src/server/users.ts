import 'server-only';
import type { Role } from '@/generated/prisma/client';
import { DomainError } from './actions';
import {
  generateTempPassword,
  hashPassword,
  validateNewPassword,
  verifyPassword,
} from './auth/password';
import type { SessionUser } from './auth/session';
import { db } from './db';

/**
 * Regras de usuários (só Administração — a permissão é conferida na action).
 * Invariante: sempre existe ao menos 1 Administração ATIVA; a própria conta não pode ser
 * desativada nem rebaixada. A checagem roda dentro de uma transação SERIALIZABLE para que duas
 * ações simultâneas não deixem o sistema sem Administração.
 */
const SERIALIZABLE = { isolationLevel: 'Serializable' as const };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  lastLoginAt: Date | null;
  locked: boolean;
}

export async function listUsers(): Promise<UserRow[]> {
  const rows = await db.user.findMany({ orderBy: [{ active: 'desc' }, { name: 'asc' }] });
  const now = new Date();
  return rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    active: u.active,
    lastLoginAt: u.lastLoginAt,
    locked: !!u.lockedUntil && u.lockedUntil > now,
  }));
}

async function audit(actor: SessionUser, action: string, entityId: string, summary: string) {
  await db.auditLog.create({
    data: { userId: actor.id, action, entity: 'user', entityId, summary, published: true },
  });
}

/** Cria a conta com senha temporária (devolvida UMA vez); a pessoa troca no primeiro acesso. */
export async function createUser(
  actor: SessionUser,
  input: { name: string; email: string; role: Role },
) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = 'Informe o nome.';
  if (!EMAIL.test(email)) errors.email = 'Informe um e-mail válido.';
  if (Object.keys(errors).length) throw new DomainError('Revise os campos.', errors);
  if (await db.user.findUnique({ where: { email } })) {
    throw new DomainError('Esse e-mail já tem acesso.', { email: 'Esse e-mail já tem acesso.' });
  }
  const tempPassword = generateTempPassword();
  const user = await db.user.create({
    data: {
      name,
      email,
      role: input.role,
      passwordHash: await hashPassword(tempPassword),
      mustChangePassword: true,
    },
  });
  await audit(
    actor,
    'user.create',
    user.id,
    `Criou o acesso de ${name} (${input.role === 'ADMIN' ? 'Administração' : 'Equipe'})`,
  );
  return { user, tempPassword };
}

/** Garante que, depois de remover `targetId` das contas de Administração ativas, ainda sobra alguma. */
async function assertAnotherActiveAdmin(
  tx: Pick<typeof db, 'user'>,
  targetId: string,
  message: string,
) {
  const others = await tx.user.count({
    where: { role: 'ADMIN', active: true, id: { not: targetId } },
  });
  if (others < 1) throw new DomainError(message);
}

export async function changeRole(actor: SessionUser, targetId: string, role: Role) {
  if (targetId === actor.id) {
    throw new DomainError('Sua própria conta não pode ter o papel alterado.');
  }
  return db.$transaction(async (tx) => {
    const target = await tx.user.findUnique({ where: { id: targetId } });
    if (!target) throw new DomainError('Pessoa não encontrada.');
    if (target.role === role) return target;
    if (target.role === 'ADMIN' && role !== 'ADMIN' && target.active) {
      await assertAnotherActiveAdmin(
        tx,
        targetId,
        'Precisa existir pelo menos uma Administração ativa.',
      );
    }
    const updated = await tx.user.update({
      where: { id: targetId },
      data: { role },
    });
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: 'user.role',
        entity: 'user',
        entityId: targetId,
        summary: `Mudou o papel de ${target.name} para ${role === 'ADMIN' ? 'Administração' : 'Equipe'}`,
        published: true,
      },
    });
    return updated;
  }, SERIALIZABLE);
}

export async function setActive(actor: SessionUser, targetId: string, active: boolean) {
  if (targetId === actor.id && !active) {
    throw new DomainError('Sua própria conta não pode ser desativada.');
  }
  return db.$transaction(async (tx) => {
    const target = await tx.user.findUnique({ where: { id: targetId } });
    if (!target) throw new DomainError('Pessoa não encontrada.');
    if (target.active === active) return target;
    if (!active && target.role === 'ADMIN') {
      await assertAnotherActiveAdmin(
        tx,
        targetId,
        'Precisa existir pelo menos uma Administração ativa.',
      );
    }
    const updated = await tx.user.update({
      where: { id: targetId },
      // desativar também invalida as sessões abertas
      data: { active, tokenVersion: { increment: 1 } },
    });
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        action: active ? 'user.activate' : 'user.deactivate',
        entity: 'user',
        entityId: targetId,
        summary: `${active ? 'Reativou' : 'Desativou'} o acesso de ${target.name}`,
        published: true,
      },
    });
    return updated;
  }, SERIALIZABLE);
}

/** Nova senha temporária: troca obrigatória, derruba sessões abertas e destrava a conta. */
export async function resetPassword(actor: SessionUser, targetId: string) {
  const target = await db.user.findUnique({ where: { id: targetId } });
  if (!target) throw new DomainError('Pessoa não encontrada.');
  const tempPassword = generateTempPassword();
  await db.user.update({
    where: { id: targetId },
    data: {
      passwordHash: await hashPassword(tempPassword),
      mustChangePassword: true,
      tokenVersion: { increment: 1 },
      failedAttempts: 0,
      lockedUntil: null,
    },
  });
  await audit(actor, 'user.reset', targetId, `Redefiniu a senha de ${target.name}`);
  return { user: target, tempPassword };
}

/** Troca de senha da própria pessoa (obrigatória no primeiro acesso). */
export async function changeOwnPassword(
  actor: SessionUser,
  current: string,
  next: string,
  confirm: string,
) {
  const me = await db.user.findUniqueOrThrow({ where: { id: actor.id } });
  const errors: Record<string, string> = {};
  if (!(await verifyPassword(current, me.passwordHash))) errors.current = 'Senha atual incorreta.';
  const policy = validateNewPassword(next, { email: me.email, current });
  if (policy) errors.next = policy;
  if (next !== confirm) errors.confirm = 'As senhas não são iguais.';
  if (Object.keys(errors).length) throw new DomainError('Revise os campos.', errors);

  await db.user.update({
    where: { id: me.id },
    data: {
      passwordHash: await hashPassword(next),
      mustChangePassword: false,
      tokenVersion: { increment: 1 }, // encerra outras sessões; a atual é reemitida pelo login
    },
  });
  await audit(actor, 'user.password', me.id, 'Trocou a própria senha');
}
