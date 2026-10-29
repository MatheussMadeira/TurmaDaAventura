import styled from 'styled-components';
import { media } from '@/design-system/media';
import { Reveal } from '@/motion/Reveal';
const tones = {
  brand: 'background: var(--brand-soft); color: var(--brand);',
  earth: 'background: var(--earth-soft); color: var(--earth-strong);',
  olive: 'background: var(--olive-soft); color: var(--olive);',
} as const;

export const Grid = styled(Reveal)<{ $columns: 2 | 3 }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  gap: var(--space-6);
  list-style: none;
  margin: 0;
  padding: 0;

  ${media.down('bp-lg')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  ${media.down('bp-md')} {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-5);
  }
`;

export const Feature = styled.div`
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
`;

/* Selo 52px com raio 16/16/16/4, como o ícone do ServiceCard. */
export const Seal = styled.span<{ $tone: keyof typeof tones }>`
  flex: none;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 16px 16px 16px 4px;
  ${({ $tone }) => tones[$tone]}
`;

export const Title = styled.h3`
  margin: 0 0 var(--space-1);
  color: var(--ink);
  font-family: var(--font-display);
`;
export const Text = styled.p`
  margin: 0;
  color: var(--ink-muted);
`;
