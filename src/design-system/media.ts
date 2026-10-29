import { theme } from './tokens/theme';

type Breakpoint = keyof typeof theme.bp;

const px = (key: Breakpoint) => parseInt(theme.bp[key], 10);

/** Helpers de breakpoint (valores do tokens.json). `down` = abaixo do breakpoint (max-width: bp - 1). */
export const media = {
  up: (key: Breakpoint) => `@media (min-width: ${theme.bp[key]})`,
  down: (key: Breakpoint) => `@media (max-width: ${px(key) - 1}px)`,
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
  /** container query abaixo do breakpoint: `${media.containerDown('tda-header', 'bp-lg')} { … }` */
  containerDown: (name: string, key: Breakpoint) =>
    `@container ${name} (max-width: ${px(key) - 1}px)`,
} as const;
