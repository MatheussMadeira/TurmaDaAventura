'use client';

import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from 'react';
import styled from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { TextField } from '@/components/atoms/TextField';
import { prepareImage } from '../prepareImage';
import { Alert } from '../ui/controls';
import { Dialog } from '../ui/Dialog';
import { Count } from '../ui/layout';
import type { PickerPhoto } from '../ui/MediaPicker';
import {
  MAX_ZOOM,
  MIN_ZOOM,
  cropRect,
  isSmallPhoto,
  panCenter,
  parseRatio,
  renderCrop,
  viewStyle,
} from './crop';

type Tab = 'upload' | 'library';

/**
 * "Trocar foto": 1) enviar do computador ou escolher da biblioteca; 2) recorte com a proporção
 * do slot + zoom; 3) descrição obrigatória e autorização dos responsáveis. Foto da biblioteca já
 * tem descrição e já foi autorizada: é usada como está.
 */
export interface PhotoDialogProps {
  open: boolean;
  onClose: () => void;
  label: string;
  ratio: string;
  currentId: string | null;
  library: PickerPhoto[];
  onDone: (photo: PickerPhoto) => void;
}

/** O corpo só existe aberto: cada abertura começa do zero (sem estado de antes). */
export function PhotoDialog(props: PhotoDialogProps) {
  return props.open ? <PhotoDialogBody {...props} /> : null;
}

function PhotoDialogBody({
  open,
  onClose,
  label,
  ratio,
  currentId,
  library,
  onDone,
}: PhotoDialogProps) {
  const [tab, setTab] = useState<Tab>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pick, setPick] = useState<string | null>(currentId);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Trocar foto — ${label}`}
      wide
      closeOnBackdrop={false}
      footer={
        file ? null : (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            {tab === 'library' ? (
              <Button
                disabled={!pick}
                onClick={() => {
                  const found = library.find((p) => p.id === pick);
                  if (found) onDone(found);
                }}
              >
                Usar esta foto
              </Button>
            ) : null}
          </>
        )
      }
    >
      {file ? (
        <CropStep
          file={file}
          ratio={ratio}
          onBack={() => setFile(null)}
          onUploaded={(p) => onDone(p)}
        />
      ) : (
        <>
          <Tabs role="tablist" aria-label="De onde vem a foto">
            {(
              [
                ['upload', 'Enviar do computador'],
                ['library', `Biblioteca (${library.length})`],
              ] as const
            ).map(([id, text]) => (
              <TabBtn
                key={id}
                role="tab"
                type="button"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
              >
                {text}
              </TabBtn>
            ))}
          </Tabs>
          {tab === 'upload' ? (
            <Drop onFile={setFile} />
          ) : library.length ? (
            <Grid role="group" aria-label="Fotos da biblioteca">
              {library.map((p) => (
                <Tile
                  key={p.id}
                  type="button"
                  aria-pressed={pick === p.id}
                  aria-label={p.alt}
                  onClick={() => setPick(p.id)}
                >
                  <Thumb style={{ aspectRatio: ratio }}>
                    <Image src={p.url} alt="" fill sizes="200px" style={{ objectFit: 'cover' }} />
                  </Thumb>
                  {pick === p.id ? (
                    <Check aria-hidden>
                      <Icon name="check" size={18} />
                    </Check>
                  ) : null}
                </Tile>
              ))}
            </Grid>
          ) : (
            <Alert tone="info">A biblioteca está vazia. Envie a primeira foto na outra aba.</Alert>
          )}
          <Notice />
        </>
      )}
    </Dialog>
  );
}

function Notice() {
  return (
    <Small>
      Só fotos com autorização dos responsáveis. Crianças de costas, de perfil ou em grupo; luz
      natural; sem rostos em close.
    </Small>
  );
}

function Drop({ onFile }: { onFile: (f: File) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const take = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Esse arquivo não é uma imagem. Use JPG, PNG ou WebP.');
      return;
    }
    setError(null);
    onFile(f);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    take(e.dataTransfer.files);
  };

  return (
    <>
      <Zone
        data-over={over}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <Icon name="upload" size={32} />
        <strong>Arraste a foto até aqui</strong>
        <span>ou</span>
        <Button variant="outline" iconLeft="upload" onClick={() => input.current?.click()}>
          Escolher no computador
        </Button>
        <input
          ref={input}
          type="file"
          accept="image/*"
          hidden
          aria-label="Escolher foto no computador"
          onChange={(e) => take(e.target.files)}
        />
      </Zone>
      {error ? <Alert tone="err">{error}</Alert> : null}
    </>
  );
}

function CropStep({
  file,
  ratio,
  onBack,
  onUploaded,
}: {
  file: File;
  ratio: string;
  onBack: () => void;
  onUploaded: (p: PickerPhoto) => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [center, setCenter] = useState({ cx: 0.5, cy: 0.5 });
  const [alt, setAlt] = useState('');
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const view = useRef<HTMLDivElement>(null);
  const r = parseRatio(ratio);

  useEffect(() => {
    const u = URL.createObjectURL(file);
    let alive = true;
    createImageBitmap(file, { imageOrientation: 'from-image' })
      .then((b) => {
        if (alive) {
          setUrl(u);
          setNat({ w: b.width, h: b.height });
        }
        b.close();
      })
      .catch(() => alive && setError('Não foi possível abrir essa imagem. Tente outro arquivo.'));
    return () => {
      alive = false;
      URL.revokeObjectURL(u);
    };
  }, [file]);

  const rect = nat ? cropRect(nat.w, nat.h, r, zoom, center.cx, center.cy) : null;

  const drag = useRef<{ x: number; y: number; rect: NonNullable<typeof rect> } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    if (!rect) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, rect };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !nat || !view.current) return;
    setCenter(
      panCenter(d.rect, nat.w, nat.h, view.current.clientWidth, e.clientX - d.x, e.clientY - d.y),
    );
  };
  const onKey = (e: KeyboardEvent) => {
    if (!rect || !nat) return;
    const step = 0.04 / zoom;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const m = moves[e.key];
    if (m) {
      e.preventDefault();
      setCenter((c) => ({
        cx: Math.min(1, Math.max(0, c.cx + m[0])),
        cy: Math.min(1, Math.max(0, c.cy + m[1])),
      }));
    } else if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(MAX_ZOOM, z + 0.2));
    else if (e.key === '-') setZoom((z) => Math.max(MIN_ZOOM, z - 0.2));
  };

  const canSend = alt.trim().length >= 5 && ok && !busy && !!rect;

  const send = useCallback(
    async (crop: boolean) => {
      if (!rect) return;
      setBusy(true);
      setError(null);
      try {
        const out = crop ? await renderCrop(file, rect) : await prepareImage(file);
        const fd = new FormData();
        fd.append('files', out);
        fd.append('alts', alt.trim());
        fd.append('authorization', 'true');
        const res = await fetch('/api/admin/media', { method: 'POST', body: fd });
        const json = (await res.json().catch(() => null)) as {
          error?: string;
          results?: (
            | { ok: true; id: string; url: string; alt: string; width: number; height: number }
            | { ok: false; error: string }
          )[];
        } | null;
        const first = json?.results?.[0];
        if (first?.ok) {
          onUploaded({
            id: first.id,
            url: first.url,
            alt: first.alt,
            width: first.width,
            height: first.height,
          });
          return;
        }
        setError(
          (first && !first.ok ? first.error : json?.error) ??
            'Não foi possível enviar essa foto. Tente de novo.',
        );
      } catch {
        setError('Sem conexão. Confira a internet e tente de novo.');
      } finally {
        setBusy(false);
      }
    },
    [rect, file, alt, onUploaded],
  );

  return (
    <Cols>
      <div>
        <ViewWrap>
          <View
            ref={view}
            style={{ aspectRatio: ratio }}
            tabIndex={0}
            role="group"
            aria-label="Área de recorte. Arraste a foto, ou use as setas para mover e + e - para ampliar."
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
            onKeyDown={onKey}
          >
            {url && nat && rect ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" draggable={false} style={viewStyle(rect, nat.w, nat.h)} />
            ) : (
              <Loading>Abrindo a foto…</Loading>
            )}
          </View>
        </ViewWrap>
        <Zoom>
          <label htmlFor="photo-zoom">Zoom</label>
          <input
            id="photo-zoom"
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </Zoom>
        <Small>
          Proporção do espaço no site: {ratio.replace(' / ', ':')}. Arraste a foto para enquadrar.
        </Small>
        {rect && isSmallPhoto(rect) ? (
          <Alert tone="warn">
            Essa foto é pequena e pode ficar borrada em telas grandes. Dá para usar assim; se tiver
            uma maior, prefira ela.
          </Alert>
        ) : null}
      </div>

      <Side>
        <div>
          <TextField
            label="Descrição da foto"
            required
            multiline
            rows={3}
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            hint="Para quem não enxerga a imagem. Ex.: Crianças montando uma cabana na mata."
            error={alt && alt.trim().length < 5 ? 'Escreva ao menos 5 caracteres.' : undefined}
          />
          <Count value={alt} max={160} />
        </div>
        <Check2>
          <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
          <span>Tenho autorização dos responsáveis pelas crianças que aparecem nesta foto.</span>
        </Check2>
        <Notice />
        {error ? <Alert tone="err">{error}</Alert> : null}
        <Buttons>
          <Button variant="ghost" onClick={onBack} disabled={busy}>
            Voltar
          </Button>
          <Button variant="outline" disabled={!canSend} onClick={() => send(false)}>
            Enviar sem recortar
          </Button>
          <Button disabled={!canSend} onClick={() => send(true)}>
            {busy ? 'Enviando…' : 'Recortar e usar'}
          </Button>
        </Buttons>
      </Side>
    </Cols>
  );
}

const Tabs = styled.div`
  display: flex;
  gap: var(--space-2);
  border-bottom: var(--border-thick) solid var(--line);
`;
const TabBtn = styled.button`
  min-height: var(--tap-min);
  padding: 0 var(--space-4);
  border: 0;
  border-bottom: 4px solid transparent;
  margin-bottom: -2px;
  background: transparent;
  color: var(--ink-muted);
  font: 700 16px/22px var(--font-body);
  cursor: pointer;

  &[aria-selected='true'] {
    color: var(--brand);
    border-bottom-color: var(--brand);
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: -3px;
  }
`;
const Zone = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-8) var(--space-5);
  border: var(--border-thick) dashed var(--line-strong);
  border-radius: var(--radius-lg);
  color: var(--ink-muted);
  text-align: center;

  strong {
    color: var(--ink);
    font: 800 18px/24px var(--font-body);
  }
  &[data-over='true'] {
    border-color: var(--brand);
    background: var(--brand-soft);
  }
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--space-3);
  max-height: 46vh;
  overflow-y: auto;
  padding: 4px;
`;
const Tile = styled.button`
  position: relative;
  padding: 0;
  border: var(--border-thick) solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--surface-raised);
  cursor: pointer;

  &[aria-pressed='true'] {
    border-color: var(--brand);
    box-shadow: 0 0 0 3px var(--brand-soft);
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
`;
const Thumb = styled.span`
  position: relative;
  display: block;
  width: 100%;
`;
const Check = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--brand);
  color: var(--on-brand);
`;
const Small = styled.p`
  margin: var(--space-2) 0 0;
  font: 600 14px/20px var(--font-body);
  color: var(--ink-muted);
`;
const Cols = styled.div`
  display: grid;
  gap: var(--space-6);
  grid-template-columns: 1fr;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  }
`;
const ViewWrap = styled.div`
  max-width: 560px;
  margin: 0 auto;
`;
const View = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: var(--carvao-900);
  cursor: grab;
  touch-action: none;
  user-select: none;

  img {
    position: absolute;
    max-width: none;
    pointer-events: none;
  }
  &:active {
    cursor: grabbing;
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }
`;
const Loading = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--branco);
  font: 700 15px/20px var(--font-body);
`;
const Zoom = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  max-width: 560px;
  margin: var(--space-3) auto 0;
  font: 700 15px/20px var(--font-body);

  input {
    flex: 1;
    accent-color: var(--brand);
    min-height: var(--tap-min);
  }
`;
const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
`;
const Check2 = styled.label`
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
  font: 600 15px/22px var(--font-body);

  input {
    width: 22px;
    height: 22px;
    margin: 2px 0 0;
    accent-color: var(--brand);
    flex: none;
  }
`;
const Buttons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  justify-content: flex-end;
`;
