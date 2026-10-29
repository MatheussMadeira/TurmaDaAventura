'use client';

import type { ReactNode } from 'react';
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion';

/** LazyMotion + domAnimation (entradas, variants, gestos; ~15 KB) e reduced-motion do usuário respeitado.
 *  Animações de layout (layout/layoutId) exigem domMax: use <LayoutMotion> só onde precisar. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
