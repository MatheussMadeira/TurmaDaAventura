import styled, { css, keyframes } from 'styled-components';
import { media } from '@/design-system/media';

/* Pulso a cada 20s (dur-ambient): o anel só cresce nos primeiros ~6% do ciclo. */
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--brand) 45%, transparent); }
  6% { box-shadow: 0 0 0 18px color-mix(in srgb, var(--brand) 0%, transparent); }
  100% { box-shadow: 0 0 0 18px color-mix(in srgb, var(--brand) 0%, transparent); }
`;

export const Root = styled.a<{ $inline: boolean; $pulse: boolean }>`
  position: ${({ $inline }) => ($inline ? 'relative' : 'fixed')};
  ${({ $inline }) =>
    !$inline && 'right: var(--space-5); bottom: var(--space-5); z-index: var(--z-float);'}
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 64px;
  height: 64px;
  padding: 0 17px;
  box-sizing: border-box;
  border-radius: var(--radius-pill);
  background: var(--brand);
  color: var(--on-brand);
  box-shadow: var(--shadow-stamp-brand), var(--shadow-md);
  text-decoration: none;
  font: 800 16px/20px var(--font-body);

  /* entra de baixo para cima (y +24 → 0 + fade); fica fora da árvore de acessibilidade enquanto escondido */
  opacity: ${({ $inline }) => ($inline ? 1 : 0)};
  visibility: ${({ $inline }) => ($inline ? 'visible' : 'hidden')};
  transform: ${({ $inline }) => ($inline ? 'none' : 'translateY(var(--move-md))')};
  transition:
    transform var(--dur-slow) var(--ease-enter),
    opacity var(--dur-medium) var(--ease-standard),
    visibility 0s linear var(--dur-medium);

  &[data-shown='true'] {
    opacity: 1;
    visibility: visible;
    transform: none;
    transition-delay: 0s;
  }
  &[data-shown='true']:hover {
    transform: translateY(-2px);
    background: var(--brand-hover);
  }
  /* some junto com o QuoteForm: sai (y +24, fade) com ease-exit */
  &[data-shown='false'] {
    transition-timing-function: var(--ease-exit);
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }

  ${({ $pulse }) =>
    $pulse &&
    css`
      &[data-shown='true']::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        box-shadow: 0 0 0 0 var(--brand);
        animation: ${pulse} var(--dur-ambient) var(--ease-exit) 2s infinite;
        pointer-events: none;
      }
      &[data-scrolling='true']::after {
        animation-play-state: paused;
      }
    `}

  @media (max-width: 639px) {
    right: var(--space-4);
    bottom: var(--space-4);
  }

  ${media.reducedMotion} {
    transition-duration: 150ms;
    transform: none !important;
    &::after {
      animation: none !important;
    }
  }
`;

export const Label = styled.span`
  @media (max-width: 639px) {
    display: none;
  }
`;
