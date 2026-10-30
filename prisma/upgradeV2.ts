/**
 * Ajustes v2 — atualiza textos e dados que já existem no banco (seed normal só CRIA o que falta).
 * Nada do que o cliente editou é sobrescrito: cada campo só muda se ainda for o texto original do
 * seed (ver src/server/seedUpgrade.ts). O que não foi atualizado volta numa lista para revisão.
 */
import type { Prisma, PrismaClient } from '../src/generated/prisma/client';
import { DEFAULT_PAGES } from '../src/content/defaults/pages';
import restaurantes from '../src/content/restaurantes.json';
import contato from '../src/content/contato.json';
import { applyChanges, skippedLines, type Change } from '../src/server/seedUpgrade';

const json = (v: unknown) => v as Prisma.InputJsonValue;
const contentOf = (page: string, key: string) =>
  DEFAULT_PAGES[page]![key]!.content as Record<string, unknown>;

/** Texto novo → texto antigo (o do seed anterior), para não digitar os dois e errar um. */
const old = (s: string, pairs: [string, string][]) =>
  pairs.reduce((acc, [novo, antigo]) => acc.replace(novo, antigo), s);

const heroNew = contentOf('inicio', 'hero') as {
  lead: string;
  secondary: { label: string; href: string };
};
const quatro = contentOf('inicio', 'quatro-jeitos') as { title: string; cards: unknown[] };
const rest = contentOf('restaurantes', 'intro') as { description: string };
const historia = contentOf('quem-somos', 'historia') as { body: string };

/** Os 3 cartões do "Três jeitos" original (sem Festas), para só trocar se ninguém mexeu. */
const TRES_JEITOS_CARDS = [
  {
    icon: 'utensils',
    tone: 'default',
    overline: 'Para famílias',
    title: 'Restaurantes',
    description:
      'Recreação fixa nos fins de semana. As crianças brincam por perto e você come com calma.',
    href: '/restaurantes',
    linkLabel: 'Ver restaurantes',
  },
  {
    icon: 'briefcase',
    tone: 'earth',
    overline: 'Para empresas',
    title: 'Eventos corporativos',
    description:
      'Espaço kids em confraternizações, Dia da Família, convenções e férias na empresa.',
    href: '/eventos-corporativos',
    linkLabel: 'Ver eventos corporativos',
  },
  {
    icon: 'scissors',
    tone: 'default',
    overline: 'Para todos',
    title: 'Oficina',
    description: 'Pipas, mini horta, tintas naturais e gincanas. Atividades manuais e de natureza.',
    href: '/oficina',
    linkLabel: 'Conhecer a Oficina',
  },
];

interface SectionUpgrade {
  page: string;
  key: string;
  changes: Change[];
}

const SECTIONS: SectionUpgrade[] = [
  {
    page: 'inicio',
    key: 'hero',
    changes: [
      {
        path: 'lead',
        from: old(heroNew.lead, [
          ['festas, restaurantes, empresas e escolas', 'restaurantes, empresas e eventos'],
        ]),
        to: heroNew.lead,
      },
      { path: 'secondary.label', from: 'Conhecer a Oficina', to: heroNew.secondary.label },
      { path: 'secondary.href', from: '/oficina', to: heroNew.secondary.href },
    ],
  },
  {
    page: 'inicio',
    key: 'quatro-jeitos',
    changes: [
      { path: 'title', from: 'Três jeitos de viver a aventura', to: quatro.title },
      { path: 'cards', from: TRES_JEITOS_CARDS, to: quatro.cards },
    ],
  },
  {
    page: 'oficinas',
    key: 'hero',
    changes: [{ path: 'overline', from: 'Oficina', to: 'Oficinas' }],
  },
  {
    page: 'restaurantes',
    key: 'intro',
    changes: [
      {
        path: 'description',
        from: old(rest.description, [
          ['Restaurantes parceiros em Belo Horizonte', 'Restaurantes parceiros'],
        ]),
        to: rest.description,
      },
    ],
  },
  {
    page: 'quem-somos',
    key: 'historia',
    changes: [
      {
        path: 'body',
        from: old(historia.body, [
          [
            'festas, restaurantes, empresas e escolas de Belo Horizonte',
            'restaurantes, empresas e escolas',
          ],
        ]),
        to: historia.body,
      },
    ],
  },
];

/** Bairros/endereços do seed antigo (São Paulo) → Belo Horizonte, só onde ainda são os originais. */
const RESTAURANT_OLD: Record<string, { neighborhood: string; address?: string }> = {
  'brasa-e-lenha': { neighborhood: 'Moema' },
  'cantina-do-bosque': { neighborhood: 'Pinheiros' },
  'emporio-jatoba': { neighborhood: 'Vila Madalena' },
  'quintal-ipe': { neighborhood: 'Campo Belo' },
  'rancho-cedro': { neighborhood: 'Granja Viana', address: 'Estrada do Cedro, km 0' },
  'trattoria-serra': { neighborhood: 'Brooklin' },
};

export interface UpgradeReport {
  updated: string[];
  notUpdated: string[];
}

export async function upgradeV2(db: PrismaClient): Promise<UpgradeReport> {
  const updated: string[] = [];
  const notUpdated: string[] = [];

  /* seções */
  for (const u of SECTIONS) {
    const row = await db.section.findFirst({ where: { key: u.key, page: { slug: u.page } } });
    if (!row) continue;
    const where = `${u.page}/${u.key}`;
    const data: Prisma.SectionUpdateInput = {};
    for (const field of ['draft', 'published'] as const) {
      const current = row[field];
      if (current == null) continue;
      const r = applyChanges(current, u.changes);
      const label = field === 'draft' ? 'rascunho' : 'publicado';
      if (r.outcomes.some((o) => o.outcome === 'updated')) data[field] = json(r.value);
      for (const o of r.outcomes) {
        if (o.outcome === 'updated') updated.push(`${where} · ${o.path} (${label})`);
      }
      notUpdated.push(...skippedLines(`${where} (${label})`, r.outcomes));
    }
    if (Object.keys(data).length) await db.section.update({ where: { id: row.id }, data });
  }

  /* restaurantes */
  for (const r of restaurantes.restaurantes) {
    const base = RESTAURANT_OLD[r.slug];
    const row = await db.restaurant.findUnique({ where: { slug: r.slug } });
    if (!base || !row) continue;
    const data: Prisma.RestaurantUpdateInput = {};
    if (row.neighborhood === base.neighborhood) {
      data.neighborhood = r.neighborhood;
      updated.push(`restaurante ${r.name} · bairro`);
    } else if (row.neighborhood !== r.neighborhood) {
      notUpdated.push(`restaurante ${r.name} · bairro (“${row.neighborhood}”)`);
    }
    if (base.address) {
      if (row.address === base.address) {
        data.address = r.address;
        updated.push(`restaurante ${r.name} · endereço`);
      } else if (row.address !== r.address) {
        notUpdated.push(`restaurante ${r.name} · endereço (“${row.address}”)`);
      }
    }
    if (Object.keys(data).length) await db.restaurant.update({ where: { id: row.id }, data });
  }

  /* cidade (rodapé, contato, JSON-LD) */
  const settings = await db.siteSettings.findUnique({ where: { id: 'site' } });
  if (settings) {
    if (settings.city === 'São Paulo · SP') {
      await db.siteSettings.update({ where: { id: 'site' }, data: { city: contato.cidade } });
      updated.push('contato · cidade');
    } else if (settings.city !== contato.cidade) {
      notUpdated.push(`contato · cidade (“${settings.city}”)`);
    }
  }

  return { updated, notUpdated };
}
