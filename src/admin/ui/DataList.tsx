'use client';

import type { ReactNode } from 'react';
import styled from 'styled-components';
import { media } from '@/design-system/media';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** alinhamento (Ações à direita) */
  align?: 'right';
  /** cabeçalho só para leitores de tela (coluna de ações) */
  srOnlyHeader?: boolean;
}

/**
 * Lista responsiva: tabela a partir de 768px; abaixo disso cada linha vira um cartão
 * (`card`). Os dois ficam no DOM, só um aparece (CSS) — o cartão traz as mesmas ações.
 */
export function DataList<T>({
  rows,
  rowKey,
  columns,
  card,
  caption,
}: {
  rows: T[];
  rowKey: (row: T) => string;
  columns: Column<T>[];
  card: (row: T) => ReactNode;
  caption: string;
}) {
  return (
    <>
      <DesktopOnly>
        <Table>
          <caption className="sr">{caption}</caption>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" data-align={c.align}>
                  {c.srOnlyHeader ? <span className="sr">{c.header}</span> : c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={rowKey(r)}>
                {columns.map((c) => (
                  <td key={c.key} data-align={c.align}>
                    {c.render(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </DesktopOnly>
      <MobileOnly role="list" aria-label={caption}>
        {rows.map((r) => (
          <Card key={rowKey(r)} role="listitem">
            {card(r)}
          </Card>
        ))}
      </MobileOnly>
    </>
  );
}

const DesktopOnly = styled.div`
  overflow-x: auto;
  ${media.down('bp-md')} {
    display: none;
  }
`;
const MobileOnly = styled.div`
  display: none;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  ${media.down('bp-md')} {
    display: flex;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font: 400 15px/22px var(--font-body);

  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  th {
    text-align: left;
    padding: var(--space-3) var(--space-4);
    font: 800 12px/16px var(--font-body);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-muted);
    background: var(--surface-sunken);
    border-bottom: var(--border-thin) solid var(--line);
  }
  td {
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--line);
    vertical-align: middle;
    color: var(--ink);
  }
  tr:last-child td {
    border-bottom: 0;
  }
  tbody tr:hover td {
    background: var(--brand-soft);
  }
  [data-align='right'] {
    text-align: right;
  }
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--surface-raised);
  border: var(--border-thin) solid var(--line);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
`;

/** Peças para montar a célula principal e o cartão. */
export const CellMain = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;

  strong {
    display: block;
    font: 800 15px/20px var(--font-body);
  }
  span {
    display: block;
    font: 400 14px/20px var(--font-body);
    color: var(--ink-muted);
  }
`;
export const RowActions = styled.div`
  display: flex;
  gap: var(--space-1);
  justify-content: flex-end;
  align-items: center;
`;
export const CardRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
`;
export const CardMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font: 400 14px/20px var(--font-body);
  color: var(--ink-muted);

  span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;
