/**
 * Dinheiro em centavos (inteiro). Só produtos têm preço; o site nunca cobra: o pedido é fechado
 * no WhatsApp.
 */
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** 1290 → "R$ 12,90" */
export const formatBRL = (cents: number) => BRL.format(cents / 100);

/** Preço máximo aceito: R$ 99.999,99 */
export const MAX_PRICE_CENTS = 9_999_999;

/**
 * Texto do campo do admin → centavos. Vazio = null (sem preço); texto inválido = NaN (o schema
 * recusa). Aceita "12,90", "12.90", "1.290,50", "R$ 12,90" e "12".
 */
export function parsePriceInput(raw: string): number | null {
  const s = raw.replace(/R\$/gi, '').replace(/\s/g, '');
  if (s === '') return null;
  // "1.290,50" (milhar com ponto) ou "12,90" / "12.90" (decimal)
  const normalized = /,/.test(s) ? s.replace(/\./g, '').replace(',', '.') : s;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return Number.NaN;
  return Math.round(Number(normalized) * 100);
}

/** Centavos → texto do campo do admin: 1290 → "12,90"; null → "". */
export const priceToInput = (cents: number | null | undefined) =>
  cents == null ? '' : (cents / 100).toFixed(2).replace('.', ',');

/** Valor sem moeda para dados estruturados: 1290 → "12.90" */
export const priceToDecimal = (cents: number) => (cents / 100).toFixed(2);
