import { m } from 'framer-motion';
import styled from 'styled-components';

export const Root = styled.header<{ $align: 'left' | 'center'; $forest: boolean }>`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 720px;
  ${({ $align }) => $align === 'center' && 'margin-inline: auto; text-align: center; align-items: center;'}
`;

export const Overline = styled.p<{ $forest: boolean }>`
  margin: 0;
  color: ${({ $forest }) => ($forest ? 'var(--caqui-200)' : 'var(--earth-strong)')};
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
`;

/* O traço desenha (scaleX) quando o SectionHeader está dentro de um Reveal. */
export const Bar = styled(m.span)`
  display: block;
  width: 24px;
  height: 3px;
  border-radius: 2px;
  background: currentColor;
  transform-origin: left;
`;

export const Title = styled(m.h2)<{ $forest: boolean }>`
  margin: 0;
  font-family: var(--font-display);
  color: ${({ $forest }) => ($forest ? 'var(--ink-on-forest)' : 'var(--ink)')};
`;

export const Description = styled(m.p)<{ $forest: boolean }>`
  margin: 0;
  color: ${({ $forest }) => ($forest ? 'var(--ink-on-forest-muted)' : 'var(--ink-muted)')};
`;
