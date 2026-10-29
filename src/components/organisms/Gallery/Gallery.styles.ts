import styled from 'styled-components';
import { media } from '@/design-system/media';
import { Reveal } from '@/motion/Reveal';

export const Grid = styled(Reveal)`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: 200px;
  gap: var(--space-4);

  & > * {
    position: relative;
    min-height: 0;
  }
  & [data-media] {
    height: 100%;
    min-height: 0;
  }
  & > :nth-child(1) {
    grid-column: span 2;
    grid-row: span 2;
  }
  & > :nth-child(3) {
    grid-row: span 2;
  }
  & > :nth-child(5),
  & > :nth-child(6) {
    grid-column: span 2;
  }

  ${media.down('bp-md')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: 150px;
    gap: var(--space-3);

    & > :nth-child(3) {
      grid-row: span 1;
    }
  }
`;
