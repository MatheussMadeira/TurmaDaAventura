import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({
  unstable_cache: <F extends (...a: never[]) => unknown>(fn: F) => fn,
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

const db = {
  section: { findMany: vi.fn() },
  media: { findMany: vi.fn() },
  region: { findMany: vi.fn() },
};
vi.mock('./db', () => ({ db }));

const { getPublishedPage, getRestaurantGroups } = await import('./content');
const { DEFAULT_PAGES } = await import('@/content/defaults/pages');

const cta = (title: string) => ({ title, text: '', ctaLabel: 'Chamar' });
const row = (key: string, over: Record<string, unknown>) => ({
  key,
  draft: cta('RASCUNHO'),
  published: cta('PUBLICADO'),
  order: 0,
  visible: true,
  publishedOrder: 0,
  publishedVisible: true,
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  db.media.findMany.mockResolvedValue([]);
});

describe('getPublishedPage — o site lê só o publicado', () => {
  it('ignora o rascunho', async () => {
    db.section.findMany.mockResolvedValue([row('cta', {})]);
    const page = await getPublishedPage('oficina');
    const c = page.sections.find((s) => s.key === 'cta')!.content as { title: string };
    expect(c.title).toBe('PUBLICADO');
    expect(JSON.stringify(page)).not.toContain('RASCUNHO');
  });

  it('usa ordem e visibilidade publicadas, não as do rascunho', async () => {
    db.section.findMany.mockResolvedValue([
      row('hero', { order: 5, publishedOrder: 3, visible: false, publishedVisible: true }),
      row('catalogo', { order: 0, publishedOrder: 0 }),
      row('cta', { order: 1, publishedOrder: 9, publishedVisible: false, visible: true }),
    ]);
    const keys = (await getPublishedPage('oficina')).sections.map((s) => s.key);
    expect(keys).not.toContain('cta'); // oculta na versão publicada
    expect(keys.indexOf('catalogo')).toBeLessThan(keys.indexOf('hero')); // 0 antes de 3
  });

  it('seção sem versão publicada, ou publicada inválida, cai no texto padrão', async () => {
    db.section.findMany.mockResolvedValue([
      row('cta', { published: null }),
      row('hero', { published: { title: 'x'.repeat(500) } }),
    ]);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const page = await getPublishedPage('oficina');
    spy.mockRestore();
    const def = DEFAULT_PAGES.oficina!;
    expect(page.sections.find((s) => s.key === 'cta')!.content).toEqual(def.cta!.content);
    expect(page.sections.find((s) => s.key === 'hero')!.content).toEqual(def.hero!.content);
  });

  it('resolve as fotos citadas (imageId) com a descrição do cadastro', async () => {
    const hero = {
      ...(DEFAULT_PAGES.oficina!.hero!.content as object),
      imageId: 'm1',
    };
    db.section.findMany.mockResolvedValue([row('hero', { published: hero })]);
    db.media.findMany.mockResolvedValue([
      {
        id: 'm1',
        url: 'https://blob/x.webp',
        alt: 'Crianças com pipas',
        width: 2000,
        height: 1600,
      },
    ]);
    const page = await getPublishedPage('oficina');
    expect(db.media.findMany).toHaveBeenCalledWith({ where: { id: { in: ['m1'] } } });
    expect(page.media.m1).toEqual({
      src: 'https://blob/x.webp',
      alt: 'Crianças com pipas',
      width: 2000,
      height: 1600,
    });
  });

  it('rejeita página desconhecida', async () => {
    await expect(getPublishedPage('nao-existe')).rejects.toThrow();
  });
});

describe('getRestaurantGroups', () => {
  it('só consulta restaurantes PUBLICADOS e monta o link do Maps quando falta', async () => {
    db.region.findMany.mockResolvedValue([
      {
        slug: 'zona-sul',
        name: 'Zona Sul',
        shortName: 'Zona Sul',
        restaurants: [
          {
            slug: 'a',
            name: 'Brasa & Lenha',
            neighborhood: 'Moema',
            schedule: 's',
            address: 'Alameda dos Ipês, 000',
            ages: 'a',
            mapsUrl: '',
            image: null,
            imageAlt: 'alt',
            destaqueHome: true,
          },
        ],
      },
      { slug: 'vazia', name: 'Vazia', shortName: 'Vazia', restaurants: [] },
    ]);
    const groups = await getRestaurantGroups();
    expect(db.region.findMany.mock.calls[0]![0].include.restaurants.where).toEqual({
      status: 'PUBLICADO',
    });
    expect(groups.map((g) => g.id)).toEqual(['zona-sul']); // região sem restaurante some
    expect(groups[0]!.restaurants[0]!.mapsUrl).toContain('google.com/maps/search');
    expect(groups[0]!.restaurants[0]!.mapsUrl).toContain(
      encodeURIComponent('Alameda dos Ipês, 000'),
    );
  });
});
