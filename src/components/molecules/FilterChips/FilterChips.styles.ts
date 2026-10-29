import { m } from 'framer-motion';
import styled from 'styled-components';

export const List = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
`;

export const Chip = styled.button`
  position: relative;
  isolation: isolate;
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
  cursor: pointer;
  transition:
    border-color var(--dur-fast) var(--ease-standard),
    color var(--dur-fast) var(--ease-standard);

  &:hover,
  &[data-state='hover'] {
    border-color: var(--brand);
    color: var(--brand);
  }
  &:focus-visible,
  &[data-state='focus'] {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
  &[aria-pressed='true'] {
    border-color: var(--brand);
    color: var(--on-brand);
  }
`;

/* A pílula ativa desliza entre os chips (layoutId). */
export const Pill = styled(m.span)`
  position: absolute;
  inset: calc(-1 * var(--border-thick));
  z-index: -1;
  border-radius: var(--radius-pill);
  background: var(--brand);
`;

export const Count = styled.span`
  font-weight: 800;
  opacity: 0.8;
`;
