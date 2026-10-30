import styled from 'styled-components';

export const Root = styled.div`
  display: inline-flex;
  align-items: center;
  border: var(--border-thick) solid var(--line-strong);
  border-radius: var(--radius-md);
  background: var(--surface-raised);
`;

export const Step = styled.button`
  display: grid;
  place-items: center;
  width: var(--tap-min);
  height: var(--tap-min);
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--brand);
  font: 800 20px/1 var(--font-body);
  cursor: pointer;

  &:hover {
    background: var(--brand-soft);
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
  &[disabled] {
    color: var(--ink-subtle);
    cursor: not-allowed;
    background: transparent;
  }
`;

export const Value = styled.output`
  min-width: 40px;
  text-align: center;
  font: 800 16px/20px var(--font-body);
  color: var(--ink);
`;
