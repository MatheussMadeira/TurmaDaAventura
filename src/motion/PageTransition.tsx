'use client';

import { useEffect, type ReactNode } from 'react';
import { m } from 'framer-motion';
import { dur, ease, move } from './tokens';

/* A primeira carga não anima (o servidor já entrega o HTML visível, sem "pisca");
   as navegações seguintes entram com y +12 → 0 + fade. Header e rodapé ficam fora do template. */
let hasNavigated = false;

export function PageTransition({ children }: { children: ReactNode }) {
  const animate = hasNavigated;
  useEffect(() => {
    hasNavigated = true;
  }, []);

  return (
    <m.main
      id="conteudo"
      initial={animate ? { opacity: 0, y: move.sm } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur.medium, ease: ease.enter }}
    >
      {children}
    </m.main>
  );
}
