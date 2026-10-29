import styled, { keyframes } from 'styled-components';
import { media } from '@/design-system/media';

export type CamoTone = 'full' | 'soft' | 'forest';

export const Svg = styled.svg<{ $tone: CamoTone }>`
  display: block;
  width: 100%;
  height: 100%;

  .ground {
    fill: ${({ $tone }) =>
      $tone === 'soft'
        ? 'var(--surface-sunken)'
        : $tone === 'forest'
          ? 'var(--surface-forest)'
          : 'var(--caqui-200)'};
  }
  .camo-1 {
    fill: var(--camo-1);
  }
  .camo-2 {
    fill: var(--camo-2);
  }
  .camo-3 {
    fill: var(--camo-3);
  }
  .camo-4 {
    fill: var(--camo-4);
  }
  ${({ $tone }) => $tone === 'soft' && 'path { opacity: 0.28; }'}
  ${({ $tone }) => $tone === 'forest' && 'path { opacity: 0.22; }'}
`;

const drift = keyframes`
  from { transform: translate(0, 0); }
  to { transform: translate(-20px, 12px); }
`;

/* Camuflagem viva: o padrão passeia (0,0) → (−20px, 12px) em dur-ambient, alternando. Pausa fora da tela. */
export const Backdrop = styled.div<{ $paused: boolean }>`
  position: absolute;
  inset: 0;
  overflow: hidden;

  & > svg {
    position: absolute;
    inset: -24px;
    width: calc(100% + 48px);
    height: calc(100% + 48px);
    animation: ${drift} var(--dur-ambient) var(--ease-standard) infinite alternate;
    animation-play-state: ${({ $paused }) => ($paused ? 'paused' : 'running')};
  }

  ${media.reducedMotion} {
    & > svg {
      animation: none;
    }
  }
`;
