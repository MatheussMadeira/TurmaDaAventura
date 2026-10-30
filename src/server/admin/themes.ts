import 'server-only';
import type { PublishStatus } from '@/generated/prisma/client';
import { themeSchema } from '@/content/adminSchemas';
import { DomainError } from '../actions';
import type { SessionUser } from '../auth/session';
import { db } from '../db';
import { audit, parseInput, reorder, slugify, touchSite } from './shared';
import type { SaveMode } from './restaurants';

export async function listThemes() {
  const rows = await db.partyTheme.findMany({
    include: { image: true },
    orderBy: { order: 'asc' },
  });
  return rows.map((a) => ({
    id: a.id,
    title: a.title,
    icon: a.icon,
    tags: a.tags,
    status: a.status,
    imageUrl: a.image?.url ?? null,
  }));
}
export type ThemeRow = Awaited<ReturnType<typeof listThemes>>[number];

export const getTheme = (id: string) =>
  db.partyTheme.findUnique({ where: { id }, include: { image: true } });

async function uniqueSlug(base: string) {
  let slug = base;
  for (let n = 2; await db.partyTheme.findUnique({ where: { slug } }); n++) slug = `${base}-${n}`;
  return slug;
}

export async function saveTheme(
  actor: SessionUser,
  id: string | null,
  rawInput: unknown,
  mode: SaveMode,
) {
  const input = parseInput(themeSchema, rawInput);
  if (input.imageId && !(await db.media.findUnique({ where: { id: input.imageId } }))) {
    throw new DomainError('Revise 1 campo.', { imageId: 'Foto não encontrada na biblioteca.' });
  }
  const status: PublishStatus =
    mode === 'draft' ? 'RASCUNHO' : input.visible ? 'PUBLICADO' : 'PAUSADO';
  const data = {
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
    if (!(await db.partyTheme.findUnique({ where: { id } })))
      throw new DomainError('Tema não encontrado.');
    saved = await db.partyTheme.update({ where: { id }, data });
  } else {
    saved = await db.partyTheme.create({
      data: {
        ...data,
        slug: await uniqueSlug(slugify(input.title)),
        order: await db.partyTheme.count(),
      },
    });
  }
  await audit(
    actor,
    'theme',
    id ? 'theme.update' : 'theme.create',
    saved.id,
    `${id ? 'Editou' : 'Criou'} o tema “${saved.title}”`,
    status === 'PUBLICADO',
  );
  touchSite();
  return saved;
}

export async function setThemeStatus(actor: SessionUser, id: string, status: PublishStatus) {
  const a = await db.partyTheme.update({ where: { id }, data: { status } }).catch(() => null);
  if (!a) throw new DomainError('Tema não encontrado.');
  await audit(
    actor,
    'theme',
    'theme.status',
    id,
    `${status === 'PAUSADO' ? 'Pausou' : status === 'PUBLICADO' ? 'Publicou' : 'Voltou a rascunho'} “${a.title}”`,
    status !== 'RASCUNHO',
  );
  touchSite();
}

export async function deleteTheme(actor: SessionUser, id: string) {
  const a = await db.partyTheme.findUnique({ where: { id } });
  if (!a) throw new DomainError('Tema não encontrado.');
  await db.partyTheme.delete({ where: { id } });
  await audit(actor, 'theme', 'theme.delete', id, `Excluiu o tema “${a.title}”`, true);
  touchSite();
}

export async function moveTheme(actor: SessionUser, id: string, dir: 'up' | 'down') {
  const a = await db.partyTheme.findUnique({ where: { id } });
  if (!a) throw new DomainError('Tema não encontrado.');
  const siblings = await db.partyTheme.findMany({
    orderBy: { order: 'asc' },
    select: { id: true },
  });
  const moved = await reorder(siblings, id, dir, (ids) =>
    db.$transaction(
      ids.map((rid, order) => db.partyTheme.update({ where: { id: rid }, data: { order } })),
    ),
  );
  if (moved) {
    await audit(actor, 'theme', 'theme.move', id, `Mudou a ordem de “${a.title}”`, true);
    touchSite();
  }
  return moved;
}
