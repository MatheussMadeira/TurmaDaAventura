import 'server-only';
import type { ProductStatus } from '@/generated/prisma/client';
import { productSchema } from '@/content/adminSchemas';
import { PRODUCT_CATEGORY_LABEL } from '@/content/productCategories';
import { DomainError } from '../actions';
import type { SessionUser } from '../auth/session';
import { db } from '../db';
import { audit, parseInput, reorder, slugify, touchSite } from './shared';
import type { SaveMode } from './restaurants';

/** Produtos do painel. NENHUM campo de preço: valores são combinados no WhatsApp. */
export async function listProducts() {
  const rows = await db.product.findMany({
    include: { image: true },
    orderBy: { order: 'asc' },
  });
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
    categoryLabel: PRODUCT_CATEGORY_LABEL[p.category],
    minQty: p.minQty,
    personalizavel: p.personalizavel,
    nosRestaurantes: p.nosRestaurantes,
    status: p.status,
    imageUrl: p.image?.url ?? null,
    /** o que falta para publicar (aparece como "Falta a foto" na lista de rascunhos) */
    missing: p.image ? null : 'Falta a foto',
  }));
}
export type ProductRow = Awaited<ReturnType<typeof listProducts>>[number];

export const getProduct = (id: string) =>
  db.product.findUnique({ where: { id }, include: { image: true } });

async function uniqueSlug(base: string) {
  let slug = base;
  for (let n = 2; await db.product.findUnique({ where: { slug } }); n++) slug = `${base}-${n}`;
  return slug;
}

export async function saveProduct(
  actor: SessionUser,
  id: string | null,
  rawInput: unknown,
  mode: SaveMode,
) {
  const input = parseInput(productSchema, rawInput);
  if (input.imageId && !(await db.media.findUnique({ where: { id: input.imageId } }))) {
    throw new DomainError('Revise 1 campo.', { imageId: 'Foto não encontrada na biblioteca.' });
  }
  const status: ProductStatus =
    mode === 'draft' || !input.visible ? 'RASCUNHO' : input.soldOut ? 'ESGOTADO' : 'PUBLICADO';
  const data = {
    name: input.name,
    category: input.category,
    icon: input.icon,
    description: input.description,
    minQty: input.minQty,
    personalizavel: input.personalizavel,
    nosRestaurantes: input.nosRestaurantes,
    imageId: input.imageId,
    imageAlt: input.imageAlt,
    status,
  };

  let saved;
  if (id) {
    if (!(await db.product.findUnique({ where: { id } })))
      throw new DomainError('Produto não encontrado.');
    saved = await db.product.update({ where: { id }, data });
  } else {
    saved = await db.product.create({
      data: {
        ...data,
        slug: await uniqueSlug(slugify(input.name)),
        order: await db.product.count(),
      },
    });
  }
  await audit(
    actor,
    'product',
    id ? 'product.update' : 'product.create',
    saved.id,
    `${id ? 'Editou' : 'Criou'} o produto “${saved.name}”`,
    status !== 'RASCUNHO',
  );
  touchSite();
  return saved;
}

const STATUS_VERB: Record<ProductStatus, string> = {
  RASCUNHO: 'Voltou a rascunho',
  PUBLICADO: 'Publicou',
  ESGOTADO: 'Marcou como esgotado',
};

export async function setProductStatus(actor: SessionUser, id: string, status: ProductStatus) {
  const p = await db.product.update({ where: { id }, data: { status } }).catch(() => null);
  if (!p) throw new DomainError('Produto não encontrado.');
  await audit(
    actor,
    'product',
    'product.status',
    id,
    `${STATUS_VERB[status]} “${p.name}”`,
    status !== 'RASCUNHO',
  );
  touchSite();
}

export async function deleteProduct(actor: SessionUser, id: string) {
  const p = await db.product.findUnique({ where: { id } });
  if (!p) throw new DomainError('Produto não encontrado.');
  await db.product.delete({ where: { id } });
  await audit(actor, 'product', 'product.delete', id, `Excluiu o produto “${p.name}”`, true);
  touchSite();
}

export async function moveProduct(actor: SessionUser, id: string, dir: 'up' | 'down') {
  const p = await db.product.findUnique({ where: { id } });
  if (!p) throw new DomainError('Produto não encontrado.');
  const siblings = await db.product.findMany({ orderBy: { order: 'asc' }, select: { id: true } });
  const moved = await reorder(siblings, id, dir, (ids) =>
    db.$transaction(
      ids.map((rid, order) => db.product.update({ where: { id: rid }, data: { order } })),
    ),
  );
  if (moved) {
    await audit(actor, 'product', 'product.move', id, `Mudou a ordem de “${p.name}”`, true);
    touchSite();
  }
  return moved;
}
