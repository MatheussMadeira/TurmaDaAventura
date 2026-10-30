'use client';

import type { ReactNode } from 'react';
import { LazyMotion } from 'framer-motion';

/* domMax = domAnimation + animações de layout. Importado dinamicamente: o chunk só é baixado
   quando um <LayoutMotion> monta (hoje, só na rota /oficinas). */
const loadDomMax = () => import('./features').then((m) => m.default);

/** Habilita `layout`/`layoutId` na subárvore (aninha sobre o LazyMotion do MotionProvider). */
export function LayoutMotion({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadDomMax} strict>
      {children}
    </LazyMotion>
  );
}
