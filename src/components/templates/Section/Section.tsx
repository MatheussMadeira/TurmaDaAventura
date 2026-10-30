'use client';

import type { ReactNode } from 'react';
import styled from 'styled-components';
import { media } from '@/design-system/media';

export interface SectionProps {
  /** valor de data-section, igual ao canvas: "Inicio/Hero", "Oficinas/Catalogo"… */
  name: string;
  /** fundo: default = surface · sunken · earth · raised */
  tone?: 'default' | 'sunken' | 'earth' | 'raised';
  /** sem respiro em cima (seções coladas, ex.: CTA depois de outra seção) */
  tight?: boolean;
  /** abertura de página sem hero: respiro de 96px em cima e 64px embaixo */
  intro?: boolean;
  /** espaço entre os blocos internos; padrão 48px (space-7) */
  gap?: 'md' | 'lg';
  /** padding vertical reduzido (faixas de logos) */
  compact?: boolean;
  id?: string;
  /** rótulo acessível quando a seção não tem título visível */
  'aria-label'?: string;
  className?: string;
  children: ReactNode;
}

const backgrounds = {
  default: '',
  sunken: 'background: var(--surface-sunken);',
  earth: 'background: var(--surface-earth);',
  raised: 'background: var(--surface-raised);',
} as const;

/* Seção: 96px (desktop) / 64px (mobile) de respiro, container de 1200px, gutter 24px / 16px. */
const Root = styled.section<{
  $tone: keyof typeof backgrounds;
  $tight: boolean;
  $intro: boolean;
  $compact: boolean;
}>`
  position: relative;
  padding: ${({ $compact }) => ($compact ? 'var(--space-8)' : 'var(--space-9)')} var(--space-5)
    ${({ $intro, $compact }) => ($compact || $intro ? 'var(--space-8)' : 'var(--space-9)')};
  ${({ $tone }) => backgrounds[$tone]}
  ${({ $tight }) => $tight && 'padding-top: 0;'}

  ${media.down('bp-md')} {
    padding: var(--space-8) var(--space-4)
      ${({ $intro, $compact }) => ($intro && !$compact ? 'var(--space-7)' : 'var(--space-8)')};
    ${({ $tight }) => $tight && 'padding-top: 0;'}
  }
`;

const Wrap = styled.div<{ $gap: 'md' | 'lg' }>`
  max-width: var(--container);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => ($gap === 'lg' ? 'var(--space-8)' : 'var(--space-7)')};

  ${media.down('bp-md')} {
    gap: ${({ $gap }) => ($gap === 'lg' ? 'var(--space-7)' : 'var(--space-6)')};
  }
`;

export function Section({
  name,
  tone = 'default',
  tight = false,
  intro = false,
  gap = 'md',
  compact = false,
  id,
  className,
  children,
  ...aria
}: SectionProps) {
  return (
    <Root
      data-section={name}
      id={id}
      $tone={tone}
      $tight={tight}
      $intro={intro}
      $compact={compact}
      className={className}
      aria-label={aria['aria-label']}
    >
      <Wrap $gap={gap}>{children}</Wrap>
    </Root>
  );
}
