'use server';

import { pageBySlug } from '@/content/sections/schemas';
import { run, type ActionResult } from '@/server/actions';
import {
  ContentError,
  discardDrafts,
  pendingChanges,
  publishPage,
  saveSectionDraft,
  saveSectionLayout,
} from '@/server/publish';

type Pending = { pending: number };

const known = (slug: unknown): slug is string => typeof slug === 'string' && !!pageBySlug(slug);

/** Erros de conteúdo viram mensagem de tela (campo → mensagem); o resto o `run` traduz. */
function contentFail(e: unknown): ActionResult<never> {
  if (e instanceof ContentError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of e.issues) {
      const i = issue.indexOf(': ');
      if (i > 0 && !(issue.slice(0, i) in fieldErrors)) {
        fieldErrors[issue.slice(0, i)] = issue.slice(i + 2);
      }
    }
    return { ok: false, error: e.message, fieldErrors };
  }
  throw e;
}

/** Autosave de UMA seção. Valida pelo schema (limites de caracteres); não publica. */
export async function saveDraftAction(
  slug: string,
  key: string,
  content: unknown,
): Promise<ActionResult<Pending>> {
  return run<Pending>({ permission: 'site' }, async (user) => {
    if (!known(slug) || typeof key !== 'string') return { ok: false, error: 'Página inválida.' };
    try {
      await saveSectionDraft(slug, key, content, user.id);
    } catch (e) {
      return contentFail(e);
    }
    return { ok: true, data: { pending: await pendingChanges(slug) } };
  });
}

/** Ordem e visibilidade das seções (também rascunho até publicar). */
export async function saveLayoutAction(
  slug: string,
  layout: { key: string; visible: boolean }[],
): Promise<ActionResult<Pending>> {
  return run<Pending>({ permission: 'site' }, async (user) => {
    const def = known(slug) ? pageBySlug(slug) : undefined;
    const valid =
      def &&
      Array.isArray(layout) &&
      layout.length === def.sections.length &&
      new Set(layout.map((l) => l?.key)).size === layout.length &&
      layout.every(
        (l) => def.sections.some((s) => s.key === l.key) && typeof l.visible === 'boolean',
      );
    if (!valid) return { ok: false, error: 'Ordem inválida. Recarregue a página.' };
    await saveSectionLayout(slug, layout, user.id);
    return { ok: true, data: { pending: await pendingChanges(slug) } };
  });
}

export async function publishAction(
  slug: string,
): Promise<ActionResult<Pending & { changed: number }>> {
  return run<Pending & { changed: number }>({ permission: 'site' }, async (user) => {
    if (!known(slug)) return { ok: false, error: 'Página inválida.' };
    try {
      const r = await publishPage(slug, user.id);
      return {
        ok: true,
        message: 'Alterações publicadas. Já estão no site.',
        data: { pending: 0, changed: r.changed },
      };
    } catch (e) {
      return contentFail(e);
    }
  });
}

export async function discardAction(slug: string): Promise<ActionResult<Pending>> {
  return run<Pending>({ permission: 'site' }, async (user) => {
    if (!known(slug)) return { ok: false, error: 'Página inválida.' };
    await discardDrafts(slug, user.id);
    return {
      ok: true,
      message: 'Rascunho descartado. A página voltou ao que está no ar.',
      data: { pending: 0 },
    };
  });
}
