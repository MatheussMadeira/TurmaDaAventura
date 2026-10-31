import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PAGES } from '@/content/sections/schemas';
import { EVENT_TYPES } from '@/components/organisms/QuoteForm';
import { FOOTER_ITEMS, NAV_ITEMS } from './nav';
import { messageForPath } from './whatsapp';

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (n === 'generated' || n === 'node_modules') return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

describe('ajustes v2', () => {
  it('nenhuma menção a região/zona em src/ (código, textos e dados)', () => {
    const offenders = walk('src')
      .filter((f) => /\.(tsx?|json|css)$/.test(f) && !f.endsWith('ajustesV2.test.ts'))
      .filter((f) => /regi[aã]o|zona /i.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('menu: 7 itens com rótulos curtos; rodapé com nomes completos', () => {
    expect(NAV_ITEMS.map((i) => i.label)).toEqual([
      'Início',
      'Oficinas',
      'Festas',
      'Restaurantes',
      'Eventos',
      'Produtos',
      'Quem somos',
    ]);
    expect(FOOTER_ITEMS.map((i) => i.label)[2]).toBe('Festas e aniversários');
    expect(FOOTER_ITEMS.map((i) => i.label)[4]).toBe('Eventos corporativos');
    expect(FOOTER_ITEMS.map((i) => i.href)).toEqual(NAV_ITEMS.map((i) => i.href));
  });

  it('tipos do formulário na ordem pedida', () => {
    expect(EVENT_TYPES).toEqual([
      'Festa ou aniversário',
      'Restaurante (recreação fixa)',
      'Evento corporativo',
      'Oficinas',
      'Outro',
    ]);
  });

  it('mensagens do WhatsApp das páginas novas', () => {
    expect(messageForPath('/festas-e-aniversarios')).toBe(
      'Olá! Quero orçamento para uma festa de aniversário.',
    );
    expect(messageForPath('/oficinas')).toBe('Olá! Quero saber mais sobre as Oficinas.');
  });

  it('a rota /oficina existe só como redirect 301 para /oficinas', async () => {
    const mod = (await import(/* @vite-ignore */ '../../next.config.mjs' as string)) as {
      default: {
        redirects: () => Promise<
          { source: string; destination: string; statusCode?: number; permanent?: boolean }[]
        >;
      };
    };
    const rules = await mod.default.redirects();
    expect(rules).toContainEqual({ source: '/oficina', destination: '/oficinas', statusCode: 301 });
    expect(PAGES.map((p) => p.path)).not.toContain('/oficina');
    expect(PAGES.map((p) => p.path)).toContain('/oficinas');
    expect(PAGES.map((p) => p.path)).toContain('/festas-e-aniversarios');
  });
});
