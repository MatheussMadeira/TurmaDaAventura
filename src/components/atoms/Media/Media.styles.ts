import styled from 'styled-components';

export const Frame = styled.div<{ $ratio: string; $rounded: boolean }>`
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: ${({ $ratio }) => $ratio};
  background: var(--surface-sunken);
  ${({ $rounded }) => $rounded && 'border-radius: var(--radius-lg);'}

  & > img {
    object-fit: cover;
  }
`;

export const Placeholder = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;

  & > svg {
    position: absolute;
    inset: 0;
  }
`;

export const Badge = styled.span`
  position: relative;
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--surface-raised);
  color: var(--brand);
  box-shadow: var(--shadow-sm);
`;

export const Caption = styled.span`
  position: absolute;
  left: var(--space-3);
  bottom: var(--space-3);
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: var(--surface-raised);
  color: var(--ink);
  font: 600 13px/18px var(--font-body);
`;
