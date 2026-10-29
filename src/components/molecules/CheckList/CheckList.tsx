'use client';

import styled from 'styled-components';
import { Icon } from '../../atoms/Icon';

export interface CheckListProps {
  items: string[];
  /** compact = frases curtas em negrito (pré-orçamento) · text = parágrafos (benefícios) */
  variant?: 'compact' | 'text';
  className?: string;
}

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

const Item = styled.li<{ $text: boolean }>`
  display: flex;
  gap: ${({ $text }) => ($text ? 'var(--space-4)' : '10px')};
  align-items: ${({ $text }) => ($text ? 'flex-start' : 'center')};
  margin-top: ${({ $text }) => ($text ? 'var(--space-4)' : 'var(--space-3)')};
  color: var(--ink);

  &:first-child {
    margin-top: 0;
  }
  p {
    margin: 0;
  }
  ${({ $text }) => !$text && 'font: 700 16px/22px var(--font-body);'}
`;

const Mark = styled.span<{ $text: boolean }>`
  color: var(--brand);
  display: inline-flex;
  flex: none;
  ${({ $text }) => $text && 'margin-top: 2px;'}
`;

export function CheckList({ items, variant = 'compact', className }: CheckListProps) {
  const text = variant === 'text';
  return (
    <List className={className}>
      {items.map((t) => (
        <Item key={t} $text={text}>
          <Mark $text={text}>
            <Icon name="check" size={20} />
          </Mark>
          {text ? <p className="body">{t}</p> : t}
        </Item>
      ))}
    </List>
  );
}
