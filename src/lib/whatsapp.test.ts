import { describe, expect, it } from 'vitest';
import { buildQuoteMessage, messageForPath, whatsappUrl } from './whatsapp';

describe('whatsapp', () => {
  it('monta o link wa.me só com dígitos e mensagem codificada', () => {
    expect(whatsappUrl('Olá! Quero orçamento.', '+55 (11) 99999-9999')).toBe(
      'https://wa.me/5511999999999?text=Ol%C3%A1!%20Quero%20or%C3%A7amento.',
    );
    expect(whatsappUrl(undefined, '5511999999999')).toBe('https://wa.me/5511999999999');
  });

  it('usa a mensagem contextual de cada rota', () => {
    expect(messageForPath('/oficina')).toBe('Olá! Quero saber mais sobre a Oficina.');
    expect(messageForPath('/eventos-corporativos')).toContain('evento corporativo');
    expect(messageForPath('/rota-desconhecida')).toBe('Olá! Vim pelo site e quero saber mais.');
    expect(messageForPath(null)).toBe('Olá! Vim pelo site e quero saber mais.');
  });

  it('inclui só os campos preenchidos e nenhum preço', () => {
    const msg = buildQuoteMessage({ nome: 'Ana', tipo: 'Oficina', criancas: '12' });
    expect(msg).toContain('• Nome: Ana');
    expect(msg).toContain('• Nº de crianças: 12');
    expect(msg).not.toContain('Data');
    expect(msg).not.toMatch(/R\$/);
  });
});
