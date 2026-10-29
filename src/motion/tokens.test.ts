import { describe, expect, it } from 'vitest';
import { dur, ease, move } from './tokens';
import { cssVars } from '@/design-system/tokens/cssVars';
import { theme } from '@/design-system/tokens/theme';

describe('tokens gerados', () => {
  it('expõe durações, curvas e distâncias do tokens.json', () => {
    expect(dur.fast).toBe(0.16);
    expect(dur.slow).toBe(0.5);
    expect(dur.stagger).toBe(0.08);
    expect(ease.stamp).toEqual([0.34, 1.56, 0.64, 1]);
    expect(move.md).toBe(24);
  });

  it('gera variáveis para os dois temas e resolve aliases', () => {
    expect(cssVars).toContain('[data-theme="noite"]');
    expect(cssVars).toContain('--surface: var(--areia-50);');
    expect(cssVars).toContain('--success: var(--brand);');
    expect(cssVars).toContain('--font-display: var(--font-fraunces)');
  });

  it('o tema só guarda referências var(--*)', () => {
    expect(theme.color.brand).toBe('var(--brand)');
    expect(theme.duration['dur-fast']).toBe('var(--dur-fast)');
    expect(theme.bp['bp-md']).toBe('768px');
  });
});
