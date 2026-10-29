import { Fragment, type ReactNode } from 'react';
import type { SectionContent, SectionType } from '@/content/sections/schemas';
import type { ImageRef, PublishedPage } from '@/content/types';

/** Contexto entregue a cada renderizador de seção. `D` = dados das tabelas que a página usa. */
export interface Ctx<D = Record<string, never>> {
  /** foto da biblioteca pelo id (null = placeholder de camuflagem) */
  image: (id: string | null | undefined) => ImageRef | null;
  data: D;
}

export type Renderer<D> = (content: unknown, ctx: Ctx<D>, name: string) => ReactNode;

/** Tipa o conteúdo pelo schema da seção: `section('hero', (c) => …)`. */
export function section<T extends SectionType, D = Record<string, never>>(
  _type: T,
  fn: (content: SectionContent<T>, ctx: Ctx<D>, name: string) => ReactNode,
): Renderer<D> {
  return fn as unknown as Renderer<D>;
}

/** Renderiza as seções PUBLICADAS na ordem e com a visibilidade publicadas. */
export function renderSections<D>(
  page: PublishedPage,
  renderers: Record<string, Renderer<D>>,
  data: D,
): ReactNode {
  const ctx: Ctx<D> = { image: (id) => (id ? (page.media[id] ?? null) : null), data };
  return page.sections.map((s) => {
    const render = renderers[s.key];
    return render ? <Fragment key={s.key}>{render(s.content, ctx, s.name)}</Fragment> : null;
  });
}

/** "" (campo opcional vazio) → undefined */
export const opt = (v: string | undefined) => (v && v.trim() ? v : undefined);

/** Resumo para <meta description>: até ~160 caracteres, cortando em palavra. */
export function metaDescription(text: string, max = 160) {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

export const findContent = <T extends SectionType>(page: PublishedPage, key: string) =>
  page.sections.find((s) => s.key === key)?.content as SectionContent<T> | undefined;
