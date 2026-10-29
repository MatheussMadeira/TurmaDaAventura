import { css } from 'styled-components';
import { theme } from './tokens/theme';

/** Breakpoints do tokens.json. Mobile-first com `up`; `down` usa max-width (< breakpoint). */
const bp = theme.bp;

export const media = {
  up: (key: keyof typeof bp) => `@media (min-width: ${bp[key]})`,
  down: (key: keyof typeof bp) => `@media (max-width: ${parseInt(bp[key], 10) - 1}px)`,
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
} as const;

export { css };
