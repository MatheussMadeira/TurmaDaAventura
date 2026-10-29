'use client';

import type { ReactNode } from 'react';
import styled from 'styled-components';

const Link = styled.a`
  position: fixed;
  left: var(--space-4);
  top: var(--space-3);
  z-index: var(--z-overlay);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--brand);
  color: var(--on-brand);
  font: 800 16px/20px var(--font-body);
  text-decoration: none;
  transform: translateY(-200%);

  &:focus-visible {
    transform: none;
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }
`;

/** Primeiro item da tabulação: pula o header e vai direto ao conteúdo (#conteudo). */
export function SkipLink({ children = 'Pular para o conteúdo' }: { children?: ReactNode }) {
  return <Link href="#conteudo">{children}</Link>;
}
