'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Icon } from '@/components/atoms/Icon';
import type { SectionState } from './protocol';

/**
 * Seções da página: arrastar para reordenar (ou os botões Subir/Descer, para teclado e toque),
 * olho para esconder sem apagar. Header e rodapé são globais e não entram aqui.
 */
export function SectionList({
  sections,
  selectedKey,
  invalid,
  onSelect,
  onMove,
  onReorder,
  onToggle,
}: {
  sections: SectionState[];
  selectedKey: string | null;
  /** chaves das seções com campos a corrigir */
  invalid: Set<string>;
  onSelect: (key: string) => void;
  onMove: (key: string, dir: -1 | 1) => void;
  onReorder: (from: number, to: number) => void;
  onToggle: (key: string) => void;
}) {
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  return (
    <List aria-label="Seções da página">
      {sections.map((s, i) => (
        <Row
          key={s.key}
          draggable
          data-over={over === i && drag !== null && drag !== i}
          data-dragging={drag === i}
          onDragStart={(e) => {
            setDrag(i);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', s.key);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(i);
          }}
          onDragLeave={() => setOver((o) => (o === i ? null : o))}
          onDrop={(e) => {
            e.preventDefault();
            if (drag !== null && drag !== i) onReorder(drag, i);
            setDrag(null);
            setOver(null);
          }}
          onDragEnd={() => {
            setDrag(null);
            setOver(null);
          }}
        >
          <Grip aria-hidden>
            <Icon name="menu" size={18} />
          </Grip>
          <Pick
            type="button"
            aria-current={selectedKey === s.key ? 'true' : undefined}
            data-hidden={!s.visible}
            onClick={() => onSelect(s.key)}
          >
            <span>{s.title}</span>
            {invalid.has(s.key) ? (
              <Warn role="img" aria-label="Há campos para corrigir">
                <Icon name="alert" size={16} />
              </Warn>
            ) : null}
            {!s.visible ? <em>oculta</em> : null}
          </Pick>
          <Tools>
            <Tool
              type="button"
              aria-label={`Subir a seção ${s.title}`}
              disabled={i === 0}
              onClick={() => onMove(s.key, -1)}
            >
              <Icon name="arrow-up" size={16} />
            </Tool>
            <Tool
              type="button"
              aria-label={`Descer a seção ${s.title}`}
              disabled={i === sections.length - 1}
              onClick={() => onMove(s.key, 1)}
            >
              <Icon name="arrow-down" size={16} />
            </Tool>
            <Tool
              type="button"
              aria-pressed={!s.visible}
              aria-label={s.visible ? `Esconder a seção ${s.title}` : `Mostrar a seção ${s.title}`}
              onClick={() => onToggle(s.key)}
            >
              <Icon name={s.visible ? 'eye' : 'eye-off'} size={18} />
            </Tool>
          </Tools>
        </Row>
      ))}
    </List>
  );
}

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
`;
const Row = styled.li`
  display: flex;
  align-items: center;
  gap: var(--space-1);
  border-radius: var(--radius-md);
  border: var(--border-thick) solid transparent;
  background: var(--surface-raised);

  &[data-over='true'] {
    border-color: var(--brand);
  }
  &[data-dragging='true'] {
    opacity: 0.5;
  }
`;
const Grip = styled.span`
  display: grid;
  place-items: center;
  width: 24px;
  color: var(--ink-subtle);
  cursor: grab;
`;
const Pick = styled.button`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--tap-min);
  padding: 0 var(--space-2);
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--ink);
  font: 700 15px/20px var(--font-body);
  text-align: left;
  cursor: pointer;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  em {
    font: 700 12px/16px var(--font-body);
    color: var(--ink-muted);
    font-style: normal;
  }
  &[data-hidden='true'] span {
    color: var(--ink-muted);
    text-decoration: line-through;
  }
  &[aria-current='true'] {
    background: var(--brand-soft);
    color: var(--brand);
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
`;
const Warn = styled.span`
  display: inline-grid;
  color: var(--danger);
`;
const Tools = styled.div`
  display: flex;
`;
const Tool = styled.button`
  display: grid;
  place-items: center;
  width: 32px;
  height: var(--tap-min);
  border: 0;
  background: transparent;
  color: var(--ink-muted);
  cursor: pointer;

  &:hover:not(:disabled) {
    color: var(--brand);
  }
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: -3px;
  }
`;
