import 'server-only';
import type { ZodType } from 'zod';
import { DomainError, zodFieldErrors } from '../actions';
import type { SessionUser } from '../auth/session';
import { db } from '../db';
import { revalidateSite } from '../publish';

export async function audit(
  actor: SessionUser,
  entity: string,
  action: string,
  entityId: string | null,
  summary: string,
  published: boolean,
) {
  await db.auditLog.create({
    data: { userId: actor.id, entity, action, entityId, summary, published },
  });
}

/** Depois de salvar qualquer coisa que o site mostra. */
export const touchSite = () => revalidateSite();

/** Reordenação (subir/descer) dentro de um grupo: troca de lugar com o vizinho e renumera 0..n. */
export async function reorder<T extends { id: string }>(
  siblings: T[],
  id: string,
  dir: 'up' | 'down',
  save: (orderedIds: string[]) => Promise<unknown>,
) {
  const i = siblings.findIndex((s) => s.id === id);
  const j = dir === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= siblings.length) return false;
  const ids = siblings.map((s) => s.id);
  [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  await save(ids);
  return true;
}

/** Valida a entrada do formulário; erros viram "Revise N campos" + mensagem por campo. */
export function parseInput<T>(schema: ZodType<T>, input: unknown): T {
  const r = schema.safeParse(input);
  if (r.success) return r.data;
  const fieldErrors = zodFieldErrors(r.error);
  const n = Object.keys(fieldErrors).length;
  throw new DomainError(
    `Revise ${n} ${n === 1 ? 'campo' : 'campos'}. Nada foi salvo ainda.`,
    fieldErrors,
  );
}

export const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item';
