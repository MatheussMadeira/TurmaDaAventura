'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Media } from '@/components/atoms/Media';
import { Dialog } from './Dialog';
import { Stack } from './layout';

export interface PickerPhoto {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * Escolha de foto da biblioteca (cadastro das fotos fica em Fotos). Sem foto = placeholder de
 * camuflagem. O diálogo completo — envio, recorte e descrição — chega no editor visual (5B).
 */
export function MediaPicker({
  label,
  hint,
  library,
  value,
  onChange,
  ratio,
}: {
  label: string;
  hint?: string;
  library: PickerPhoto[];
  value: string | null;
  onChange: (id: string | null) => void;
  /** proporção do slot, ex.: "4 / 3" */
  ratio: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | null>(value);
  const current = library.find((p) => p.id === value);

  const start = () => {
    setDraft(value);
    setOpen(true);
  };

  return (
    <Stack $gap="var(--space-2)">
      <Label>{label}</Label>
      <Pic>
        <Thumb>
          <Media
            src={current?.url}
            alt={current?.alt ?? 'Sem foto: aparece o placeholder de camuflagem'}
            ratio={ratio}
            icon="image"
          />
        </Thumb>
        <Stack $gap="var(--space-2)">
          <Button variant="outline" size="sm" iconLeft="image" onClick={start}>
            {current ? 'Trocar foto' : 'Escolher foto'}
          </Button>
          {current ? (
            <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
              Remover foto
            </Button>
          ) : null}
        </Stack>
      </Pic>
      {current ? <Alt>Descrição: {current.alt}</Alt> : null}
      {hint ? <Hint>{hint}</Hint> : null}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                onChange(draft);
                setOpen(false);
              }}
            >
              Usar esta foto
            </Button>
          </>
        }
      >
        {library.length ? (
          <Lib role="group" aria-label="Fotos da biblioteca">
            <Item
              type="button"
              aria-pressed={draft === null}
              onClick={() => setDraft(null)}
              aria-label="Sem foto (usar placeholder)"
            >
              <Media alt="" ratio={ratio} icon="image" rounded={false} />
              <span className="tag">Sem foto</span>
              {draft === null ? <Check /> : null}
            </Item>
            {library.map((p) => (
              <Item
                key={p.id}
                type="button"
                aria-pressed={draft === p.id}
                onClick={() => setDraft(p.id)}
                aria-label={p.alt}
              >
                <ImgBox style={{ aspectRatio: ratio }}>
                  <Image src={p.url} alt="" fill sizes="200px" style={{ objectFit: 'cover' }} />
                </ImgBox>
                {draft === p.id ? <Check /> : null}
              </Item>
            ))}
          </Lib>
        ) : (
          <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
            A biblioteca está vazia.{' '}
            <Link href="/admin/fotos" style={{ color: 'var(--brand)', fontWeight: 800 }}>
              Envie fotos em Fotos
            </Link>{' '}
            e volte aqui.
          </p>
        )}
      </Dialog>
    </Stack>
  );
}

function Check() {
  return (
    <CheckMark aria-hidden>
      <Icon name="check" size={16} />
    </CheckMark>
  );
}

const Label = styled.span`
  font: 700 15px/20px var(--font-body);
  color: var(--ink);
`;
const Pic = styled.div`
  display: flex;
  gap: var(--space-4);
  align-items: center;
  flex-wrap: wrap;
`;
const Thumb = styled.div`
  flex: none;
  width: 160px;
`;
const Alt = styled.p`
  margin: 0;
  font: 400 14px/20px var(--font-body);
  color: var(--ink-muted);
`;
const Hint = styled.p`
  margin: 0;
  font: 600 13px/18px var(--font-body);
  color: var(--ink-muted);
`;
const Lib = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-3);
  @media (max-width: 599px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;
const Item = styled.button`
  position: relative;
  padding: 0;
  overflow: hidden;
  border: 3px solid transparent;
  border-radius: var(--radius-md);
  background: none;
  cursor: pointer;

  &[aria-pressed='true'] {
    border-color: var(--brand);
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
  .tag {
    position: absolute;
    left: 8px;
    bottom: 8px;
    padding: 2px 8px;
    border-radius: var(--radius-pill);
    background: var(--surface-raised);
    color: var(--ink);
    font: 700 12px/16px var(--font-body);
  }
`;
const ImgBox = styled.div`
  position: relative;
  width: 100%;
  background: var(--surface-sunken);
`;
const CheckMark = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--brand);
  color: var(--on-brand);
`;
