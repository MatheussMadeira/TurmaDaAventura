import { describe, expect, it } from 'vitest';
import { formatBRL, parsePriceInput, priceToDecimal, priceToInput } from './money';

const nb = (s: string) => s.replace(/ /g, ' ');

describe('dinheiro', () => {
  it('formata centavos em reais', () => {
    expect(nb(formatBRL(1290))).toBe('R$ 12,90');
    expect(nb(formatBRL(5))).toBe('R$ 0,05');
    expect(nb(formatBRL(129000))).toBe('R$ 1.290,00');
  });

  it('lê o campo do admin: vírgula, ponto, milhar e R$', () => {
    expect(parsePriceInput('12,90')).toBe(1290);
    expect(parsePriceInput('12.90')).toBe(1290);
    expect(parsePriceInput('12')).toBe(1200);
    expect(parsePriceInput('1.290,50')).toBe(129050);
    expect(parsePriceInput(' R$ 8,5 ')).toBe(850);
    expect(parsePriceInput('0,99')).toBe(99);
  });

  it('vazio = sem preço; texto inválido = NaN (o schema recusa)', () => {
    expect(parsePriceInput('')).toBeNull();
    expect(parsePriceInput('   ')).toBeNull();
    for (const bad of ['abc', '12,999', '1,2,3', '-5', '12 reais']) {
      expect(parsePriceInput(bad), bad).toBeNaN();
    }
  });

  it('volta para o texto do campo e para o JSON-LD', () => {
    expect(priceToInput(1290)).toBe('12,90');
    expect(priceToInput(null)).toBe('');
    expect(priceToDecimal(850)).toBe('8.50');
  });
});
