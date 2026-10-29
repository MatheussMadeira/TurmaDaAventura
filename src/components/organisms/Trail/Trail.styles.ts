import styled from 'styled-components';
import { media } from '@/design-system/media';

/* Linha tracejada que se desenha (clip-path) e marcos que carimbam, escalonados ao longo da linha. */
export const Root = styled.ol<{ $n: number }>`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(${({ $n }) => $n}, 1fr);
  gap: var(--space-6);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 36px;
    left: 36px;
    right: calc((100% - ${({ $n }) => $n - 1} * var(--space-6)) / ${({ $n }) => $n} - 36px);
    border-top: var(--border-dash) dashed var(--earth);
    opacity: 0.7;
    clip-path: inset(0 100% 0 0);
    transition: clip-path var(--dur-trail) var(--ease-standard);
  }
  &[data-visible='true']::before {
    clip-path: inset(0 0 0 0);
  }

  ${media.down('bp-md')} {
    grid-template-columns: 1fr;
    gap: var(--space-5);

    &::before {
      top: 36px;
      bottom: 36px;
      left: 35px;
      right: auto;
      border-top: 0;
      border-left: var(--border-dash) dashed var(--earth);
      clip-path: inset(0 0 100% 0);
    }
    &[data-visible='true']::before {
      clip-path: inset(0 0 0 0);
    }
  }

  ${media.reducedMotion} {
    &::before {
      transition-duration: 1ms;
    }
  }
`;

export const Step = styled.li`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  ${media.down('bp-md')} {
    display: grid;
    grid-template-columns: 72px 1fr;
    column-gap: var(--space-4);
  }

  /* texto: y 12 → 0 + fade, 120ms depois do marco */
  & > :not([data-marker]) {
    opacity: 0;
    transform: translateY(var(--move-sm));
    transition:
      opacity var(--dur-slow) var(--ease-enter),
      transform var(--dur-slow) var(--ease-enter);
    transition-delay: calc(var(--d, 0s) + 120ms);
  }
  [data-visible='true'] > & > * {
    opacity: 1;
    transform: none;
  }

  ${media.reducedMotion} {
    & > * {
      transition-duration: 1ms !important;
      transition-delay: 0s !important;
    }
  }
`;

export const Marker = styled.span`
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--surface-raised);
  color: var(--brand);
  border: var(--border-thick) solid var(--brand);
  box-shadow: 0 0 0 8px var(--surface-sunken);
  margin-bottom: var(--space-3);
  position: relative;
  transform: scale(0.8);
  opacity: 0;
  transition:
    transform var(--dur-slow) var(--ease-stamp),
    opacity var(--dur-fast) linear;
  transition-delay: var(--d, 0s);

  [data-visible='true'] > li > & {
    transform: none;
    opacity: 1;
  }

  ${media.down('bp-md')} {
    grid-row: span 3;
    margin: 0;
  }
  ${media.reducedMotion} {
    transition-duration: 1ms;
    transition-delay: 0s;
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
