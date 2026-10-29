'use client';

import type { ReactNode } from 'react';
import { LazyMotion, MotionConfig } from 'framer-motion';

/* Features sob demanda: as animações de layout (FilterChips, sublinhado do Header) exigem domMax —
   com domAnimation, `layout`/`layoutId` seriam ignorados em silêncio. */
const loadFeatures = () => import('./features').then((m) => m.default);

/** LazyMotion (features assíncronas) + reduced-motion do usuário respeitado em todo o site. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
