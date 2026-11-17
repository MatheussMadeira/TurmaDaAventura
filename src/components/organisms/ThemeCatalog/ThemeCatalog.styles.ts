import styled, { keyframes } from 'styled-components';
import { media } from '@/design-system/media';
import { Reveal } from '@/motion/Reveal';

/* mesma grade 3 → 2 → 1 do template Grid (cards já entram escalonados pelo Reveal) */
export const Cards = styled(Reveal)`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-6);

  ${media.down('bp-lg')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  ${media.down('bp-md')} {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-5);
  }
`;

const fade = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const rise = keyframes`
  from { opacity: 0; transform: translateY(var(--move-md)) scale(0.97); }
  to { opacity: 1; transform: none; }
`;
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(var(--move-md)); }
  to { opacity: 1; transform: none; }
`;

/* <dialog> nativo: o navegador cuida do foco preso, do Esc e do ::backdrop. */
export const Dialog = styled.dialog`
  width: min(640px, calc(100% - 2 * var(--space-5)));
  max-height: calc(100dvh - 2 * var(--space-5));
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  overflow: visible;

  &::backdrop {
    background: var(--scrim);
    animation: ${fade} var(--dur-medium) var(--ease-enter) both;
  }
  &[open] > * {
    animation: ${rise} var(--dur-slow) var(--ease-enter) both;
  }

  /* celular: folha inferior */
  ${media.down('bp-md')} {
    width: 100%;
    max-width: none;
    margin: auto 0 0;

    &[open] > * {
      animation-name: ${slideUp};
    }
  }
  ${media.reducedMotion} {
    &[open] > *,
    &::backdrop {
      animation: ${fade} 150ms linear both;
    }
  }
`;

export const Card = styled.section`
  position: relative;
  max-height: calc(100dvh - 2 * var(--space-5));
  overflow-y: auto;
  border-radius: var(--radius-lg);
  background: var(--surface-raised);
  color: var(--ink);
  font-family: var(--font-body);
  box-shadow: var(--shadow-md);

  ${media.down('bp-md')} {
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
`;

export const Close = styled.button`
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  z-index: 2;
  display: grid;
  place-items: center;
  width: var(--tap-min);
  height: var(--tap-min);
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6);

  ${media.down('bp-md')} {
    padding: var(--space-5);
  }
`;

export const Overline = styled.p`
  margin: 0;
  color: var(--earth-strong);
`;

export const Title = styled.h2`
  margin: 0;
  font: 700 32px/38px var(--font-display);
  font-variation-settings:
    'opsz' 48,
    'SOFT' 100;

  ${media.down('bp-md')} {
    font-size: 26px;
    line-height: 32px;
  }
`;

export const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-2);

  p {
    margin: 0;
    white-space: pre-line;
    color: var(--ink-muted);
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-4);
`;
