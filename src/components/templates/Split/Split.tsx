'use client';

import type { ReactNode } from 'react';
import styled from 'styled-components';
import { media } from '@/design-system/media';

export interface SplitProps {
  /** proporção das colunas no desktop (grade de 12): 5/7, 7/5 ou 6/6 */
  ratio?: '5-7' | '7-5' | '6-6';
  /** alinhamento vertical das colunas */
  align?: 'start' | 'center';
  /** espaço entre as colunas; padrão space-6 */
  gap?: 'md' | 'lg';
  className?: string;
  children: ReactNode;
}

const columns = { '5-7': '5fr 7fr', '7-5': '7fr 5fr', '6-6': '1fr 1fr' } as const;

/* Duas colunas da grade de 12; abaixo de 1024px empilha. */
const Root = styled.div<{
  $ratio: keyof typeof columns;
  $align: 'start' | 'center';
  $gap: 'md' | 'lg';
}>`
  display: grid;
  grid-template-columns: ${({ $ratio }) => columns[$ratio]};
  gap: ${({ $gap }) => ($gap === 'lg' ? 'var(--space-8)' : 'var(--space-6)')};
  align-items: ${({ $align }) => $align};

  & > * {
    min-width: 0;
  }

  ${media.down('bp-lg')} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export function Split({
  ratio = '6-6',
  align = 'center',
  gap = 'md',
  className,
  children,
}: SplitProps) {
  return (
    <Root $ratio={ratio} $align={align} $gap={gap} className={className}>
      {children}
    </Root>
  );
}
