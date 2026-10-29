import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/navigation', () => ({ redirect: vi.fn(), unstable_rethrow: vi.fn() }));
vi.mock('./auth/session', () => ({ AuthzError: class extends Error {}, authorize: vi.fn() }));

type Rec = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EQUIPE';
  active: boolean;
  passwordHash: string;
  mustChangePassword: boolean;
  tokenVersion: number;
  failedAttempts: number;
  lockedUntil: Date | null;
};
let users: Rec[];
let audits: { action: string }[];

const match = (u: Rec, where: Record<string, unknown> = {}) =>
  Object.entries(where).every(([k, v]) => {
    if (v && typeof v === 'object' && 'not' in (v as object))
      return u[k as keyof Rec] !== (v as { not: unknown }).not;
    return u[k as keyof Rec] === v;
  });

const tx = {
  user: {
    findUnique: vi.fn(
      async ({ where }: { where: { id?: string; email?: string } }) =>
        users.find((u) => (where.id ? u.id === where.id : u.email === where.email)) ?? null,
    ),
    findUniqueOrThrow: vi.fn(async ({ where }: { where: { id: string } }) => {
      const u = users.find((x) => x.id === where.id);
      if (!u) throw new Error('não achou');
      return u;
    }),
    count: vi.fn(
      async ({ where }: { where: Record<string, unknown> }) =>
        users.filter((u) => match(u, where)).length,
    ),
    update: vi.fn(
      async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const u = users.find((x) => x.id === where.id)!;
        for (const [k, v] of Object.entries(data)) {
          if (v && typeof v === 'object' && 'increment' in (v as object)) {
            (u as Record<string, unknown>)[k] =
              (u[k as keyof Rec] as number) + (v as { increment: number }).increment;
          } else (u as Record<string, unknown>)[k] = v;
        }
        return u;
      },
    ),
    create: vi.fn(async ({ data }: { data: Partial<Rec> }) => {
      const u = {
        id: `n${users.length}`,
        active: true,
        tokenVersion: 0,
        failedAttempts: 0,
        lockedUntil: null,
        ...data,
      } as Rec;
      users.push(u);
      return u;
    }),
  },
  auditLog: {
    create: vi.fn(async ({ data }: { data: { action: string } }) => void audits.push(data)),
  },
};
const db = {
  ...tx,
  $transaction: vi.fn(async (...args: [(t: typeof tx) => unknown, unknown?]) => args[0](tx)),
};
vi.mock('./db', () => ({ db }));

const { changeOwnPassword, changeRole, createUser, resetPassword, setActive } =
  await import('./users');
const { verifyPassword } = await import('./auth/password');
const bcrypt = (await import('bcryptjs')).default;

const mk = (id: string, role: 'ADMIN' | 'EQUIPE', active = true): Rec => ({
  id,
  name: id.toUpperCase(),
  email: `${id}@exemplo.com`,
  role,
  active,
  passwordHash: bcrypt.hashSync('Senha-Atual-1', 4),
  mustChangePassword: false,
  tokenVersion: 0,
  failedAttempts: 0,
  lockedUntil: null,
});
const actor = (id: string, role: 'ADMIN' | 'EQUIPE' = 'ADMIN') => ({
  id,
  name: id,
  email: `${id}@exemplo.com`,
  role,
  mustChangePassword: false,
});

beforeEach(() => {
  vi.clearAllMocks();
  audits = [];
  users = [mk('a1', 'ADMIN'), mk('a2', 'ADMIN'), mk('e1', 'EQUIPE')];
});

describe('invariante: sempre ≥ 1 Administração ativa', () => {
  it('não rebaixa nem desativa a ÚLTIMA Administração ativa', async () => {
    users = [mk('a1', 'ADMIN'), mk('a2', 'ADMIN'), mk('e1', 'EQUIPE')];
    await setActive(actor('a1'), 'a2', false); // sobra a1 → ok
    await expect(changeRole(actor('e1x'), 'a1', 'EQUIPE')).rejects.toThrow(
      /pelo menos uma Administração/,
    );
    await expect(setActive(actor('e1x'), 'a1', false)).rejects.toThrow(
      /pelo menos uma Administração/,
    );
    expect(users.find((u) => u.id === 'a1')).toMatchObject({ role: 'ADMIN', active: true });
  });

  it('admin desativado não conta como "outra" Administração', async () => {
    users = [mk('a1', 'ADMIN'), mk('a2', 'ADMIN', false)];
    await expect(changeRole(actor('x'), 'a1', 'EQUIPE')).rejects.toThrow(
      /pelo menos uma Administração/,
    );
  });

  it('a própria conta não pode ser desativada nem rebaixada', async () => {
    await expect(setActive(actor('a1'), 'a1', false)).rejects.toThrow(/própria conta/);
    await expect(changeRole(actor('a1'), 'a1', 'EQUIPE')).rejects.toThrow(/própria conta/);
    expect(users[0]).toMatchObject({ role: 'ADMIN', active: true });
  });

  it('com duas Administrações, rebaixar uma funciona e fica no histórico', async () => {
    await changeRole(actor('a1'), 'a2', 'EQUIPE');
    expect(users.find((u) => u.id === 'a2')!.role).toBe('EQUIPE');
    expect(audits.map((a) => a.action)).toContain('user.role');
  });

  it('as checagens rodam em transação SERIALIZABLE (sem corrida entre duas ações)', async () => {
    await setActive(actor('a1'), 'e1', false);
    expect(db.$transaction.mock.calls[0]![1]).toEqual({ isolationLevel: 'Serializable' });
  });

  it('desativar derruba as sessões abertas (tokenVersion sobe)', async () => {
    await setActive(actor('a1'), 'e1', false);
    expect(users.find((u) => u.id === 'e1')).toMatchObject({ active: false, tokenVersion: 1 });
  });
});

describe('criar usuário e redefinir senha', () => {
  it('cria com senha temporária XXXX-XXXX-XXXX (devolvida uma vez) e troca obrigatória', async () => {
    const { user, tempPassword } = await createUser(actor('a1'), {
      name: 'Bia',
      email: ' BIA@Exemplo.com ',
      role: 'EQUIPE',
    });
    expect(tempPassword).toMatch(/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
    expect(user).toMatchObject({ email: 'bia@exemplo.com', mustChangePassword: true });
    expect(await verifyPassword(tempPassword, user.passwordHash)).toBe(true);
    expect(user.passwordHash).not.toContain(tempPassword);
  });

  it('e-mail repetido e dados inválidos são recusados', async () => {
    await expect(
      createUser(actor('a1'), { name: 'X', email: 'a1@exemplo.com', role: 'EQUIPE' }),
    ).rejects.toThrow();
    await expect(
      createUser(actor('a1'), { name: 'Bia', email: 'a1@exemplo.com', role: 'EQUIPE' }),
    ).rejects.toThrow(/já tem acesso/);
  });

  it('redefinir: nova senha temporária, troca obrigatória, destrava e derruba sessões', async () => {
    users.find((u) => u.id === 'e1')!.lockedUntil = new Date(Date.now() + 60_000);
    users.find((u) => u.id === 'e1')!.failedAttempts = 4;
    const { tempPassword } = await resetPassword(actor('a1'), 'e1');
    const e1 = users.find((u) => u.id === 'e1')!;
    expect(e1).toMatchObject({
      mustChangePassword: true,
      tokenVersion: 1,
      failedAttempts: 0,
      lockedUntil: null,
    });
    expect(await verifyPassword(tempPassword, e1.passwordHash)).toBe(true);
  });
});

describe('troca de senha obrigatória', () => {
  it('exige a senha atual, política e confirmação; aplica e sobe a versão do token', async () => {
    users.find((u) => u.id === 'e1')!.mustChangePassword = true;
    const me = actor('e1', 'EQUIPE');

    await expect(
      changeOwnPassword(me, 'errada', 'NovaSenha-123', 'NovaSenha-123'),
    ).rejects.toMatchObject({
      fieldErrors: { current: expect.any(String) },
    });
    await expect(changeOwnPassword(me, 'Senha-Atual-1', 'curta1', 'curta1')).rejects.toMatchObject({
      fieldErrors: { next: expect.stringContaining('10 caracteres') },
    });
    await expect(
      changeOwnPassword(me, 'Senha-Atual-1', 'NovaSenha-123', 'outra'),
    ).rejects.toMatchObject({
      fieldErrors: { confirm: expect.any(String) },
    });
    expect(users.find((u) => u.id === 'e1')!.mustChangePassword).toBe(true); // nada mudou

    await changeOwnPassword(me, 'Senha-Atual-1', 'NovaSenha-123', 'NovaSenha-123');
    const e1 = users.find((u) => u.id === 'e1')!;
    expect(e1).toMatchObject({ mustChangePassword: false, tokenVersion: 1 });
    expect(await verifyPassword('NovaSenha-123', e1.passwordHash)).toBe(true);
  });
});
