import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Roda o axe-core num trecho renderizado. jsdom não calcula layout/cores, então
 * color-contrast fica de fora (contraste dos pares de token está documentado no
 * design system); regras de página inteira não se aplicam a componentes isolados.
 */
export async function expectNoA11yViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
      region: { enabled: false },
      'landmark-one-main': { enabled: false },
      'page-has-heading-one': { enabled: false },
    },
  });
  expect(
    results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`),
  ).toEqual([]);
}
