/**
 * Fixture do módulo @/server/content para testes (sem banco): mesmos formatos de retorno,
 * montados a partir dos textos padrão e dos JSON do seed. Use com vi.mock('@/server/content', …).
 */
import { DEFAULT_PAGES } from '@/content/defaults/pages';
import { PAGES, pageBySlug, sectionName } from '@/content/sections/schemas';
import type {
  Activity,
  PartyTheme,
  PublishedPage,
  Restaurant,
  SiteSettings,
  TeamMember,
} from '@/content/types';
import contato from '@/content/contato.json';
import atividades from '@/content/atividades.json';
import equipe from '@/content/equipe.json';
import restaurantes from '@/content/restaurantes.json';
import temasFesta from '@/content/temas-festa.json';
import type { IconName } from '@/lib/iconNames';

export const fixturePage = (slug: string): PublishedPage => {
  const def = pageBySlug(slug)!;
  return {
    slug,
    media: {},
    sections: def.sections.map((s) => ({
      key: s.key,
      name: sectionName(def, s.key),
      type: s.type,
      content: DEFAULT_PAGES[slug]![s.key]!.content,
    })),
  };
};

export const fixtureRestaurants = (): Restaurant[] =>
  restaurantes.restaurantes
    .filter((r) => r.publicado)
    .map((r): Restaurant => ({
      slug: r.slug,
      name: r.name,
      neighborhood: r.neighborhood,
      schedule: r.schedule,
      address: r.address,
      ages: r.ages,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.name}, ${r.address}`)}`,
      image: null,
      imageAlt: r.imageAlt,
      destaqueHome: r.destaqueHome,
    }));

export const fixtureThemes = (): PartyTheme[] =>
  temasFesta.temas
    .filter((t) => t.publicado)
    .map((t) => ({
      slug: t.slug,
      icon: t.icon as IconName,
      title: t.title,
      description: t.description,
      tags: t.tags,
      image: null,
      imageAlt: t.imageAlt,
    }));

export const fixtureActivities = (): Activity[] =>
  atividades.atividades
    .filter((a) => a.publicado)
    .map((a) => ({
      slug: a.slug,
      categoria: a.categoria,
      icon: a.icon as IconName,
      title: a.title,
      description: a.description,
      tags: a.tags,
      image: null,
      imageAlt: a.imageAlt,
    }));

export const fixtureTeam = (): TeamMember[] =>
  equipe.equipe
    .filter((m) => m.visivel)
    .map((m) => ({
      nickname: m.nickname,
      name: m.name,
      role: m.role,
      bio: m.bio,
      badges: m.badges,
      photo: null,
    }));

export const fixtureSettings = (): SiteSettings => ({
  whatsapp: contato.whatsapp,
  instagram: contato.instagram,
  email: contato.email,
  city: contato.cidade,
  hours: contato.horario,
  messages: contato.mensagens,
});

export const contentModuleMock = () => ({
  getPublishedPage: async (slug: string) => fixturePage(slug),
  getRestaurants: async () => fixtureRestaurants(),
  getHomeRestaurants: async () =>
    fixtureRestaurants()
      .filter((r) => r.destaqueHome)
      .slice(0, 3),
  getPartyThemes: async () => fixtureThemes(),
  getActivities: async () => fixtureActivities(),
  getActivityCategories: async () => [...new Set(fixtureActivities().map((a) => a.categoria))],
  getTeam: async () => fixtureTeam(),
  getSettings: async () => fixtureSettings(),
});

export { PAGES };
