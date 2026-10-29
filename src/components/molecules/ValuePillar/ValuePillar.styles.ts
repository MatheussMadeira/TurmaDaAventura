import styled, { keyframes } from 'styled-components';
import { media } from '@/design-system/media';

export type PillarTone = 'brand' | 'olive' | 'earth';

const ring = keyframes`
  0% { box-shadow: 0 0 0 0 currentColor; opacity: 0.5; }
  100% { box-shadow: 0 0 0 22px currentColor; opacity: 0; }
`;

const tones: Record<PillarTone, string> = {
  brand: '',
  earth: `background: var(--earth); color: var(--on-earth); box-shadow: 0 0 0 6px var(--earth-soft);`,
  olive: `background: var(--olive); color: var(--surface-raised); box-shadow: 0 0 0 6px var(--olive-soft);`,
};
const ringColor: Record<PillarTone, string> = {
  brand: 'var(--brand)',
  olive: 'var(--olive)',
  earth: 'var(--earth)',
};

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

/* Selo carimba (scale .7 → 1, overshoot) e o anel se expande como pegada na lama. */
export const Badge = styled.span<{ $tone: PillarTone; $index: number }>`
  position: relative;
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin-bottom: var(--space-2);
  color: var(--on-brand);
  background: var(--brand);
  box-shadow: 0 0 0 6px var(--brand-soft);
  ${({ $tone }) => tones[$tone]}

  transform: scale(0.7);
  opacity: 0;
  transition:
    transform var(--dur-slow) var(--ease-stamp),
    opacity var(--dur-fast) linear;
  transition-delay: ${({ $index }) => $index * 160}ms;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    color: ${({ $tone }) => ringColor[$tone]};
    opacity: 0;
  }

  [data-visible='true'] > & {
    transform: none;
    opacity: 1;
  }
  [data-visible='true'] > &::after {
    animation: ${ring} 900ms var(--ease-exit) both;
    animation-delay: ${({ $index }) => $index * 160 + 200}ms;
  }

  ${media.reducedMotion} {
    transition-duration: 1ms;
    transition-delay: 0s;
    &::after {
      animation: none !important;
    }
  }
`;

export const Num = styled.p`
  margin: 0;
  color: var(--earth-strong);
`;
export const Title = styled.h3`
  margin: 0;
  font-family: var(--font-display);
  color: var(--ink);
`;
export const Text = styled.p`
  margin: 0;
  color: var(--ink-muted);
`;
