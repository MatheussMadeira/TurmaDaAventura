import 'server-only';
import { db } from '../db';

/**
 * Reserva de edição por página: uma pessoa (uma aba) por vez. A reserva dura 90 s e o editor a
 * renova a cada ~25 s; se a aba fecha sem avisar (queda de rede, bateria), ela expira sozinha.
 * A MESMA pessoa em outra aba assume a reserva (a aba antiga descobre na renovação seguinte).
 */
export const LOCK_TTL_MS = 90_000;

export interface LockHolder {
  name: string;
  since: Date;
}

export type AcquireResult = { ok: true } | { ok: false; holder: LockHolder };

/** Mensagem única para toda recusa de gravação sem reserva (campo `_lock` = "lost"). */
export const LOCK_LOST_MESSAGE =
  'Esta página está sendo editada por outra pessoa ou em outra aba. Suas últimas alterações não foram salvas.';

/** Pega (ou renova) a reserva, de forma atômica: dois pedidos simultâneos nunca vencem os dois. */
export async function acquireLock(
  slug: string,
  user: { id: string; name: string },
  token: string,
  now: Date = new Date(),
): Promise<AcquireResult> {
  const expiresAt = new Date(now.getTime() + LOCK_TTL_MS);
  const rows = await db.$queryRaw<{ token: string }[]>`
    INSERT INTO "PageLock" (slug, "userId", "userName", token, "acquiredAt", "expiresAt")
    VALUES (${slug}, ${user.id}, ${user.name}, ${token}, ${now}, ${expiresAt})
    ON CONFLICT (slug) DO UPDATE SET
      "userId" = EXCLUDED."userId",
      "userName" = EXCLUDED."userName",
      "acquiredAt" = CASE WHEN "PageLock".token = EXCLUDED.token
                          THEN "PageLock"."acquiredAt" ELSE EXCLUDED."acquiredAt" END,
      token = EXCLUDED.token,
      "expiresAt" = EXCLUDED."expiresAt"
    WHERE "PageLock"."expiresAt" < ${now}
       OR "PageLock".token = EXCLUDED.token
       OR "PageLock"."userId" = EXCLUDED."userId"
    RETURNING token`;
  if (rows.length) return { ok: true };
  const holder = await activeHolder(slug, now);
  // sumiu entre uma consulta e outra: tenta de novo uma vez
  return holder ? { ok: false, holder } : acquireLock(slug, user, token, now);
}

async function activeHolder(slug: string, now: Date): Promise<LockHolder | null> {
  const row = await db.pageLock.findUnique({ where: { slug } });
  return row && row.expiresAt > now ? { name: row.userName, since: row.acquiredAt } : null;
}

/** Quem está editando a página AGORA, se não for a própria pessoa (para barrar a entrada). */
export async function otherHolder(slug: string, userId: string, now = new Date()) {
  const row = await db.pageLock.findUnique({ where: { slug } });
  if (!row || row.expiresAt <= now || row.userId === userId) return null;
  return { name: row.userName, since: row.acquiredAt } satisfies LockHolder;
}

/** Confere (e renova) a reserva antes de qualquer gravação do editor. */
export async function holdsLock(slug: string, token: unknown, now = new Date()) {
  if (typeof token !== 'string' || token.length < 16 || token.length > 64) return false;
  const { count } = await db.pageLock.updateMany({
    where: { slug, token, expiresAt: { gt: now } },
    data: { expiresAt: new Date(now.getTime() + LOCK_TTL_MS) },
  });
  return count > 0;
}

export async function releaseLock(slug: string, token: string) {
  await db.pageLock.deleteMany({ where: { slug, token } });
}
