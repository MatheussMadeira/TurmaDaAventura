import styled from 'styled-components';

export type TagTone = 'olive' | 'brand' | 'earth' | 'neutral';

const tones: Record<TagTone, string> = {
  olive: 'color: var(--olive); background: var(--olive-soft);',
  brand: 'color: var(--brand); background: var(--brand-soft);',
  earth: 'color: var(--earth-strong); background: var(--earth-soft);',
  neutral:
    'color: var(--ink-muted); background: var(--surface-sunken); box-shadow: inset 0 0 0 1px var(--line);',
};

export const StyledTag = styled.span<{ $tone: TagTone }>`
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  ${({ $tone }) => tones[$tone]}
`;

export const TagList = styled.div<{ $center?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  ${({ $center }) => $center && 'justify-content: center;'}
`;
