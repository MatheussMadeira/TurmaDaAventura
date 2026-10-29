'use client';

import styled from 'styled-components';
import { Logo } from '../../atoms/Logo';
import { media } from '@/design-system/media';

export interface RegionAnchorsProps {
  regions: { id: string; name: string; count: number }[];
  className?: string;
}

/* sem position: o ornamento se ancora na <section> (canto superior direito, como no canvas) */
const Nav = styled.nav`
  display: block;
`;

const List = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
`;

/* Chips-âncora: mesmo visual dos FilterChips, mas são links para a região. */
const Chip = styled.a`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--tap-min);
  padding: 0 var(--space-4);
  border-radius: var(--radius-pill);
  border: var(--border-thick) solid var(--line-strong);
  background: var(--surface-raised);
  color: var(--ink);
  font: 700 15px/20px var(--font-body);
  text-decoration: none;
  transition:
    border-color var(--dur-fast) var(--ease-standard),
    color var(--dur-fast) var(--ease-standard);

  &:hover {
    border-color: var(--brand);
    color: var(--brand);
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
  span {
    font-weight: 800;
    opacity: 0.8;
  }
`;

/* Pegadas decorativas no canto (alt vazio); somem no mobile. */
const Ornament = styled.span`
  position: absolute;
  right: 120px;
  top: 72px;
  width: 132px;
  transform: rotate(14deg);
  pointer-events: none;
  --tda-logo-h: auto;

  img {
    width: 100%;
    height: auto;
  }
  ${media.down('bp-lg')} {
    display: none;
  }
`;

export function RegionAnchors({ regions, className }: RegionAnchorsProps) {
  return (
    <Nav aria-label="Ir para a região" className={className}>
      <List>
        {regions.map((r) => (
          <Chip key={r.id} href={`#${r.id}`}>
            {r.name} <span>{r.count}</span>
          </Chip>
        ))}
      </List>
      <Ornament aria-hidden>
        <Logo variant="symbol" tone="auto" height={131} />
      </Ornament>
    </Nav>
  );
}
