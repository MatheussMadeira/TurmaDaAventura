'use client';

import type { ReactNode } from 'react';
import styled from 'styled-components';
import { media } from '@/design-system/media';

type Tone = 'raised' | 'earth' | 'sunken';
type Shadow = 'stamp' | 'sm' | 'none';

export interface PanelProps {
  /** raised = cartão claro · earth = painel de terra (Restaurantes) · sunken = fundo afundado (Trail) */
  tone?: Tone;
  /** stamp = "cartão de expedição" (padrão) · sm = discreta · none */
  shadow?: Shadow;
  /** lg = 64px (painéis de destaque) · md = 48px 32px (painéis de conteúdo) */
  padding?: 'md' | 'lg';
  className?: string;
  children?: ReactNode;
}

const backgrounds: Record<Tone, string> = {
  raised: 'var(--surface-raised)',
  earth: 'var(--surface-earth)',
  sunken: 'var(--surface-sunken)',
};
const shadows: Record<Shadow, string> = {
  stamp: 'var(--shadow-stamp-card)',
  sm: 'var(--shadow-sm)',
  none: 'none',
};

const Root = styled.div<{ $tone: Tone; $shadow: Shadow; $padding: 'md' | 'lg' }>`
  position: relative;
  overflow: hidden;
  background: ${({ $tone }) => backgrounds[$tone]};
  border: var(--border-thin) solid
    ${({ $tone }) => ($tone === 'raised' ? 'var(--line)' : 'transparent')};
  border-radius: var(--radius-xl);
  padding: ${({ $padding }) => ($padding === 'lg' ? 'var(--space-8)' : 'var(--space-7) var(--space-6)')};
  box-shadow: ${({ $shadow }) => shadows[$shadow]};

  ${media.down('bp-md')} {
    padding: var(--space-6) var(--space-5);
    border-radius: var(--radius-lg);
  }
`;

export function Panel({
  tone = 'raised',
  shadow = 'stamp',
  padding = 'lg',
  className,
  children,
}: PanelProps) {
  return (
    <Root $tone={tone} $shadow={shadow} $padding={padding} className={className}>
      {children}
    </Root>
  );
}
