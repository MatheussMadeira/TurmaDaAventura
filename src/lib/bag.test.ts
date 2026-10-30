import { afterEach, describe, expect, it } from 'vitest';
import {
  BAG_STORAGE_KEY,
  BAG_TTL_MS,
  DEFAULT_BAG_START,
  addItem,
  bagMeta,
  buildBagMessage,
  countLabel,
  formatDate,
  loadBag,
  removeItem,
  saveBag,
  setQty,
  totalUnits,
  type BagProduct,
} from './bag';

const horta: BagProduct = {
  slug: 'kit-mini-horta',
  name: 'Kit mini horta',
  icon: 'leaf',
  meta: 'Mínimo de 10 unidades · personalizável',
  minQty: 10,
  image: null,
};
const massinha: BagProduct = {
  ...horta,
  slug: 'massinha-natural',
  name: 'Massinha natural',
  minQty: 1,
};

afterEach(() => window.localStorage.clear());

describe('sacola · quantidades', () => {
  it('começa no mínimo do produto', () => {
    expect(addItem([], horta)[0]?.qty).toBe(10);
    expect(addItem([], massinha)[0]?.qty).toBe(1);
  });
  it('adicionar de novo não duplica nem muda a quantidade', () => {
    const once = setQty(addItem([], horta), horta.slug, 14);
    expect(addItem(once, horta)).toBe(once);
  });
  it('diminuir abaixo do mínimo tira da sacola', () => {
    const bag = addItem([], horta);
    expect(setQty(bag, horta.slug, 9)).toEqual([]);
    expect(setQty(bag, horta.slug, 11)[0]?.qty).toBe(11);
  });
  it('remove, conta unidades e limita a quantidade', () => {
    const bag = addItem(setQty(addItem([], horta), horta.slug, 20), massinha);
    expect(totalUnits(bag)).toBe(21);
    expect(removeItem(bag, horta.slug)).toHaveLength(1);
    expect(setQty(bag, horta.slug, 99999)[0]?.qty).toBe(999);
  });
  it('rótulos', () => {
    expect(countLabel(1)).toBe('1 produto');
    expect(countLabel(2)).toBe('2 produtos');
    expect(bagMeta({ minQty: 10, personalizavel: true, categoryLabel: 'X' })).toBe(
      'Mínimo de 10 unidades · personalizável',
    );
    expect(bagMeta({ minQty: 10, personalizavel: false, categoryLabel: 'X' })).toBe(
      'Mínimo de 10 unidades',
    );
    expect(bagMeta({ minQty: 1, personalizavel: false, categoryLabel: 'Kits de atividade' })).toBe(
      'Kits de atividade',
    );
  });
});

describe('sacola · mensagem do WhatsApp', () => {
  const two = setQty(
    addItem(setQty(addItem([], horta), horta.slug, 20), massinha),
    massinha.slug,
    2,
  );

  it('segue o formato do canvas', () => {
    expect(
      buildBagMessage(
        two,
        { name: 'Mariana', when: '2026-12-12', notes: 'Nome da Laura nas plaquinhas.' },
        'Olá, Turma da Aventura! Quero fazer um pedido pelo site:',
      ),
    ).toBe(
      [
        'Olá, Turma da Aventura! Quero fazer um pedido pelo site:',
        '',
        '• 20 × Kit mini horta',
        '• 2 × Massinha natural',
        '',
        'Nome: Mariana',
        'Para quando: 12/12/2026',
        'Observações: Nome da Laura nas plaquinhas.',
      ].join('\n'),
    );
  });
  it('linhas vazias não entram', () => {
    const m = buildBagMessage(two, { name: '  ', when: '', notes: 'Tema floresta' });
    expect(m).not.toContain('Nome:');
    expect(m).not.toContain('Para quando:');
    expect(m).toContain('Observações: Tema floresta');
    expect(buildBagMessage(two)).toBe(
      `${DEFAULT_BAG_START}\n\n• 20 × Kit mini horta\n• 2 × Massinha natural`,
    );
  });
  it('nunca fala de preço, total ou pagamento', () => {
    const m = buildBagMessage(two, { name: 'A', when: '2026-01-02', notes: 'b' });
    expect(m).not.toMatch(/R\$|total|frete|pagamento|preço/i);
  });
  it('data fora do formato volta como digitada', () => {
    expect(formatDate('2026-12-12')).toBe('12/12/2026');
    expect(formatDate(' sábado ')).toBe('sábado');
  });
});

describe('sacola · localStorage por 7 dias', () => {
  it('guarda e lê', () => {
    saveBag(addItem([], horta), 1000);
    expect(loadBag(2000)).toHaveLength(1);
  });
  it('expira depois de 7 dias e limpa a chave', () => {
    saveBag(addItem([], horta), 1000);
    expect(loadBag(1000 + BAG_TTL_MS + 1)).toEqual([]);
    expect(window.localStorage.getItem(BAG_STORAGE_KEY)).toBeNull();
  });
  it('sacola vazia apaga a chave; lixo guardado vira vazio', () => {
    saveBag(addItem([], horta), 1);
    saveBag([], 2);
    expect(window.localStorage.getItem(BAG_STORAGE_KEY)).toBeNull();
    window.localStorage.setItem(BAG_STORAGE_KEY, '{nao-e-json');
    expect(loadBag()).toEqual([]);
    window.localStorage.setItem(
      BAG_STORAGE_KEY,
      JSON.stringify({ savedAt: Date.now(), items: [{ slug: 1 }, { ...horta, qty: 3 }] }),
    );
    expect(loadBag()).toHaveLength(1);
  });
  it('storage bloqueado não quebra', () => {
    const real = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('bloqueado');
      },
    });
    try {
      expect(loadBag()).toEqual([]);
      expect(() => saveBag(addItem([], horta))).not.toThrow();
    } finally {
      Object.defineProperty(window, 'localStorage', { configurable: true, value: real });
    }
  });
});
