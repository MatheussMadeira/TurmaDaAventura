import { describe, expect, it } from 'vitest';
import { PAGES, parseSection } from '../sections/schemas';
import { DEFAULT_PAGES } from './pages';

describe('conteúdo padrão das seções', () => {
  it('cada página tem exatamente as seções da estrutura', () => {
    for (const page of PAGES) {
      expect(Object.keys(DEFAULT_PAGES[page.slug] ?? {}), page.slug).toEqual(
        page.sections.map((s) => s.key),
      );
    }
  });

  for (const page of PAGES) {
    for (const s of page.sections) {
      it(`${page.area}/${s.name} passa no schema "${s.type}"`, () => {
        const def = DEFAULT_PAGES[page.slug]![s.key]!;
        expect(def.type).toBe(s.type);
        const r = parseSection(s.type, def.content);
        expect(
          r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
        ).toEqual([]);
      });
    }
  }

  it('nenhum texto menciona preço', () => {
    expect(JSON.stringify(DEFAULT_PAGES)).not.toMatch(/R\$|\d\s*reais|a partir de r\$/i);
  });

  it('limites de caracteres são aplicados', () => {
    const r = parseSection('cta', { title: 'x'.repeat(61), text: '', ctaLabel: 'ok' });
    expect(r.success).toBe(false);
  });
});
