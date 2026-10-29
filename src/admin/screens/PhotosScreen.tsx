'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { TextField } from '@/components/atoms/TextField';
import { deleteMediaAction, updateMediaAltAction } from '@/app/admin/_actions/content';
import { prepareImage } from '../prepareImage';
import { Alert, DangerButton, IconButton, Tabs, type TabItem } from '../ui/controls';
import { Dialog } from '../ui/Dialog';
import { useAction } from '../ui/forms';
import { Box, BoxSub, PageTop, Stack } from '../ui/layout';
import { useToast } from '../ui/Toast';
import { EmptyState } from '../ui/states';

export interface PhotoRow {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  usedIn: string[];
}

interface Pending {
  key: string;
  file: File;
  preview: string;
  alt: string;
  error?: string;
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif';
const MIN_ALT = 5;

export function PhotosScreen({ photos, tabs }: { photos: PhotoRow[]; tabs: TabItem[] }) {
  const router = useRouter();
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<Pending[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const [sending, setSending] = useState(false);
  const [dropping, setDropping] = useState(false);
  const [editing, setEditing] = useState<PhotoRow | null>(null);
  const [altDraft, setAltDraft] = useState('');
  const [removing, setRemoving] = useState<PhotoRow | null>(null);
  const { run, pending, result } = useAction();

  const add = (files: FileList | File[]) => {
    const next: Pending[] = [...files]
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        key: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        preview: URL.createObjectURL(file),
        alt: '',
      }));
    setQueue((q) => [...q, ...next]);
  };
  const dropItem = (key: string) =>
    setQueue((q) => {
      const item = q.find((x) => x.key === key);
      if (item) URL.revokeObjectURL(item.preview);
      return q.filter((x) => x.key !== key);
    });

  const ready =
    queue.length > 0 && authorized && queue.every((q) => q.alt.trim().length >= MIN_ALT);

  const send = async () => {
    setSending(true);
    let okCount = 0;
    const left: Pending[] = [];
    for (const item of queue) {
      const body = new FormData();
      body.append('files', await prepareImage(item.file));
      body.append('alts', item.alt.trim());
      body.append('authorization', 'on');
      try {
        const res = await fetch('/api/admin/media', { method: 'POST', body });
        const json = (await res.json().catch(() => null)) as {
          error?: string;
          results?: { ok: boolean; error?: string }[];
        } | null;
        const r = json?.results?.[0];
        if (res.ok && r?.ok) {
          okCount += 1;
          URL.revokeObjectURL(item.preview);
        } else {
          left.push({ ...item, error: r?.error ?? json?.error ?? 'Não foi possível enviar.' });
        }
      } catch {
        left.push({ ...item, error: 'Sem conexão. Tente de novo.' });
      }
    }
    setQueue(left);
    setSending(false);
    if (okCount) {
      toast.show({ message: `${okCount} ${okCount === 1 ? 'foto enviada' : 'fotos enviadas'}.` });
      router.refresh();
    }
  };

  return (
    <Stack>
      <PageTop
        crumb="Site"
        title="Fotos"
        actions={
          <Button iconLeft="upload" onClick={() => input.current?.click()}>
            Enviar fotos
          </Button>
        }
      />

      <Alert tone="info" title="Regras das fotos">
        Só fotos com autorização dos responsáveis. Crianças de costas, de perfil ou em grupo; luz
        natural. Toda foto precisa de descrição para leitores de tela.
      </Alert>

      <Box>
        <Drop
          data-dropping={dropping}
          onDragOver={(e) => {
            e.preventDefault();
            setDropping(true);
          }}
          onDragLeave={() => setDropping(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDropping(false);
            add(e.dataTransfer.files);
          }}
        >
          <DropIcon aria-hidden>
            <Icon name="upload" size={26} />
          </DropIcon>
          <strong>Arraste várias fotos de uma vez</strong>
          <span>
            ou{' '}
            <LinkButton type="button" onClick={() => input.current?.click()}>
              clique para escolher
            </LinkButton>{' '}
            JPG, PNG, WebP ou AVIF, até 10 MB cada. A gente gera os tamanhos certos para o site.
          </span>
          <input
            ref={input}
            type="file"
            accept={ACCEPT}
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) add(e.target.files);
              e.target.value = '';
            }}
          />
        </Drop>

        {queue.length ? (
          <>
            <Queue>
              {queue.map((q) => (
                <QueueItem key={q.key}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- pré-visualização local (blob:) */}
                  <img src={q.preview} alt="" />
                  <div>
                    <TextField
                      label={`Descrição de ${q.file.name}`}
                      required
                      value={q.alt}
                      onChange={(e) =>
                        setQueue((list) =>
                          list.map((x) =>
                            x.key === q.key ? { ...x, alt: e.target.value, error: undefined } : x,
                          ),
                        )
                      }
                      placeholder="Ex.: Crianças de costas empinando pipas no gramado"
                      hint={`Mínimo de ${MIN_ALT} caracteres, para leitores de tela.`}
                      error={q.error}
                      maxLength={160}
                    />
                  </div>
                  <IconButton
                    icon="close"
                    label={`Tirar ${q.file.name} da lista`}
                    onClick={() => dropItem(q.key)}
                  />
                </QueueItem>
              ))}
            </Queue>
            <Check>
              <input
                type="checkbox"
                checked={authorized}
                onChange={(e) => setAuthorized(e.target.checked)}
              />
              Tenho autorização dos responsáveis pelas crianças que aparecem nestas fotos.
            </Check>
            <div>
              <Button iconLeft="upload" disabled={!ready || sending} onClick={send}>
                {sending
                  ? 'Enviando…'
                  : `Enviar ${queue.length} ${queue.length === 1 ? 'foto' : 'fotos'}`}
              </Button>
            </div>
          </>
        ) : null}
      </Box>

      <Box $flush>
        <TabsWrap>
          <Tabs items={tabs} label="Filtrar fotos" />
        </TabsWrap>
        {photos.length ? (
          <Grid>
            {photos.map((p) => (
              <Card key={p.id}>
                <Thumb>
                  <Image
                    src={p.url}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 1024px) 280px, 50vw"
                    style={{ objectFit: 'cover' }}
                  />
                </Thumb>
                <Body>
                  <Alt>{p.alt}</Alt>
                  <Small>
                    {p.width}×{p.height}
                  </Small>
                  <Small>
                    {p.usedIn.length ? <>Usada em: {p.usedIn.join(' · ')}</> : 'Não usada no site'}
                  </Small>
                  <Actions>
                    <Button
                      size="sm"
                      variant="outline"
                      iconLeft="edit"
                      onClick={() => {
                        setEditing(p);
                        setAltDraft(p.alt);
                      }}
                    >
                      Descrição
                    </Button>
                    <IconButton
                      icon="trash"
                      tone="danger"
                      label={`Remover foto: ${p.alt}`}
                      disabled={p.usedIn.length > 0}
                      title={
                        p.usedIn.length
                          ? 'Em uso: troque nos locais indicados antes de remover'
                          : 'Remover'
                      }
                      onClick={() => setRemoving(p)}
                    />
                  </Actions>
                </Body>
              </Card>
            ))}
          </Grid>
        ) : (
          <EmptyState title="Nenhuma foto aqui">
            Envie as primeiras fotos acima. Elas ficam disponíveis para restaurantes, atividades e
            equipe.
          </EmptyState>
        )}
      </Box>

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Descrição da foto"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button
              disabled={pending || altDraft.trim().length < MIN_ALT}
              onClick={async () => {
                if (!editing) return;
                const r = await run(() => updateMediaAltAction(editing.id, altDraft));
                if (r.ok) {
                  setEditing(null);
                  router.refresh();
                }
              }}
            >
              Salvar
            </Button>
          </>
        }
      >
        <TextField
          label="Descrição para leitores de tela"
          required
          multiline
          rows={3}
          value={altDraft}
          onChange={(e) => setAltDraft(e.target.value)}
          error={result && !result.ok ? result.error : undefined}
          hint="Descreva o que se vê na foto, sem identificar as crianças."
        />
      </Dialog>

      <Dialog
        open={!!removing}
        alert
        closeOnBackdrop={false}
        onClose={() => setRemoving(null)}
        title="Remover esta foto?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRemoving(null)}>
              Cancelar
            </Button>
            <DangerButton
              iconLeft="trash"
              disabled={pending}
              onClick={async () => {
                if (!removing) return;
                const r = await run(() => deleteMediaAction(removing.id));
                if (r.ok) {
                  setRemoving(null);
                  router.refresh();
                }
              }}
            >
              Remover
            </DangerButton>
          </>
        }
      >
        <BoxSub>{removing?.alt}</BoxSub>
        <BoxSub>Os arquivos são apagados do armazenamento. Isso não pode ser desfeito.</BoxSub>
        {result && !result.ok ? <Alert tone="err">{result.error}</Alert> : null}
      </Dialog>
    </Stack>
  );
}

const TabsWrap = styled.div`
  padding: var(--space-2) var(--space-4) 0;
`;
const Drop = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-6);
  border: var(--border-dash) dashed var(--earth);
  border-radius: var(--radius-lg);
  background: var(--surface);
  text-align: center;
  color: var(--ink-muted);

  strong {
    color: var(--ink);
    font: 800 16px/22px var(--font-body);
  }
  &[data-dropping='true'] {
    background: var(--brand-soft);
    border-color: var(--brand);
  }
`;
const DropIcon = styled.span`
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--brand-soft);
  color: var(--brand);
`;
const LinkButton = styled.button`
  padding: 0;
  border: 0;
  background: none;
  color: var(--brand);
  font: 800 inherit/inherit var(--font-body);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  border-radius: 4px;
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
`;
const Queue = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;
const QueueItem = styled.div`
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr) auto;
  gap: var(--space-4);
  align-items: start;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--surface-sunken);

  img {
    width: 96px;
    height: 76px;
    object-fit: cover;
    border-radius: var(--radius-sm);
  }
  @media (max-width: 599px) {
    grid-template-columns: 72px minmax(0, 1fr);
    img {
      width: 72px;
      height: 60px;
    }
    button {
      grid-column: 2;
      justify-self: end;
    }
  }
`;
const Check = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-height: var(--tap-min);
  font: 700 15px/22px var(--font-body);
  color: var(--ink);
  cursor: pointer;
  input {
    flex: none;
    width: 22px;
    height: 22px;
    margin: 0;
    accent-color: var(--brand);
  }
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-4);
  padding: var(--space-4);
`;
const Card = styled.article`
  display: flex;
  flex-direction: column;
  border: var(--border-thin) solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--surface-raised);
`;
const Thumb = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  background: var(--surface-sunken);
`;
const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
`;
const Alt = styled.p`
  margin: 0;
  font: 700 14px/20px var(--font-body);
  color: var(--ink);
`;
const Small = styled.p`
  margin: 0;
  font: 600 13px/18px var(--font-body);
  color: var(--ink-muted);
`;
const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-top: var(--space-2);
`;
