import styled, { keyframes } from 'styled-components';
import { media } from '@/design-system/media';

/* Sequência ao carregar em CSS (não espera hidratação): textos 0/80/160/240/320ms,
   foto 120ms, moldura 220ms, pata 480ms. */
const inUp = keyframes`
  from { opacity: 0; transform: translateY(var(--move-md)); }
  to { opacity: 1; transform: none; }
`;
const photoIn = keyframes`
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: none; }
`;
const frameIn = keyframes`
  from { opacity: 0; transform: translate(0, 0); }
  to { opacity: 1; transform: translate(12px, 12px); }
`;
const pawStamp = keyframes`
  from { opacity: 0; transform: scale(0.6) rotate(-2deg); }
  to { opacity: 1; transform: scale(1) rotate(18deg); }
`;

export const Root = styled.section<{ $forest: boolean }>`
  container: tda-hero / inline-size;
  position: relative;
  overflow: hidden;
  background: ${({ $forest }) => ($forest ? 'var(--surface-forest)' : 'var(--surface)')};
`;

export const Inner = styled.div`
  position: relative;
  max-width: var(--container);
  margin: 0 auto;
  padding: var(--space-9) var(--space-5);
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: var(--space-8);
  align-items: center;

  @container tda-hero (max-width: 899px) {
    grid-template-columns: 1fr;
    padding: var(--space-7) var(--space-4) var(--space-8);
    gap: var(--space-7);
  }
`;

export const Copy = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  & > * {
    animation: ${inUp} var(--dur-slow) var(--ease-enter) both;
    animation-delay: calc(var(--i, 0) * var(--stagger));
  }
  ${media.reducedMotion} {
    & > * {
      animation: none;
    }
  }
`;

export const Overline = styled.p<{ $forest: boolean }>`
  margin: 0;
  color: ${({ $forest }) => ($forest ? 'var(--caqui-200)' : 'var(--earth-strong)')};
`;

export const Title = styled.h1<{ $forest: boolean }>`
  margin: 0;
  font-family: var(--font-display);
  color: ${({ $forest }) => ($forest ? 'var(--ink-on-forest)' : 'var(--brand)')};

  @container tda-hero (max-width: 899px) {
    font-size: 40px;
    line-height: 44px;
  }
`;

export const Lead = styled.p<{ $forest: boolean }>`
  margin: 0;
  max-width: 34em;
  color: ${({ $forest }) => ($forest ? 'var(--ink-on-forest-muted)' : 'var(--ink-muted)')};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-3);

  @container tda-hero (max-width: 899px) {
    & > a {
      width: 100%;
    }
  }
`;

export const Highlights = styled.ul<{ $forest: boolean }>`
  list-style: none;
  margin: var(--space-3) 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-5);

  li {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font: 700 15px/20px var(--font-body);
    color: ${({ $forest }) => ($forest ? 'var(--ink-on-forest-muted)' : 'var(--ink)')};
  }
  svg {
    color: ${({ $forest }) => ($forest ? 'var(--caqui-200)' : 'var(--brand)')};
  }
`;

/* Foto entra 0.96 → 1; a moldura deslocada (pseudo-elemento) desliza para (12px, 12px). */
const photoRadius = 'var(--radius-xl) var(--radius-xl) var(--radius-xl) 8px';

export const Visual = styled.div<{ $forest: boolean }>`
  position: relative;
  isolation: isolate;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: ${photoRadius};
    background: ${({ $forest }) =>
      $forest ? 'color-mix(in srgb, var(--caqui-200) 25%, transparent)' : 'var(--caqui-200)'};
    transform: translate(12px, 12px);
    animation: ${frameIn} var(--dur-slow) var(--ease-enter) 220ms both;
  }
  [data-theme='noite'] &::before {
    ${({ $forest }) => !$forest && 'background: var(--noite-700);'}
  }

  [data-media] {
    border-radius: ${photoRadius};
    animation: ${photoIn} var(--dur-slow) var(--ease-enter) 120ms both;
  }

  ${media.reducedMotion} {
    &::before,
    [data-media] {
      animation: none;
    }
  }
`;

export const Paw = styled.span<{ $forest: boolean }>`
  position: absolute;
  width: 84px;
  right: -18px;
  top: -36px;
  transform: rotate(18deg);
  --tda-logo-h: auto;
  animation: ${pawStamp} var(--dur-slow) var(--ease-stamp) 480ms both;

  img {
    width: 100%;
    height: auto;
  }

  @container tda-hero (max-width: 899px) {
    width: 60px;
    right: 4px;
    top: -28px;
  }
  ${media.reducedMotion} {
    animation: none;
  }
`;
