import 'server-only';
import { DEFAULT_PAGES } from '@/content/defaults/pages';
import { sectionTitle } from '@/content/sections/labels';
import { pageBySlug, type SectionType } from '@/content/sections/schemas';
import type { ImageRef } from '@/content/types';
import {
  getActivities,
  getActivityCategories,
  getHomeRestaurants,
  getPartyThemes,
  getProducts,
  getRestaurants,
  getTeam,
} from '../content';
import { db } from '../db';
import { pendingChanges } from '../publish';
import { listLibrary } from './library';

export interface EditorSection {
  key: string;
  title: string;
  type: SectionType;
  content: unknown;
  visible: boolean;
}

export interface EditorPage {
  slug: string;
  path: string;
  title: string;
  sections: EditorSection[];
  media: Record<string, ImageRef>;
  pending: number;
}

function collectMediaIds(node: unknown, out: Set<string>) {
  if (Array.isArray(node)) node.forEach((n) => collectMediaIds(n, out));
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if ((k === 'imageId' || k === 'mediaId') && typeof v === 'string') out.add(v);
      else collectMediaIds(v, out);
    }
  }
}

/** A página como o EDITOR a vê: rascunho (não o publicado), na ordem e visibilidade do rascunho. */
export async function loadEditorPage(slug: string): Promise<EditorPage | null> {
  const def = pageBySlug(slug);
  if (!def) return null;
  const rows = await db.section.findMany({ where: { page: { slug } } });
  const byKey = new Map(rows.map((r) => [r.key, r]));

  const sections = def.sections
    .map((s, i) => {
      const row = byKey.get(s.key);
      return {
        order: row?.order ?? i,
        section: {
          key: s.key,
          title: sectionTitle(slug, s.key),
          type: s.type,
          content: row?.draft ?? DEFAULT_PAGES[slug]?.[s.key]?.content ?? {},
          visible: row?.visible ?? true,
        } satisfies EditorSection,
      };
    })
    .sort((a, b) => a.order - b.order)
    .map((x) => x.section);

  const ids = new Set<string>();
  sections.forEach((s) => collectMediaIds(s.content, ids));
  const media: Record<string, ImageRef> = {};
  if (ids.size) {
    for (const m of await db.media.findMany({ where: { id: { in: [...ids] } } })) {
      media[m.id] = { src: m.url, alt: m.alt, width: m.width, height: m.height };
    }
  }
  return {
    slug,
    path: def.path,
    title: def.title,
    sections,
    media,
    pending: await pendingChanges(slug),
  };
}

/** Dados das tabelas que cada página mostra (restaurantes, atividades, equipe): iguais aos do site. */
export async function loadPreviewData(slug: string): Promise<Record<string, unknown>> {
  switch (slug) {
    case 'inicio':
      return { restaurants: await getHomeRestaurants() };
    case 'oficinas': {
      const [activities, categories] = await Promise.all([
        getActivities(),
        getActivityCategories(),
      ]);
      return { activities, categories };
    }
    case 'festas-e-aniversarios':
      return { themes: await getPartyThemes() };
    case 'produtos':
      return { products: await getProducts() };
    case 'restaurantes':
      return { restaurants: await getRestaurants() };
    case 'quem-somos':
      return { team: await getTeam() };
    default:
      return {};
  }
}

export async function editorLibrary() {
  return (await listLibrary()).map((m) => ({
    id: m.id,
    url: m.url,
    alt: m.alt,
    width: m.width,
    height: m.height,
  }));
}
