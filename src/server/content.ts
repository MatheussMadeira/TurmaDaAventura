import 'server-only';
import { unstable_cache } from 'next/cache';
import { DEFAULT_PAGES } from '@/content/defaults/pages';
import { pageBySlug, parseSection, sectionName } from '@/content/sections/schemas';
import type {
  Activity,
  ImageRef,
  PublishedPage,
  PublishedSection,
  Restaurant,
  SiteSettings,
  TeamMember,
} from '@/content/types';
import contatoJson from '@/content/contato.json';
import type { IconName } from '@/lib/iconNames';
import type { Media } from '@/generated/prisma/client';
import { db } from './db';

/**
 * Leitura do conteúdo PUBLICADO — é só o que o site público enxerga.
 * Rascunhos (Section.draft, restaurantes em RASCUNHO/PAUSADO…) nunca passam por aqui.
 * Tudo vai para o cache de dados com a tag "content"; publicar chama revalidateTag + revalidatePath.
 */
export const CONTENT_TAG = 'content';
const cached = <A extends unknown[], R>(key: string, fn: (...a: A) => Promise<R>) =>
  unstable_cache(fn, [key], { tags: [CONTENT_TAG] });

const toImage = (m: Pick<Media, 'url' | 'alt' | 'width' | 'height'> | null): ImageRef | null =>
  m ? { src: m.url, alt: m.alt, width: m.width, height: m.height } : null;

/** ids de foto citados no conteúdo de uma seção (imageId, photoId, images[].mediaId) */
function collectMediaIds(node: unknown, out: Set<string>) {
  if (Array.isArray(node)) node.forEach((n) => collectMediaIds(n, out));
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if ((k === 'imageId' || k === 'mediaId') && typeof v === 'string') out.add(v);
      else collectMediaIds(v, out);
    }
  }
}

export const getPublishedPage = cached(
  'published-page',
  async (slug: string): Promise<PublishedPage> => {
    const def = pageBySlug(slug);
    if (!def) throw new Error(`Página desconhecida: ${slug}`);

    // seção sem versão publicada (published nulo) cai no texto padrão
    const rows = await db.section.findMany({ where: { page: { slug } } });
    const byKey = new Map(rows.map((r) => [r.key, r]));

    const resolved: (PublishedSection & { order: number; visible: boolean })[] = def.sections.map(
      (s, i) => {
        const row = byKey.get(s.key);
        const fallback = DEFAULT_PAGES[slug]?.[s.key]?.content;
        let content: unknown = fallback;
        if (row?.published != null) {
          const parsed = parseSection(s.type, row.published);
          if (parsed.success) content = parsed.data;
          else
            console.error(`[content] ${slug}/${s.key} publicada é inválida; usando o texto padrão`);
        }
        return {
          key: s.key,
          name: sectionName(def, s.key),
          type: s.type,
          content,
          order: row?.publishedOrder ?? i,
          visible: row?.publishedVisible ?? true,
        };
      },
    );

    const sections = resolved
      .filter((s) => s.visible)
      .sort((a, b) => a.order - b.order)
      .map((s) => ({ key: s.key, name: s.name, type: s.type, content: s.content }));

    const ids = new Set<string>();
    sections.forEach((s) => collectMediaIds(s.content, ids));
    const media: Record<string, ImageRef> = {};
    if (ids.size) {
      for (const m of await db.media.findMany({ where: { id: { in: [...ids] } } })) {
        media[m.id] = toImage(m)!;
      }
    }
    return { slug, sections, media };
  },
);

/** Restaurantes publicados, na ordem definida no admin (uma lista só, sem regiões). */
export const getRestaurants = cached('restaurants', async (): Promise<Restaurant[]> => {
  const rows = await db.restaurant.findMany({
    where: { status: 'PUBLICADO' },
    orderBy: { order: 'asc' },
    include: { image: true },
  });
  return rows.map((r): Restaurant => ({
    slug: r.slug,
    name: r.name,
    neighborhood: r.neighborhood,
    schedule: r.schedule,
    address: r.address,
    ages: r.ages,
    // sem link do Maps cadastrado, "Como chegar" abre a busca do Google Maps pelo endereço
    mapsUrl:
      r.mapsUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.name}, ${r.address}`)}`,
    image: toImage(r.image),
    imageAlt: r.image?.alt ?? r.imageAlt,
    destaqueHome: r.destaqueHome,
  }));
});

export const getHomeRestaurants = cached('home-restaurants', async (): Promise<Restaurant[]> => {
  const all = await getRestaurants();
  return all.filter((r) => r.destaqueHome).slice(0, 3);
});

export const getActivities = cached('activities', async (): Promise<Activity[]> => {
  const rows = await db.activity.findMany({
    where: { status: 'PUBLICADO' },
    orderBy: { order: 'asc' },
    include: { image: true },
  });
  return rows.map((a) => ({
    slug: a.slug,
    categoria: a.category,
    icon: a.icon as IconName,
    title: a.title,
    description: a.description,
    tags: a.tags,
    image: toImage(a.image),
    imageAlt: a.image?.alt ?? a.imageAlt,
  }));
});

/** Categorias na ordem em que aparecem pela primeira vez entre as atividades publicadas. */
export const getActivityCategories = cached('activity-categories', async (): Promise<string[]> => {
  const acts = await getActivities();
  return [...new Set(acts.map((a) => a.categoria))];
});

export const getTeam = cached('team', async (): Promise<TeamMember[]> => {
  const rows = await db.teamMember.findMany({
    where: { visible: true },
    orderBy: { order: 'asc' },
    include: { photo: true },
  });
  return rows.map((m) => ({
    nickname: m.nickname,
    name: m.name,
    role: m.role,
    bio: m.bio,
    badges: m.badges,
    photo: toImage(m.photo),
  }));
});

export const getSettings = cached('settings', async (): Promise<SiteSettings> => {
  const s = await db.siteSettings.findUnique({ where: { id: 'site' } });
  if (!s) {
    return {
      whatsapp: contatoJson.whatsapp,
      instagram: contatoJson.instagram,
      email: contatoJson.email,
      city: contatoJson.cidade,
      hours: contatoJson.horario,
      messages: contatoJson.mensagens,
    };
  }
  return {
    whatsapp: s.whatsapp,
    instagram: s.instagram,
    email: s.email,
    city: s.city,
    hours: s.hours,
    messages: s.messages as Record<string, string>,
  };
});
