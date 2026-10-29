'use client';

import styled from 'styled-components';

export interface RegionHeadingProps {
  name: string;
  /** quantidade de restaurantes da região */
  count: number;
  className?: string;
}

const Root = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-4);

  h2 {
    margin: 0;
    color: var(--ink);
  }
  /* linha tracejada da trilha entre o nome e a contagem */
  &::after {
    content: '';
    flex: 1;
    order: 3;
    border-top: var(--border-dash) dashed var(--earth);
    opacity: 0.5;
  }
  span {
    order: 4;
    color: var(--ink-muted);
    white-space: nowrap;
  }
`;

/** Título de região (h2) + linha tracejada + contagem. */
export function RegionHeading({ name, count, className }: RegionHeadingProps) {
  return (
    <Root className={className}>
      <h2 className="h3">{name}</h2>
      <span className="caption">
        {count} {count === 1 ? 'restaurante' : 'restaurantes'}
      </span>
    </Root>
  );
}
