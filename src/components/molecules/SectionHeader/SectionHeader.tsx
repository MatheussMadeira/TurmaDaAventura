'use client';

import type { ReactNode } from 'react';
import { m, type Variants } from 'framer-motion';
import { dur, ease } from '@/motion/tokens';
import { Bar, Description, Overline, Root, Title } from './SectionHeader.styles';

export interface SectionHeaderProps {
  overline?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  /** 1 = título de página (h1), 2 = título de seção (padrão) */
  level?: 1 | 2;
  /** cores para surface-forest */
  onForest?: boolean;
  className?: string;
}

/* Dentro de um <Reveal>: o traço do overline desenha (+120ms), depois título (+80ms) e descrição (+160ms).
   Fora de um Reveal as variants não têm quem as dispare e tudo aparece normalmente. */
const bar: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: dur.slow, ease: ease.enter, delay: 0.12 } },
};
const fadeAfter = (delay: number): Variants => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: dur.slow, ease: ease.enter, delay } },
});

export function SectionHeader({
  overline,
  title,
  description,
  align = 'left',
  level = 2,
  onForest = false,
  className,
}: SectionHeaderProps) {
  return (
    <Root $align={align} $forest={onForest} className={className}>
      {overline ? (
        <Overline className="overline" $forest={onForest}>
          <Bar variants={bar} aria-hidden />
          <span style={{ textTransform: 'uppercase' }}>{overline}</span>
        </Overline>
      ) : null}
      <Title
        as={level === 1 ? m.h1 : m.h2}
        className={level === 1 ? 'h1' : 'h2'}
        $forest={onForest}
        variants={fadeAfter(0.08)}
      >
        {title}
      </Title>
      {description ? (
        <Description className="lead" $forest={onForest} variants={fadeAfter(0.16)}>
          {description}
        </Description>
      ) : null}
    </Root>
  );
}
