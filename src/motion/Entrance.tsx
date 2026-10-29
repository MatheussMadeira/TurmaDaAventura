'use client';

import type { CSSProperties, ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';

const inUp = keyframes`
  from { opacity: 0.01; transform: translateY(var(--move-md)); }
  to { opacity: 1; transform: none; }
`;

const Root = styled.div<{ $delay: number }>`
  animation: ${inUp} var(--dur-slow) var(--ease-enter) both;
  animation-delay: ${({ $delay }) => $delay}ms;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export interface EntranceProps {
  /** atraso em ms (ex.: 0, 80, 160 …) */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Entrada ao carregar para blocos ACIMA da dobra, em CSS puro (como o Hero): o HTML do servidor
 * já vem visível e a animação roda sem esperar a hidratação. Começa em opacity 0.01 (e não 0)
 * de propósito: com 0 o Chrome não considera o texto como candidato a LCP.
 * Abaixo da dobra, use <Reveal>.
 */
export function Entrance({ delay = 0, className, style, children }: EntranceProps) {
  return (
    <Root $delay={delay} className={className} style={style}>
      {children}
    </Root>
  );
}
