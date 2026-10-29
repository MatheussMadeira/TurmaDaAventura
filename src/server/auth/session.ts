import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { can, type Permission, type Role } from '@/lib/permissions';
import { db } from '../db';
import { auth } from './index';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
}

export interface TokenClaims {
  uid?: string;
  tv?: number;
  remember?: boolean;
  /** emissão do token, em segundos */
  iat?: number;
}

/** Sem "manter conectado", a sessão vale 12 h (com ele, até o fim do JWT: 30 dias). */
export const SHORT_SESSION_MS = 12 * 60 * 60 * 1000;

/**
 * Transforma as claims do JWT em usuário VÁLIDO, consultando o banco: o usuário precisa existir,
 * estar ativo e a tokenVersion bater. Papel e "trocar senha" vêm sempre do banco, nunca do token.
 */
export async function validateClaims(
  claims: TokenClaims,
  nowMs: number = Date.now(),
): Promise<SessionUser | null> {
  if (!claims.uid) return null;
  if (!claims.remember && claims.iat && nowMs - claims.iat * 1000 > SHORT_SESSION_MS) return null;

  const u = await db.user.findUnique({
    where: { id: claims.uid },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      mustChangePassword: true,
      tokenVersion: true,
    },
  });
  if (!u || !u.active || u.tokenVersion !== (claims.tv ?? 0)) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    mustChangePassword: u.mustChangePassword,
  };
}

/** Usuário da requisição atual (uma consulta por requisição: React.cache). */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return validateClaims({
    uid: session.user.id,
    tv: session.user.tv,
    remember: session.user.remember,
    iat: session.user.iat,
  });
});

export type AuthzCode = 'unauthenticated' | 'must-change-password' | 'forbidden';

export class AuthzError extends Error {
  constructor(
    readonly code: AuthzCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'AuthzError';
  }
}

export const FORBIDDEN_MESSAGE = 'Você não tem permissão para fazer isso.';

/**
 * Porta de TODA Server Action e rota de API do admin: consulta o usuário no banco, exige conta ativa,
 * senha já trocada (salvo allowMustChange) e a permissão pedida — checada no servidor, não só no menu.
 */
export async function authorize(
  opts: { permission?: Permission; allowMustChange?: boolean } = {},
): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthzError('unauthenticated', 'Sua sessão terminou. Entre de novo.');
  if (user.mustChangePassword && !opts.allowMustChange) {
    throw new AuthzError('must-change-password', 'Crie sua senha antes de continuar.');
  }
  if (opts.permission && !can(user.role, opts.permission)) {
    throw new AuthzError('forbidden', FORBIDDEN_MESSAGE);
  }
  return user;
}

/**
 * Porta de PÁGINA do admin: sem sessão válida → login; senha temporária → troca obrigatória;
 * sem permissão → `allowed: false` (a página mostra o estado "sem permissão").
 */
export async function requirePageUser(
  permission?: Permission,
): Promise<{ user: SessionUser; allowed: boolean }> {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');
  if (user.mustChangePassword) redirect('/admin/trocar-senha');
  return { user, allowed: !permission || can(user.role, permission) };
}
