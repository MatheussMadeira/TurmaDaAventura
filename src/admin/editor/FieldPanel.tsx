'use client';

import { useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Media } from '@/components/atoms/Media';
import { Select } from '@/components/atoms/Select';
import { TextField } from '@/components/atoms/TextField';
import type { ImageRef } from '@/content/types';
import { ICON_NAMES, type IconName } from '@/lib/iconNames';
import { Count } from '../ui/layout';
import { CHOICE_LABELS, getAt, type FieldNode } from './describe';

export const fieldId = (path: string) => `ed-${path.replace(/\./g, '-')}`;

export interface PanelApi {
  errors: Record<string, string>;
  media: Record<string, ImageRef>;
  /** troca o valor de um caminho; `typing` junta a digitação num único passo do Desfazer */
  set: (path: string, value: unknown, typing?: boolean) => void;
  pick: (path: string, ratio: string, label: string) => void;
}

/** Formulário do bloco selecionado, desenhado a partir do schema (nenhum campo escrito à mão). */
export function FieldPanel({
  schema,
  content,
  api,
  focusPath,
}: {
  schema: FieldNode;
  content: unknown;
  api: PanelApi;
  focusPath: string | null;
}) {
  useEffect(() => {
    if (!focusPath) return;
    const el = document.getElementById(fieldId(focusPath));
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    el.focus({ preventScroll: true });
  }, [focusPath]);

  return <Fields node={schema} path="" value={content} api={api} />;
}

function Fields({
  node,
  path,
  value,
  api,
}: {
  node: FieldNode;
  path: string;
  value: unknown;
  api: PanelApi;
}) {
  if (node.kind === 'group') {
    return (
      <Group>
        {node.fields.map((f) => (
          <Fields
            key={f.key}
            node={f.node}
            path={path ? `${path}.${f.key}` : f.key}
            value={getAt(value, f.key)}
            api={api}
          />
        ))}
      </Group>
    );
  }

  const error = api.errors[path];

  if (node.kind === 'text') {
    const text = typeof value === 'string' ? value : '';
    return (
      <div>
        <TextField
          id={fieldId(path)}
          label={node.required ? node.label : `${node.label} (opcional)`}
          value={text}
          multiline={node.multiline}
          rows={3}
          hint={node.hint}
          error={error}
          onChange={(e) => api.set(path, e.target.value, true)}
        />
        {node.max ? <Count value={text} max={node.max} /> : null}
      </div>
    );
  }

  if (node.kind === 'icon') {
    const icon = (typeof value === 'string' ? value : ICON_NAMES[0]) as IconName;
    return (
      <IconRow>
        <Select
          id={fieldId(path)}
          label={node.label}
          value={icon}
          options={ICON_NAMES.map((n) => n)}
          error={error}
          onChange={(e) => api.set(path, e.target.value)}
        />
        <Preview aria-hidden>
          <Icon name={icon} size={24} />
        </Preview>
      </IconRow>
    );
  }

  if (node.kind === 'choice') {
    return (
      <Select
        id={fieldId(path)}
        label={node.label}
        value={typeof value === 'string' ? value : node.options[0]}
        options={node.options.map((o) => ({ value: o, label: CHOICE_LABELS[o] ?? o }))}
        error={error}
        onChange={(e) => api.set(path, e.target.value)}
      />
    );
  }

  if (node.kind === 'number') {
    return (
      <TextField
        id={fieldId(path)}
        label={node.label}
        type="number"
        min={node.min}
        max={node.max}
        value={typeof value === 'number' ? value : 0}
        error={error}
        onChange={(e) => api.set(path, Number(e.target.value))}
      />
    );
  }

  if (node.kind === 'media') {
    const id = typeof value === 'string' ? value : null;
    const photo = id ? api.media[id] : undefined;
    return (
      <Pic>
        <Label as="p">{node.label}</Label>
        <Row>
          <Thumb>
            <Media
              src={photo?.src}
              alt={photo?.alt ?? 'Sem foto: aparece o placeholder de camuflagem'}
              ratio={node.ratio}
              icon="image"
              sizes="160px"
            />
          </Thumb>
          <ButtonCol>
            <Button
              id={fieldId(path)}
              variant="outline"
              size="sm"
              iconLeft="image"
              onClick={() => api.pick(path, node.ratio, node.label)}
            >
              {photo ? 'Trocar foto' : 'Escolher foto'}
            </Button>
            {photo ? (
              <Button variant="ghost" size="sm" onClick={() => api.set(path, null)}>
                Remover foto
              </Button>
            ) : null}
          </ButtonCol>
        </Row>
        {photo ? <Small>Descrição: {photo.alt}</Small> : null}
        {error ? <ErrorText role="alert">{error}</ErrorText> : null}
      </Pic>
    );
  }

  /* lista */
  const items = Array.isArray(value) ? value : [];
  const set = (next: unknown[]) => api.set(path, next);
  const move = (i: number, d: -1 | 1) => {
    const next = [...items];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set(next);
  };
  return (
    <ListBox role="group" aria-label={node.label}>
      <ListHead>
        <Label as="p">
          {node.label} <small>({items.length})</small>
        </Label>
        {node.min !== node.max ? (
          <Button
            size="sm"
            variant="outline"
            iconLeft="plus"
            disabled={items.length >= node.max}
            onClick={() => set([...items, structuredClone(items[items.length - 1] ?? '')])}
          >
            Adicionar
          </Button>
        ) : null}
      </ListHead>
      {items.map((item, i) => (
        <Item key={i}>
          <ItemHead>
            <strong>
              {node.singular} {i + 1}
            </strong>
            <Tools>
              <Tool
                type="button"
                aria-label={`Subir ${node.singular} ${i + 1}`}
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                <Icon name="arrow-up" size={16} />
              </Tool>
              <Tool
                type="button"
                aria-label={`Descer ${node.singular} ${i + 1}`}
                disabled={i === items.length - 1}
                onClick={() => move(i, 1)}
              >
                <Icon name="arrow-down" size={16} />
              </Tool>
              {node.min !== node.max ? (
                <Tool
                  type="button"
                  aria-label={`Remover ${node.singular} ${i + 1}`}
                  disabled={items.length <= node.min}
                  onClick={() => set(items.filter((_, j) => j !== i))}
                >
                  <Icon name="trash" size={16} />
                </Tool>
              ) : null}
            </Tools>
          </ItemHead>
          <Fields node={node.item} path={`${path}.${i}`} value={item} api={api} />
        </Item>
      ))}
      <Small>
        {node.min === node.max ? `Sempre ${node.min}.` : `Entre ${node.min} e ${node.max}.`}
      </Small>
    </ListBox>
  );
}

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
`;
const Label = styled.label`
  margin: 0;
  font: 700 15px/20px var(--font-body);
  color: var(--ink);

  small {
    font-weight: 600;
    color: var(--ink-muted);
  }
`;
const IconRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-3);
  align-items: end;
`;
const Preview = styled.span`
  display: grid;
  place-items: center;
  width: var(--tap-min);
  height: var(--tap-min);
  border-radius: var(--radius-md);
  background: var(--brand-soft);
  color: var(--brand);
`;
const Pic = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;
const Row = styled.div`
  display: flex;
  gap: var(--space-4);
  align-items: center;
`;
const Thumb = styled.div`
  width: 112px;
  flex: none;
`;
const ButtonCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: flex-start;
`;
const Small = styled.p`
  margin: 0;
  font: 600 13px/18px var(--font-body);
  color: var(--ink-muted);
`;
const ErrorText = styled.p`
  margin: 0;
  font: 700 14px/20px var(--font-body);
  color: var(--danger);
`;
const ListBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;
const ListHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
`;
const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
  border: var(--border-thin) solid var(--line);
  border-radius: var(--radius-md);
  background: var(--surface-sunken);
`;
const ItemHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font: 800 14px/20px var(--font-body);
  color: var(--ink);
`;
const Tools = styled.div`
  display: flex;
  gap: var(--space-1);
`;
const Tool = styled.button`
  display: grid;
  place-items: center;
  width: var(--tap-min);
  height: var(--tap-min);
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--ink-muted);
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--brand-soft);
    color: var(--brand);
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
`;
