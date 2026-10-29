'use client';

import { useInView as useFramerInView } from 'framer-motion';
import type { RefObject } from 'react';
import { reveal } from './tokens';

interface Options {
  /** fração visível que dispara; padrão 0.2 */
  amount?: number;
  /** true = dispara uma vez e fica verdadeiro (padrão) */
  once?: boolean;
}

/** `true` quando `amount` do elemento entra na viewport. Com `once: false` volta a false ao sair (loops fora da tela). */
export function useInView(
  ref: RefObject<Element | null>,
  { amount = reveal.amount, once = reveal.once }: Options = {},
) {
  return useFramerInView(ref, { amount, once, margin: '0px 0px -40px 0px' });
}
