import styled from 'styled-components';

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--surface-raised);
  border: var(--border-thin) solid var(--line);
`;
export const Value = styled.p`
  margin: 0;
  font: 800 48px/52px var(--font-display);
  font-variation-settings:
    'opsz' 36,
    'SOFT' 100,
    'WONK' 0;
  color: var(--brand);
`;
export const Label = styled.p`
  margin: 0;
  font: 700 17px/24px var(--font-body);
  color: var(--ink);
`;
export const Description = styled.p`
  margin: 0;
  color: var(--ink-muted);
`;
