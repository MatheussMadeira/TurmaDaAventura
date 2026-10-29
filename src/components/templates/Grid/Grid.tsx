'use client';

import type { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { media } from '@/design-system/media';
import { Reveal } from '@/motion/Reveal';

export interface GridProps {
  /** colunas no desktop: 3 → 2 → 1 (1024/768); 4 → 2 → 1; 2 → 1 (768) */
  cols?: 2 | 3 | 4;
  /** entrada escalonada ao rolar (padrão); desligue quando os filhos já têm animação própria */
  reveal?: boolean;
  className?: string;
  children: ReactNode;
}

const colsCss = css<{ $cols: 2 | 3 | 4 }>`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols}, minmax(0, 1fr));
  gap: var(--space-6);

  ${media.down('bp-lg')} {
    ${({ $cols }) => $cols > 2 && 'grid-template-columns: repeat(2, minmax(0, 1fr));'}
  }
  ${media.down('bp-md')} {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-5);
  }
`;

const PlainCols = styled.div<{ $cols: 2 | 3 | 4 }>`
  ${colsCss}
`;
const RevealCols = styled(Reveal)<{ $cols: 2 | 3 | 4 }>`
  ${colsCss}
`;

export function Grid({ cols = 3, reveal = true, className, children }: GridProps) {
  return reveal ? (
    <RevealCols $cols={cols} stagger className={className}>
      {children}
    </RevealCols>
  ) : (
    <PlainCols $cols={cols} className={className}>
      {children}
    </PlainCols>
  );
}
