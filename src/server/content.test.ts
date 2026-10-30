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
  restaurant: { findMany: vi.fn() },
};
vi.mock('./db', () => ({ db }));

const { getPublishedPage, getRestaurants } = await import('./content');
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
    const page = await getPublishedPage('oficinas');
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
    const keys = (await getPublishedPage('oficinas')).sections.map((s) => s.key);
    expect(keys).not.toContain('cta'); // oculta na versão publicada
    expect(keys.indexOf('catalogo')).toBeLessThan(keys.indexOf('hero')); // 0 antes de 3
  });

  it('seção sem versão publicada, ou publicada inválida, cai no texto padrão', async () => {
    db.section.findMany.mockResolvedValue([
      row('cta', { published: null }),
      row('hero', { published: { title: 'x'.repeat(500) } }),
    ]);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const page = await getPublishedPage('oficinas');
    spy.mockRestore();
    const def = DEFAULT_PAGES.oficinas!;
    expect(page.sections.find((s) => s.key === 'cta')!.content).toEqual(def.cta!.content);
    expect(page.sections.find((s) => s.key === 'hero')!.content).toEqual(def.hero!.content);
  });

  it('resolve as fotos citadas (imageId) com a descrição do cadastro', async () => {
    const hero = {
      ...(DEFAULT_PAGES.oficinas!.hero!.content as object),
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
    const page = await getPublishedPage('oficinas');
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

describe('getRestaurants', () => {
  it('só consulta restaurantes PUBLICADOS, na ordem do admin, e monta o link do Maps quando falta', async () => {
    db.restaurant.findMany.mockResolvedValue([
      {
        slug: 'a',
        name: 'Brasa & Lenha',
        neighborhood: 'Belvedere',
        schedule: 's',
        address: 'Alameda dos Ipês, 000',
        ages: 'a',
        mapsUrl: '',
        image: null,
        imageAlt: 'alt',
        destaqueHome: true,
      },
    ]);
    const list = await getRestaurants();
    const args = db.restaurant.findMany.mock.calls[0]![0];
    expect(args.where).toEqual({ status: 'PUBLICADO' });
    expect(args.orderBy).toEqual({ order: 'asc' });
    expect(list).toHaveLength(1);
    expect(list[0]!.mapsUrl).toContain('google.com/maps/search');
    expect(list[0]!.mapsUrl).toContain(encodeURIComponent('Alameda dos Ipês, 000'));
  });

  it('com link do mapa cadastrado, usa o link', async () => {
    db.restaurant.findMany.mockResolvedValue([
      {
        slug: 'b',
        name: 'B',
        neighborhood: 'Savassi',
        schedule: 's',
        address: 'Rua X, 000',
        ages: 'a',
        mapsUrl: 'https://maps.app.goo.gl/abc',
        image: null,
        imageAlt: '',
        destaqueHome: false,
      },
    ]);
    expect((await getRestaurants())[0]!.mapsUrl).toBe('https://maps.app.goo.gl/abc');
  });
});
