import 'server-only';
import type { User } from '@/generated/prisma/client';
import { db } from '../db';
import { burnPasswordCheck, verifyPassword } from './password';

export const MAX_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;
export const LOCK_MS = LOCK_MINUTES * 60_000;

export type LoginResult = { ok: true; user: User } | { ok: false };

/**
 * Verifica e-mail + senha com bloqueio por tentativas. O contador vive NO BANCO
 * (User.failedAttempts / lockedUntil), não em memória: vale entre instâncias e reinícios.
 * O resultado de falha é sempre o mesmo ({ ok: false }) — a tela nunca diz qual campo errou
 * nem se a conta está bloqueada, desativada ou inexistente.
 */
export async function attemptLogin(
  emailRaw: string,
  password: string,
  now: Date = new Date(),
): Promise<LoginResult> {
  const email = emailRaw.trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    await burnPasswordCheck(password); // mesmo custo de tempo
    return { ok: false };
  }

  // conta bloqueada: nem confere a senha (não prolonga o bloqueio nem confirma o acerto)
  if (user.lockedUntil && user.lockedUntil > now) {
    await burnPasswordCheck(password);
    return { ok: false };
  }

  const valid = await verifyPassword(password, user.passwordHash);

  if (!valid || !user.active) {
    if (user.active) {
      const updated = await db.user.update({
        where: { id: user.id },
        data: { failedAttempts: { increment: 1 } },
        select: { failedAttempts: true },
      });
      if (updated.failedAttempts >= MAX_ATTEMPTS) {
        await db.user.update({
          where: { id: user.id },
          data: { lockedUntil: new Date(now.getTime() + LOCK_MS), failedAttempts: 0 },
        });
      }
    }
    return { ok: false };
  }

  const fresh = await db.user.update({
    where: { id: user.id },
    data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: now },
  });
  return { ok: true, user: fresh };
}
