import { z } from 'zod';
import { header, href, icon, mediaId, text, tone } from './fields';

/**
 * Um schema zod por TIPO de seção. O tipo é gravado em Section.type; o conteúdo (draft/published)
 * é validado por ele ao salvar e ao publicar. Nenhum campo de preço.
 */

const hero = z.object({
  overline: text('Sobre-título', 40, { optional: true }),
  title: text('Título', 70),
  lead: text('Texto de abertura', 320, { multiline: true }),
  imageId: mediaId('Foto do hero', '5 / 4'),
  imageAlt: text('Descrição da foto', 160, { hint: 'Usada enquanto não houver foto cadastrada.' }),
  ctaLabel: text('Texto do botão principal', 40, { optional: true }),
  secondary: z.object({
    label: text('Texto do botão secundário', 30),
    href: href('Link do botão secundário'),
  }),
  highlights: z.array(text('Destaque', 40)).min(1).max(3),
});

const intro = z.object({ ...header });

const card = z.object({
  icon: icon(),
  tone: z.enum(['default', 'earth']).default('default'),
  overline: text('Sobre-título', 30, { optional: true }),
  title: text('Título', 40),
  description: text('Descrição', 160, { multiline: true }),
  href: href('Link').optional(),
  linkLabel: text('Texto do link', 30, { optional: true }),
});
const cards = z.object({ ...header, cards: z.array(card).min(2).max(4) });

const pillar = z.object({
  icon: icon(),
  tone: tone(),
  number: text('Número', 3),
  title: text('Título', 30),
  text: text('Texto', 200, { multiline: true }),
});
const pillars = z.object({ ...header, pillars: z.array(pillar).length(3) });

const step = z.object({
  icon: icon(),
  title: text('Título', 40),
  text: text('Texto', 140, { multiline: true }),
});
const steps = z.object({ ...header, steps: z.array(step).min(3).max(4) });

const restaurantsHome = z.object({ ...header, linkLabel: text('Texto do link', 40) });

const gallery = z.object({
  ...header,
  images: z
    .array(
      z.object({
        mediaId: mediaId(),
        alt: text('Descrição da foto', 160),
        icon: icon('Ícone do placeholder'),
      }),
    )
    .length(6),
});

const cta = z.object({
  title: text('Título', 60),
  text: text('Texto', 160, { optional: true, multiline: true }),
  ctaLabel: text('Texto do botão', 40),
});

const features = z.object({
  ...header,
  items: z
    .array(
      z.object({
        icon: icon(),
        tone: tone(),
        title: text('Título', 40),
        text: text('Texto', 140, { multiline: true }),
      }),
    )
    .min(2)
    .max(6),
});

const preQuote = z.object({
  ...header,
  checks: z.array(text('Item', 50)).max(4).default([]),
  note: text('Observação', 200, { optional: true, multiline: true }),
  formTitle: text('Título do formulário', 40, { optional: true }),
  nameLabel: text('Rótulo do campo de nome', 30, { optional: true }),
});

const ownerPanel = z.object({
  ...header,
  features: z
    .array(
      z.object({
        icon: icon(),
        tone: tone(),
        title: text('Título', 40),
        text: text('Texto', 140, { multiline: true }),
      }),
    )
    .length(4),
  ctaLabel: text('Texto do botão', 50),
  ctaMessage: text('Mensagem do WhatsApp', 200, { multiline: true }),
  imageId: mediaId('Foto', '4 / 5'),
  imageAlt: text('Descrição da foto', 160),
});

const companies = z.object({
  label: text('Título', 60),
  caption: text('Nota', 120),
  count: z.number().int().min(0).max(12),
});

const benefits = z.object({
  ...header,
  panels: z
    .array(
      z.object({
        title: text('Título', 30),
        icon: icon(),
        tone: z.enum(['brand', 'earth']),
        items: z.array(text('Benefício', 120)).min(1).max(5),
      }),
    )
    .length(2),
});

const history = z.object({
  overline: text('Sobre-título', 40, { optional: true }),
  title: text('Título (H1)', 70),
  lead: text('Primeiro parágrafo', 320, { multiline: true }),
  body: text('Segundo parágrafo', 420, { multiline: true }),
  tagline: text('Slogan', 50),
  imageId: mediaId('Foto', '5 / 4'),
  imageAlt: text('Descrição da foto', 160),
});

const stats = z.object({
  ...header,
  stats: z
    .array(
      z.object({
        icon: icon(),
        tone: tone(),
        value: text('Número / destaque', 12),
        label: text('Rótulo', 60),
        description: text('Descrição', 120, { multiline: true }),
      }),
    )
    .length(3),
});

/** Seções sem texto editável (conteúdo vem das tabelas) — ainda podem ser reordenadas/ocultadas. */
const dataBacked = z.object({});

export const sectionSchemas = {
  hero,
  intro,
  cards,
  pillars,
  steps,
  'restaurants-home': restaurantsHome,
  gallery,
  cta,
  features,
  'pre-quote': preQuote,
  'owner-panel': ownerPanel,
  companies,
  benefits,
  history,
  stats,
  'data-backed': dataBacked,
} as const;

export type SectionType = keyof typeof sectionSchemas;
export type SectionContent<T extends SectionType> = z.infer<(typeof sectionSchemas)[T]>;

export function parseSection<T extends SectionType>(type: T, data: unknown) {
  return sectionSchemas[type].safeParse(data);
}

/** Estrutura fixa das páginas: chave → nome do canvas (data-section = "Area/Nome") → tipo do schema. */
export interface PageDef {
  slug: string;
  path: string;
  title: string;
  area: string;
  sections: { key: string; name: string; type: SectionType }[];
}

export const PAGES: PageDef[] = [
  {
    slug: 'inicio',
    path: '/',
    title: 'Início',
    area: 'Inicio',
    sections: [
      { key: 'hero', name: 'Hero', type: 'hero' },
      { key: 'quatro-jeitos', name: 'QuatroJeitos', type: 'cards' },
      { key: 'pilares', name: 'Pilares', type: 'pillars' },
      { key: 'como-funciona', name: 'ComoFunciona', type: 'steps' },
      { key: 'onde-esta', name: 'OndeEsta', type: 'restaurants-home' },
      { key: 'galeria', name: 'Galeria', type: 'gallery' },
      { key: 'cta', name: 'CTA', type: 'cta' },
    ],
  },
  {
    slug: 'oficinas',
    path: '/oficinas',
    title: 'Oficinas',
    area: 'Oficinas',
    sections: [
      { key: 'hero', name: 'Hero', type: 'hero' },
      { key: 'catalogo', name: 'Catalogo', type: 'intro' },
      { key: 'como-montamos', name: 'ComoMontamos', type: 'steps' },
      { key: 'seguranca', name: 'SegurancaMateriais', type: 'features' },
      { key: 'pre-orcamento', name: 'PreOrcamento', type: 'pre-quote' },
      { key: 'cta', name: 'CTA', type: 'cta' },
    ],
  },
  {
    slug: 'festas-e-aniversarios',
    path: '/festas-e-aniversarios',
    title: 'Festas e aniversários',
    area: 'Festas',
    sections: [
      { key: 'hero', name: 'Hero', type: 'hero' },
      { key: 'formatos', name: 'Formatos', type: 'cards' },
      { key: 'temas', name: 'Temas', type: 'intro' },
      { key: 'o-que-inclui', name: 'OQueInclui', type: 'features' },
      { key: 'como-funciona', name: 'ComoFunciona', type: 'steps' },
      { key: 'pre-orcamento', name: 'PreOrcamento', type: 'pre-quote' },
      { key: 'cta', name: 'CTA', type: 'cta' },
    ],
  },
  {
    slug: 'restaurantes',
    path: '/restaurantes',
    title: 'Restaurantes',
    area: 'Restaurantes',
    sections: [
      { key: 'intro', name: 'Intro', type: 'intro' },
      { key: 'lista', name: 'Lista', type: 'data-backed' },
      { key: 'tem-um-restaurante', name: 'TemUmRestaurante', type: 'owner-panel' },
      { key: 'cta', name: 'CTA', type: 'cta' },
    ],
  },
  {
    slug: 'eventos-corporativos',
    path: '/eventos-corporativos',
    title: 'Eventos corporativos',
    area: 'EventosCorporativos',
    sections: [
      { key: 'hero', name: 'Hero', type: 'hero' },
      { key: 'formatos', name: 'Formatos', type: 'cards' },
      { key: 'empresas', name: 'EmpresasAtendidas', type: 'companies' },
      { key: 'como-funciona', name: 'ComoFunciona', type: 'steps' },
      { key: 'beneficios', name: 'Beneficios', type: 'benefits' },
      { key: 'pre-orcamento', name: 'PreOrcamento', type: 'pre-quote' },
      { key: 'cta', name: 'CTA', type: 'cta' },
    ],
  },
  {
    slug: 'quem-somos',
    path: '/quem-somos',
    title: 'Quem somos',
    area: 'QuemSomos',
    sections: [
      { key: 'historia', name: 'Historia', type: 'history' },
      { key: 'pilares', name: 'Pilares', type: 'pillars' },
      { key: 'equipe', name: 'Equipe', type: 'intro' },
      { key: 'seguranca', name: 'Seguranca', type: 'stats' },
      { key: 'cta', name: 'CTA', type: 'cta' },
    ],
  },
];

export const pageBySlug = (slug: string) => PAGES.find((p) => p.slug === slug);
export const sectionName = (page: PageDef, key: string) => {
  const s = page.sections.find((x) => x.key === key);
  return s ? `${page.area}/${s.name}` : `${page.area}/${key}`;
};
