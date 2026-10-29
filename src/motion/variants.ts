import type { Variants } from 'framer-motion';
import { dur, ease, move } from './tokens';

/** `custom` = atraso em segundos (o Reveal já aplica i × stagger, no máximo 6 itens). */
const delayOf = (seconds = 0) => seconds;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: move.md },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: dur.slow, ease: ease.enter, delay: delayOf(delay) },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: dur.slow, ease: ease.enter, delay: delayOf(delay) },
  }),
};

/** Imagens e faixas: fade + 0.96 → 1. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: dur.slow, ease: ease.enter, delay: delayOf(delay) },
  }),
};

/** Carimbo (overshoot): selos, marcos, pata. Nunca em textos. */
export const stamp: Variants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -20 },
  show: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: dur.slow, ease: ease.stamp, delay: delayOf(delay) },
  }),
};

/** Container: só propaga hidden/show; o atraso de cada item vem de `custom`. */
export const stagger: Variants = { hidden: {}, show: {} };

/** reduced-motion: só fade de 150ms, sem deslocamento nem escala. */
export const reducedFade: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.15, ease: 'linear', y: { duration: 0 }, scale: { duration: 0 } },
  },
};

export const effects = { up: fadeUp, fade: fadeIn, scale: scaleIn } as const;
export type RevealEffect = keyof typeof effects;
