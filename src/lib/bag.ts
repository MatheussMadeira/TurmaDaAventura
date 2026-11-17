/**
 * Sacola de produtos: monta a lista e a mensagem do WhatsApp. Quando todos os produtos têm preço
 * mostra um total estimado; nunca há frete nem pagamento no site. Módulo puro (sem React) + persistência em localStorage por 7 dias, sempre com try/catch.
 */
import { formatBRL } from './money';

export interface BagItem {
  slug: string;
  name: string;
  icon: string;
  /** linha de apoio na gaveta: "Mínimo de 10 unidades · personalizável" ou a categoria */
  meta: string;
  minQty: number;
  qty: number;
  /** preço unitário (centavos) na hora em que o produto entrou na sacola; null = a combinar */
  priceCents: number | null;
  image: string | null;
}

/** O que o card do produto entrega ao adicionar. */
export type BagProduct = Omit<BagItem, 'qty'>;

export const MAX_QTY = 999;
export const BAG_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const BAG_STORAGE_KEY = 'tda-sacola';

export const DEFAULT_BAG_START = 'Olá, Turma da Aventura! Quero fazer um pedido pelo site:';

const clamp = (n: number) => Math.min(MAX_QTY, Math.floor(n));

/** Linha de apoio do produto (categoria ou mínimo + personalização). */
export const bagMeta = (p: { minQty: number; personalizavel: boolean; categoryLabel: string }) =>
  p.minQty > 1
    ? `Mínimo de ${p.minQty} unidades${p.personalizavel ? ' · personalizável' : ''}`
    : p.categoryLabel;

/** Adiciona o produto com a quantidade mínima (se já estiver, não muda nada). */
export function addItem(items: BagItem[], product: BagProduct): BagItem[] {
  if (items.some((i) => i.slug === product.slug)) return items;
  return [...items, { ...product, qty: clamp(Math.max(1, product.minQty)) }];
}

/** Define a quantidade; abaixo do mínimo o produto sai da sacola. */
export function setQty(items: BagItem[], slug: string, qty: number): BagItem[] {
  return items.flatMap((i) => {
    if (i.slug !== slug) return [i];
    return qty < i.minQty ? [] : [{ ...i, qty: clamp(qty) }];
  });
}

export const removeItem = (items: BagItem[], slug: string) => items.filter((i) => i.slug !== slug);

export const totalUnits = (items: BagItem[]) => items.reduce((n, i) => n + i.qty, 0);

/** Valor da linha (preço × quantidade); null se o produto não tem preço. */
export const lineCents = (i: BagItem) => (i.priceCents == null ? null : i.priceCents * i.qty);

/** Total estimado: só existe quando TODOS os produtos da sacola têm preço (senão, null). */
export function totalCents(items: BagItem[]): number | null {
  if (!items.length || items.some((i) => i.priceCents == null)) return null;
  return items.reduce((n, i) => n + i.priceCents! * i.qty, 0);
}

export const countLabel = (n: number) => (n === 1 ? '1 produto' : `${n} produtos`);

/** "2026-12-12" (campo date) → "12/12/2026"; qualquer outra coisa volta como veio. */
export function formatDate(value: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  return m ? `${m[3]}/${m[2]}/${m[1]}` : value.trim();
}

export interface BagForm {
  name?: string;
  when?: string;
  notes?: string;
}

/** Mensagem do pedido. Linhas vazias não entram; o início vem do admin (Contato e WhatsApp). */
export function buildBagMessage(items: BagItem[], form: BagForm = {}, start?: string) {
  const head = start?.trim() || DEFAULT_BAG_START;
  const lines = [
    head,
    '',
    ...items.map((i) => {
      const line = lineCents(i);
      return `• ${i.qty} × ${i.name}${line == null ? '' : ` — ${formatBRL(line)}`}`;
    }),
  ];
  const total = totalCents(items);
  if (total != null) lines.push('', `Total estimado: ${formatBRL(total)}`);
  const extra = [
    form.name?.trim() && `Nome: ${form.name.trim()}`,
    form.when?.trim() && `Para quando: ${formatDate(form.when)}`,
    form.notes?.trim() && `Observações: ${form.notes.trim()}`,
  ].filter(Boolean) as string[];
  if (extra.length) lines.push('', ...extra);
  return lines.join('\n');
}

/* ---------------- persistência (localStorage, 7 dias) ---------------- */
interface Stored {
  savedAt: number;
  items: BagItem[];
}

const isItem = (v: unknown): v is BagItem => {
  if (!v || typeof v !== 'object') return false;
  const i = v as Record<string, unknown>;
  return (
    typeof i.slug === 'string' &&
    typeof i.name === 'string' &&
    typeof i.icon === 'string' &&
    typeof i.meta === 'string' &&
    typeof i.minQty === 'number' &&
    typeof i.qty === 'number' &&
    i.qty >= 1 &&
    (i.priceCents === undefined || i.priceCents === null || typeof i.priceCents === 'number') &&
    (i.image === null || typeof i.image === 'string')
  );
};

/** Lê a sacola guardada; vencida (> 7 dias), inválida ou sem storage → vazia. */
export function loadBag(now = Date.now()): BagItem[] {
  try {
    const raw = window.localStorage.getItem(BAG_STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Partial<Stored>;
    if (typeof data.savedAt !== 'number' || now - data.savedAt > BAG_TTL_MS) {
      window.localStorage.removeItem(BAG_STORAGE_KEY);
      return [];
    }
    // sacolas guardadas antes do preço existir não têm `priceCents`: valem como "a combinar"
    return Array.isArray(data.items)
      ? data.items.filter(isItem).map((i) => ({ ...i, priceCents: i.priceCents ?? null }))
      : [];
  } catch {
    return [];
  }
}

/** Guarda a sacola (vazia apaga a chave). Falha de storage é ignorada. */
export function saveBag(items: BagItem[], now = Date.now()) {
  try {
    if (!items.length) window.localStorage.removeItem(BAG_STORAGE_KEY);
    else window.localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify({ savedAt: now, items }));
  } catch {
    /* modo privado / storage bloqueado: a sacola vale só nesta visita */
  }
}
