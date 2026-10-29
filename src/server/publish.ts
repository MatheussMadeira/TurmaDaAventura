import 'server-only';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { Prisma } from '@/generated/prisma/client';
import { PAGES, pageBySlug, parseSection } from '@/content/sections/schemas';
import { db } from './db';
import { CONTENT_TAG } from './content';

/**
 * Rascunho → publicado. O site público só lê o publicado (server/content.ts).
 * Chamar SÓ de código autenticado (Server Actions do admin, Etapa 5).
 */
const json = (v: unknown) => v as Prisma.InputJsonValue;

export class ContentError extends Error {
  constructor(
    message: string,
    readonly issues: string[] = [],
  ) {
    super(message);
    this.name = 'ContentError';
  }
}

/** Faz o site refletir o que está publicado (cache de dados + HTML das rotas). */
export function revalidateSite(paths: string[] = PAGES.map((p) => p.path)) {
  revalidateTag(CONTENT_TAG, 'max');
  for (const p of paths) revalidatePath(p);
  revalidatePath('/', 'layout'); // header/rodapé/JSON-LD (configurações)
}

/** Salva o rascunho de uma seção (validado pelo schema, com limites de caracteres). Não publica. */
export async function saveSectionDraft(
  slug: string,
  key: string,
  content: unknown,
  userId?: string | null,
) {
  const def = pageBySlug(slug);
  const sec = def?.sections.find((s) => s.key === key);
  if (!def || !sec) throw new ContentError('Seção não encontrada.');
  const parsed = parseSection(sec.type, content);
  if (!parsed.success) {
    throw new ContentError(
      'Revise os campos.',
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    );
  }
  const page = await db.page.findUniqueOrThrow({ where: { slug } });
  return db.section.update({
    where: { pageId_key: { pageId: page.id, key } },
    data: { draft: json(parsed.data), updatedById: userId ?? null },
  });
}

/** Ordem e visibilidade (também são rascunho até publicar). `keys` = chaves na nova ordem. */
export async function saveSectionLayout(
  slug: string,
  layout: { key: string; visible: boolean }[],
  userId?: string | null,
) {
  const page = await db.page.findUniqueOrThrow({ where: { slug } });
  await db.$transaction(
    layout.map((l, order) =>
      db.section.update({
        where: { pageId_key: { pageId: page.id, key: l.key } },
        data: { order, visible: l.visible, updatedById: userId ?? null },
      }),
    ),
  );
}

/** Quantas seções têm alterações não publicadas (para "2 alterações não publicadas"). */
export async function pendingChanges(slug: string) {
  const rows = await db.section.findMany({ where: { page: { slug } } });
  return rows.filter(
    (s) =>
      JSON.stringify(s.draft) !== JSON.stringify(s.published) ||
      s.order !== s.publishedOrder ||
      s.visible !== s.publishedVisible,
  ).length;
}

/** Copia rascunho → publicado de TODAS as seções da página, numa transação, e revalida as rotas. */
export async function publishPage(slug: string, userId?: string | null) {
  const def = pageBySlug(slug);
  if (!def) throw new ContentError('Página não encontrada.');
  const sections = await db.section.findMany({ where: { page: { slug } } });

  // nada vai ao ar sem passar pelo schema
  const problems: string[] = [];
  for (const s of sections) {
    const type = def.sections.find((d) => d.key === s.key)?.type;
    if (!type) continue;
    const r = parseSection(type, s.draft);
    if (!r.success) problems.push(`${s.key}: ${r.error.issues[0]?.message ?? 'inválida'}`);
  }
  if (problems.length)
    throw new ContentError('Há campos para revisar antes de publicar.', problems);

  const changed = sections.filter(
    (s) =>
      JSON.stringify(s.draft) !== JSON.stringify(s.published) ||
      s.order !== s.publishedOrder ||
      s.visible !== s.publishedVisible,
  );

  await db.$transaction([
    ...sections.map((s) =>
      db.section.update({
        where: { id: s.id },
        data: { published: json(s.draft), publishedOrder: s.order, publishedVisible: s.visible },
      }),
    ),
    db.auditLog.create({
      data: {
        userId: userId ?? null,
        action: 'publish',
        entity: 'page',
        entityId: slug,
        summary: `Publicou a página ${def.title} (${changed.length} ${changed.length === 1 ? 'alteração' : 'alterações'})`,
        published: true,
      },
    }),
  ]);

  revalidateSite([def.path]);
  return { published: sections.length, changed: changed.length };
}

/** Descarta o rascunho da página (volta ao publicado). */
export async function discardDrafts(slug: string, userId?: string | null) {
  const sections = await db.section.findMany({ where: { page: { slug } } });
  await db.$transaction([
    ...sections
      .filter((s) => s.published != null)
      .map((s) =>
        db.section.update({
          where: { id: s.id },
          data: {
            draft: json(s.published),
            order: s.publishedOrder ?? s.order,
            visible: s.publishedVisible ?? s.visible,
          },
        }),
      ),
    db.auditLog.create({
      data: {
        userId: userId ?? null,
        action: 'discard',
        entity: 'page',
        entityId: slug,
        summary: `Descartou o rascunho da página ${pageBySlug(slug)?.title ?? slug}`,
        published: false,
      },
    }),
  ]);
}
