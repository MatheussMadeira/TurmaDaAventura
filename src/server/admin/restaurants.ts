import 'server-only';
import type { PublishStatus } from '@/generated/prisma/client';
import { restaurantSchema } from '@/content/adminSchemas';
import { DomainError } from '../actions';
import type { SessionUser } from '../auth/session';
import { db } from '../db';
import { audit, parseInput, reorder, slugify, touchSite } from './shared';

export type SaveMode = 'draft' | 'publish';

export async function listRestaurants() {
  const rows = await db.restaurant.findMany({
    include: { image: true },
    orderBy: { order: 'asc' },
  });
  return rows.map((r, i) => ({
    id: r.id,
    /** posição na lista inteira (a tela pode estar filtrada por aba) */
    first: i === 0,
    last: i === rows.length - 1,
    name: r.name,
    neighborhood: r.neighborhood,
    schedule: r.schedule,
    ages: r.ages,
    status: r.status,
    destaqueHome: r.destaqueHome,
    imageUrl: r.image?.url ?? null,
  }));
}
export type RestaurantRow = Awaited<ReturnType<typeof listRestaurants>>[number];

export async function getRestaurant(id: string) {
  return db.restaurant.findUnique({ where: { id }, include: { image: true } });
}

async function uniqueSlug(base: string) {
  let slug = base;
  for (let n = 2; await db.restaurant.findUnique({ where: { slug } }); n++) slug = `${base}-${n}`;
  return slug;
}

/** Cria/atualiza. "Salvar rascunho" → RASCUNHO (sai do site); "Salvar e publicar" → PUBLICADO ou PAUSADO. */
export async function saveRestaurant(
  actor: SessionUser,
  id: string | null,
  rawInput: unknown,
  mode: SaveMode,
) {
  const input = parseInput(restaurantSchema, rawInput);

  if (input.imageId && !(await db.media.findUnique({ where: { id: input.imageId } }))) {
    throw new DomainError('Revise 1 campo.', { imageId: 'Foto não encontrada na biblioteca.' });
  }

  const status: PublishStatus =
    mode === 'draft' ? 'RASCUNHO' : input.visible ? 'PUBLICADO' : 'PAUSADO';
  const data = {
    name: input.name,
    neighborhood: input.neighborhood,
    address: input.address,
    mapsUrl: input.mapsUrl,
    schedule: input.schedule,
    ages: input.ages,
    destaqueHome: input.destaqueHome,
    imageId: input.imageId,
    imageAlt: input.imageAlt,
    status,
  };

  let saved;
  if (id) {
    const current = await db.restaurant.findUnique({ where: { id } });
    if (!current) throw new DomainError('Restaurante não encontrado.');
    saved = await db.restaurant.update({ where: { id }, data });
  } else {
    saved = await db.restaurant.create({
      data: {
        ...data,
        slug: await uniqueSlug(slugify(input.name)),
        order: await db.restaurant.count(), // entra no fim da lista
      },
    });
  }

  await audit(
    actor,
    'restaurant',
    id ? 'restaurant.update' : 'restaurant.create',
    saved.id,
    `${id ? 'Editou' : 'Criou'} o restaurante “${saved.name}”`,
    status === 'PUBLICADO',
  );
  touchSite();
  return saved;
}

export async function setRestaurantStatus(actor: SessionUser, id: string, status: PublishStatus) {
  const r = await db.restaurant.update({ where: { id }, data: { status } }).catch(() => null);
  if (!r) throw new DomainError('Restaurante não encontrado.');
  await audit(
    actor,
    'restaurant',
    'restaurant.status',
    id,
    `${status === 'PAUSADO' ? 'Pausou' : status === 'PUBLICADO' ? 'Publicou' : 'Voltou a rascunho'} “${r.name}”`,
    status === 'PUBLICADO' || status === 'PAUSADO',
  );
  touchSite();
}

export async function deleteRestaurant(actor: SessionUser, id: string) {
  const r = await db.restaurant.findUnique({ where: { id } });
  if (!r) throw new DomainError('Restaurante não encontrado.');
  await db.restaurant.delete({ where: { id } });
  await audit(
    actor,
    'restaurant',
    'restaurant.delete',
    id,
    `Excluiu o restaurante “${r.name}”`,
    true,
  );
  touchSite();
}

/** Sobe/desce na lista: é a ordem em que os restaurantes aparecem no site. */
export async function moveRestaurant(actor: SessionUser, id: string, dir: 'up' | 'down') {
  const r = await db.restaurant.findUnique({ where: { id } });
  if (!r) throw new DomainError('Restaurante não encontrado.');
  const siblings = await db.restaurant.findMany({
    orderBy: { order: 'asc' },
    select: { id: true },
  });
  const moved = await reorder(siblings, id, dir, (ids) =>
    db.$transaction(
      ids.map((rid, order) => db.restaurant.update({ where: { id: rid }, data: { order } })),
    ),
  );
  if (moved) {
    await audit(actor, 'restaurant', 'restaurant.move', id, `Mudou a ordem de “${r.name}”`, true);
    touchSite();
  }
  return moved;
}
