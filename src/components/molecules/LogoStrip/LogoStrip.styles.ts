import styled from 'styled-components';
import { media } from '@/design-system/media';
import { Reveal } from '@/motion/Reveal';

export const Grid = styled(Reveal)`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: var(--space-4);
  list-style: none;
  margin: 0;
  padding: 0;

  ${media.down('bp-lg')} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  ${media.down('bp-md')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const Cell = styled.div`
  position: relative;
  display: grid;
  place-items: center;
  height: 88px;
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  border: var(--border-thin) dashed var(--line-strong);
  color: var(--ink-subtle);
  font: 700 14px/18px var(--font-body);
  letter-spacing: 0.04em;
`;
