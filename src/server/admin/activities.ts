import 'server-only';
import type { PublishStatus } from '@/generated/prisma/client';
import { activitySchema } from '@/content/adminSchemas';
import { DomainError } from '../actions';
import type { SessionUser } from '../auth/session';
import { db } from '../db';
import { audit, parseInput, reorder, slugify, touchSite } from './shared';
import type { SaveMode } from './restaurants';

export async function listActivities() {
  const rows = await db.activity.findMany({ include: { image: true }, orderBy: { order: 'asc' } });
  return rows.map((a) => ({
    id: a.id,
    title: a.title,
    category: a.category,
    icon: a.icon,
    tags: a.tags,
    status: a.status,
    imageUrl: a.image?.url ?? null,
  }));
}
export type ActivityRow = Awaited<ReturnType<typeof listActivities>>[number];

export const getActivity = (id: string) =>
  db.activity.findUnique({ where: { id }, include: { image: true } });

export const listCategories = async () =>
  (
    await db.activity.findMany({
      distinct: ['category'],
      select: { category: true },
      orderBy: { order: 'asc' },
    })
  ).map((c) => c.category);

async function uniqueSlug(base: string) {
  let slug = base;
  for (let n = 2; await db.activity.findUnique({ where: { slug } }); n++) slug = `${base}-${n}`;
  return slug;
}

export async function saveActivity(
  actor: SessionUser,
  id: string | null,
  rawInput: unknown,
  mode: SaveMode,
) {
  const input = parseInput(activitySchema, rawInput);
  if (input.imageId && !(await db.media.findUnique({ where: { id: input.imageId } }))) {
    throw new DomainError('Revise 1 campo.', { imageId: 'Foto não encontrada na biblioteca.' });
  }
  const status: PublishStatus =
    mode === 'draft' ? 'RASCUNHO' : input.visible ? 'PUBLICADO' : 'PAUSADO';
  const data = {
    category: input.category,
    icon: input.icon,
    title: input.title,
    description: input.description,
    tags: input.tags,
    imageId: input.imageId,
    imageAlt: input.imageAlt,
    status,
  };

  let saved;
  if (id) {
    if (!(await db.activity.findUnique({ where: { id } })))
      throw new DomainError('Atividade não encontrada.');
    saved = await db.activity.update({ where: { id }, data });
  } else {
    saved = await db.activity.create({
      data: {
        ...data,
        slug: await uniqueSlug(slugify(input.title)),
        order: await db.activity.count(),
      },
    });
  }
  await audit(
    actor,
    'activity',
    id ? 'activity.update' : 'activity.create',
    saved.id,
    `${id ? 'Editou' : 'Criou'} a atividade “${saved.title}”`,
    status === 'PUBLICADO',
  );
  touchSite();
  return saved;
}

export async function setActivityStatus(actor: SessionUser, id: string, status: PublishStatus) {
  const a = await db.activity.update({ where: { id }, data: { status } }).catch(() => null);
  if (!a) throw new DomainError('Atividade não encontrada.');
  await audit(
    actor,
    'activity',
    'activity.status',
    id,
    `${status === 'PAUSADO' ? 'Pausou' : status === 'PUBLICADO' ? 'Publicou' : 'Voltou a rascunho'} “${a.title}”`,
    status !== 'RASCUNHO',
  );
  touchSite();
}

export async function deleteActivity(actor: SessionUser, id: string) {
  const a = await db.activity.findUnique({ where: { id } });
  if (!a) throw new DomainError('Atividade não encontrada.');
  await db.activity.delete({ where: { id } });
  await audit(actor, 'activity', 'activity.delete', id, `Excluiu a atividade “${a.title}”`, true);
  touchSite();
}

export async function moveActivity(actor: SessionUser, id: string, dir: 'up' | 'down') {
  const a = await db.activity.findUnique({ where: { id } });
  if (!a) throw new DomainError('Atividade não encontrada.');
  const siblings = await db.activity.findMany({ orderBy: { order: 'asc' }, select: { id: true } });
  const moved = await reorder(siblings, id, dir, (ids) =>
    db.$transaction(
      ids.map((rid, order) => db.activity.update({ where: { id: rid }, data: { order } })),
    ),
  );
  if (moved) {
    await audit(actor, 'activity', 'activity.move', id, `Mudou a ordem de “${a.title}”`, true);
    touchSite();
  }
  return moved;
}
