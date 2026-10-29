'use client';

import type { ElementType, ReactNode } from 'react';
import styled from 'styled-components';

const Hidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
`;

export interface VisuallyHiddenProps {
  as?: ElementType;
  children: ReactNode;
  role?: string;
  'aria-live'?: 'polite' | 'assertive';
}

/** Texto só para leitores de tela (ex.: "Mostrando 4 atividades" depois de filtrar). */
export function VisuallyHidden({ as, children, ...rest }: VisuallyHiddenProps) {
  return (
    <Hidden as={as} {...rest}>
      {children}
    </Hidden>
  );
}
