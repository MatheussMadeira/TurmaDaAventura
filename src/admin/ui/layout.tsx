'use client';

import type { ReactNode } from 'react';
import styled from 'styled-components';
import { media } from '@/design-system/media';

/* Blocos de layout do painel: mesma marca do site, versão mais densa (fundo sunken, blocos raised). */

export const PageTop = ({
  crumb,
  title,
  actions,
}: {
  crumb?: ReactNode;
  title: string;
  actions?: ReactNode;
}) => (
  <Top>
    <div>
      {crumb ? <Crumb>{crumb}</Crumb> : null}
      <Title>{title}</Title>
    </div>
    {actions ? <Actions>{actions}</Actions> : null}
  </Top>
);

const Top = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
`;
const Crumb = styled.p`
  margin: 0 0 var(--space-1);
  font: 700 14px/18px var(--font-body);
  color: var(--ink-muted);

  a {
    color: inherit;
  }
`;
const Title = styled.h1`
  margin: 0;
  font: 700 32px/38px var(--font-display);
  letter-spacing: -0.01em;
  color: var(--ink);
  font-variation-settings:
    'opsz' 36,
    'SOFT' 100;

  ${media.down('bp-sm')} {
    font-size: 26px;
    line-height: 32px;
  }
`;
const Actions = styled.div`
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  align-items: center;
`;

export const Box = styled.section<{ $flush?: boolean }>`
  background: var(--surface-raised);
  border: var(--border-thin) solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: ${({ $flush }) => ($flush ? '0' : 'var(--space-5)')};
  ${({ $flush }) => $flush && 'overflow: hidden;'}
  display: flex;
  flex-direction: column;
  gap: ${({ $flush }) => ($flush ? '0' : 'var(--space-4)')};
  min-width: 0;
`;

export const BoxHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
`;
export const BoxTitle = styled.h2`
  margin: 0;
  font: 700 20px/26px var(--font-display);
  color: var(--ink);
  font-variation-settings:
    'opsz' 36,
    'SOFT' 100;
`;
export const BoxSub = styled.p`
  margin: 0;
  font: 400 15px/22px var(--font-body);
  color: var(--ink-muted);
`;

export const Cols = styled.div<{ $n?: 2 | 3 | 4; $form?: boolean }>`
  display: grid;
  gap: var(--space-5);
  align-items: start;
  grid-template-columns: ${({ $form, $n = 2 }) =>
    $form ? 'minmax(0, 1.25fr) minmax(0, 1fr)' : `repeat(${$n}, minmax(0, 1fr))`};

  ${media.down('bp-lg')} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Fields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
  align-items: start;

  .full {
    grid-column: 1 / -1;
  }
  ${media.down('bp-sm')} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Stack = styled.div<{ $gap?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => $gap ?? 'var(--space-5)'};
  min-width: 0;
`;

export const Row = styled.div`
  display: flex;
  gap: var(--space-3);
  align-items: center;
  flex-wrap: wrap;
`;

/** Contador de caracteres sob o campo: "21/50". */
export function Count({ value, max }: { value: string; max: number }) {
  const n = [...value].length;
  return (
    <CountText data-warn={n > max * 0.9} aria-live="polite">
      <span>
        {n}/{max}
      </span>
    </CountText>
  );
}
const CountText = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: -2px;
  font: 600 13px/18px var(--font-body);
  color: var(--ink-muted);
  &[data-warn='true'] {
    color: var(--warning);
  }
`;

export const Sticky = styled.div`
  position: sticky;
  top: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  ${media.down('bp-lg')} {
    position: static;
  }
`;

export const VisuallyOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
`;
