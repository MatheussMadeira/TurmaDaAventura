import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
const revalidatePath = vi.fn();
const revalidateTag = vi.fn();
vi.mock('next/cache', () => ({
  unstable_cache: <F extends (...a: never[]) => unknown>(fn: F) => fn,
  revalidatePath,
  revalidateTag,
}));

const calls: string[] = [];
const db = {
  page: { findUniqueOrThrow: vi.fn() },
  section: {
    findMany: vi.fn(),
    update: vi.fn((args: { where?: unknown; data: Record<string, unknown> }) => {
      calls.push('section.update');
      return args;
    }),
  },
  auditLog: {
    create: vi.fn((args: { data: Record<string, unknown> }) => {
      calls.push('auditLog.create');
      return args;
    }),
  },
  $transaction: vi.fn(async (ops: unknown[]) => {
    calls.push(`tx:${ops.length}`);
    return ops;
  }),
};
vi.mock('./db', () => ({ db }));

const { ContentError, publishPage, saveSectionDraft, pendingChanges } = await import('./publish');

const cta = (title: string) => ({ title, text: '', ctaLabel: 'Chamar' });
const intro = { overline: '', title: 'Catálogo', description: '' };
const sec = (key: string, over: Record<string, unknown> = {}) => ({
  id: `id-${key}`,
  key,
  draft: cta('A'),
  published: cta('A'),
  order: 0,
  visible: true,
  publishedOrder: 0,
  publishedVisible: true,
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  calls.length = 0;
});

describe('publishPage', () => {
  it('copia rascunho → publicado de todas as seções numa única transação e registra no histórico', async () => {
    db.section.findMany.mockResolvedValue([
      sec('cta', { draft: cta('Novo título'), published: cta('Antigo') }),
      sec('catalogo', {
        draft: intro,
        published: intro,
        order: 2,
        publishedOrder: 1,
      }),
    ]);
    const r = await publishPage('oficina', 'u1');

    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(['section.update', 'section.update', 'auditLog.create', 'tx:3']);
    expect(db.section.update.mock.calls[0]![0]).toMatchObject({
      where: { id: 'id-cta' },
      data: { published: cta('Novo título'), publishedOrder: 0, publishedVisible: true },
    });
    expect(db.section.update.mock.calls[1]![0].data).toMatchObject({ publishedOrder: 2 });
    expect(db.auditLog.create.mock.calls[0]![0].data).toMatchObject({
      action: 'publish',
      userId: 'u1',
      published: true,
    });
    expect(r).toEqual({ published: 2, changed: 2 });
  });

  it('revalida a rota da página, o layout e a tag de conteúdo', async () => {
    db.section.findMany.mockResolvedValue([sec('cta')]);
    await publishPage('oficina');
    expect(revalidatePath).toHaveBeenCalledWith('/oficina');
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(revalidateTag).toHaveBeenCalledWith('content', 'max');
  });

  it('não publica nada se algum rascunho estiver inválido (e não revalida)', async () => {
    db.section.findMany.mockResolvedValue([
      sec('cta', { draft: cta('x'.repeat(200)) }),
      sec('catalogo', { draft: intro, published: intro }),
    ]);
    await expect(publishPage('oficina')).rejects.toBeInstanceOf(ContentError);
    expect(db.$transaction).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('página desconhecida', async () => {
    await expect(publishPage('xyz')).rejects.toBeInstanceOf(ContentError);
  });
});

describe('saveSectionDraft', () => {
  it('valida pelo schema e grava só o rascunho (nunca o publicado)', async () => {
    db.page.findUniqueOrThrow.mockResolvedValue({ id: 'p1' });
    await saveSectionDraft('oficina', 'cta', cta('Título novo'), 'u1');
    const data = db.section.update.mock.calls[0]![0].data;
    expect(data).toEqual({ draft: cta('Título novo'), updatedById: 'u1' });
    expect(data).not.toHaveProperty('published');
  });

  it('recusa conteúdo acima do limite de caracteres, com mensagem por campo', async () => {
    await expect(saveSectionDraft('oficina', 'cta', cta('x'.repeat(61)))).rejects.toMatchObject({
      issues: [expect.stringContaining('Título: no máximo 60')],
    });
    expect(db.section.update).not.toHaveBeenCalled();
  });
});

describe('pendingChanges', () => {
  it('conta seções com texto, ordem ou visibilidade diferentes do publicado', async () => {
    db.section.findMany.mockResolvedValue([
      sec('a'),
      sec('b', { draft: cta('B') }),
      sec('c', { order: 3 }),
      sec('d', { visible: false }),
    ]);
    expect(await pendingChanges('oficina')).toBe(3);
  });
});
