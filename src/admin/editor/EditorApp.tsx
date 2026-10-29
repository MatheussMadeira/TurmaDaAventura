'use client';

import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import styled from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { Logo } from '@/components/atoms/Logo';
import { Select } from '@/components/atoms/Select';
import { TextField } from '@/components/atoms/TextField';
import { parseSection, sectionSchemas, type SectionType } from '@/content/sections/schemas';
import type { ImageRef } from '@/content/types';
import {
  discardAction,
  publishAction,
  saveDraftAction,
  saveLayoutAction,
} from '@/app/admin/_actions/editor';
import { Alert } from '../ui/controls';
import { Dialog } from '../ui/Dialog';
import { Count } from '../ui/layout';
import type { PickerPhoto } from '../ui/MediaPicker';
import { useToast } from '../ui/Toast';
import { describe, nodeAt, setAt, getAt } from './describe';
import { FieldPanel, type PanelApi } from './FieldPanel';
import { canRedo, canUndo, initHistory, push, redo, undo } from './history';
import { PhotoDialog } from './PhotoDialog';
import {
  type FrameMsg,
  type HostMsg,
  type SectionState,
  type Selection,
  unwrap,
  wrap,
} from './protocol';
import { SectionList } from './SectionList';

export interface EditorAppProps {
  slug: string;
  path: string;
  pages: { slug: string; title: string }[];
  initialSections: SectionState[];
  initialMedia: Record<string, ImageRef>;
  initialPending: number;
  library: PickerPhoto[];
}

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'invalid';

const DESKTOP_W = 1280;
const MOBILE_W = 390;

const SAVE_TEXT: Record<SaveState, string> = {
  idle: '',
  dirty: 'Alterações ainda não salvas…',
  saving: 'Salvando…',
  saved: 'Rascunho salvo',
  error: 'Não foi possível salvar',
  invalid: 'Corrija os campos marcados para salvar',
};

/** Erros do schema por seção: { "hero": { "title": "Título: preencha o campo" } } */
function validate(sections: SectionState[]) {
  const out: Record<string, Record<string, string>> = {};
  for (const s of sections) {
    const r = parseSection(s.type, s.content);
    if (r.success) continue;
    const errs: Record<string, string> = {};
    for (const i of r.error.issues) {
      const p = i.path.join('.');
      if (!(p in errs)) errs[p] = i.message;
    }
    out[s.key] = errs;
  }
  return out;
}

const NARROW = '(max-width: 1099px)';
const subscribeNarrow = (cb: () => void) => {
  const mq = window.matchMedia(NARROW);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const isNarrow = () => window.matchMedia(NARROW).matches;

const layoutKey = (s: SectionState[]) => JSON.stringify(s.map((x) => [x.key, x.visible]));

export function EditorApp(props: EditorAppProps) {
  const { slug, path, pages, library: initialLibrary } = props;
  const router = useRouter();
  const toast = useToast();
  const frame = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  const [hist, setHist] = useState(() => initHistory(props.initialSections));
  const sections = hist.present;
  const sectionsRef = useRef(sections);
  useLayoutEffect(() => {
    sectionsRef.current = sections;
  });

  const [media, setMedia] = useState(props.initialMedia);
  const [library, setLibrary] = useState(initialLibrary);
  const [selected, setSelected] = useState<Selection | null>(null);
  // tela pequena: a prévia nasce em tamanho real de celular; a pessoa pode trocar
  const narrow = useSyncExternalStore(subscribeNarrow, isNarrow, () => false);
  const [chosenDevice, setDevice] = useState<'desktop' | 'mobile' | null>(null);
  const device = chosenDevice ?? (narrow ? 'mobile' : 'desktop');
  const [drawer, setDrawer] = useState<'sections' | 'fields' | null>(null);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(props.initialPending);
  const [save, setSave] = useState<SaveState>('idle');
  const [photo, setPhoto] = useState<{
    key: string;
    path: string;
    ratio: string;
    label: string;
  } | null>(null);
  const [sheet, setSheet] = useState<Selection | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [stageSize, setStageSize] = useState({ w: 800, h: 600 });

  const errors = useMemo(() => validate(sections), [sections]);
  const invalid = useMemo(() => new Set(Object.keys(errors)), [errors]);

  /* ---------- tamanho da área da prévia e modo estreito ---------- */
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setStageSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ---------- edição (com histórico) ---------- */
  const edit = useCallback(
    (fn: (s: SectionState[]) => SectionState[], coalesce: string | null = null) =>
      setHist((h) => push(h, fn(h.present), coalesce)),
    [],
  );

  const setField = useCallback(
    (key: string, fieldPath: string, value: unknown, typing = false) =>
      edit(
        (all) =>
          all.map((s) =>
            s.key === key ? { ...s, content: setAt(s.content, fieldPath, value) } : s,
          ),
        typing ? `${key}:${fieldPath}` : null,
      ),
    [edit],
  );

  const moveSection = useCallback(
    (key: string, dir: -1 | 1) =>
      edit((all) => {
        const i = all.findIndex((s) => s.key === key);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= all.length) return all;
        const next = [...all];
        [next[i], next[j]] = [next[j]!, next[i]!];
        return next;
      }),
    [edit],
  );

  const reorder = useCallback(
    (from: number, to: number) =>
      edit((all) => {
        const next = [...all];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item!);
        return next;
      }),
    [edit],
  );

  const toggle = useCallback(
    (key: string) =>
      edit((all) => all.map((s) => (s.key === key ? { ...s, visible: !s.visible } : s))),
    [edit],
  );

  const doUndo = useCallback(() => setHist((h) => undo(h)), []);
  const doRedo = useCallback(() => setHist((h) => redo(h)), []);

  /* Ctrl/Cmd+Z fora de campos de texto (dentro deles vale o desfazer do próprio campo) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.closest('input, textarea, select, [contenteditable="true"]') || t.isContentEditable)
      ) {
        return;
      }
      const k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) {
        e.preventDefault();
        doUndo();
      } else if ((k === 'z' && e.shiftKey) || k === 'y') {
        e.preventDefault();
        doRedo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doUndo, doRedo]);

  /* ---------- rascunho salvo sozinho (debounce ~1 s) ---------- */
  const saved = useRef({
    content: new Map(props.initialSections.map((s) => [s.key, JSON.stringify(s.content)])),
    layout: layoutKey(props.initialSections),
  });
  const chain = useRef<Promise<void>>(Promise.resolve());

  const doFlush = useCallback(async () => {
    const all = sectionsRef.current;
    const ops: { s: SectionState; json: string }[] = [];
    let skipped = false;
    for (const s of all) {
      const json = JSON.stringify(s.content);
      if (saved.current.content.get(s.key) === json) continue;
      if (!parseSection(s.type, s.content).success) {
        skipped = true; // incompleto: fica só na tela até ser corrigido
        continue;
      }
      ops.push({ s, json });
    }
    const layout = layoutKey(all);
    const layoutDirty = layout !== saved.current.layout;
    if (!ops.length && !layoutDirty) {
      setSave(skipped ? 'invalid' : 'saved');
      return;
    }
    setSave('saving');
    let failed = false;
    for (const { s, json } of ops) {
      const r = await saveDraftAction(slug, s.key, s.content);
      if (r.ok) {
        saved.current.content.set(s.key, json);
        if (r.data) setPending(r.data.pending);
      } else failed = true;
    }
    if (layoutDirty) {
      const r = await saveLayoutAction(
        slug,
        all.map((s) => ({ key: s.key, visible: s.visible })),
      );
      if (r.ok) {
        saved.current.layout = layout;
        if (r.data) setPending(r.data.pending);
      } else failed = true;
    }
    setSave(failed ? 'error' : skipped ? 'invalid' : 'saved');
  }, [slug]);

  const flush = useCallback(() => {
    chain.current = chain.current.then(doFlush).catch(() => setSave('error'));
    return chain.current;
  }, [doFlush]);

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setSave('dirty');
    const t = window.setTimeout(() => void flush(), 1000);
    return () => window.clearTimeout(t);
  }, [sections, flush]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (save === 'dirty' || save === 'saving' || save === 'error' || save === 'invalid') {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [save]);

  /* ---------- conversa com a prévia ---------- */
  const post = useCallback((msg: HostMsg) => {
    frame.current?.contentWindow?.postMessage(wrap(msg), window.location.origin);
  }, []);

  useEffect(() => {
    if (!ready) return;
    post({ kind: 'state', sections, media, mobile: device === 'mobile', selected });
  }, [ready, sections, media, device, selected, post]);

  const select = useCallback(
    (key: string, fieldPath?: string, fromFrame = false) => {
      setSelected({ key, path: fieldPath });
      if (!fromFrame) post({ kind: 'scroll', key });
    },
    [post],
  );

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const m = unwrap<FrameMsg>(e, frame.current?.contentWindow ?? null);
      if (!m) return;
      switch (m.kind) {
        case 'ready':
          setReady(true);
          break;
        case 'select': {
          select(m.key, m.path, true);
          // no celular, tocar num texto abre a folha inferior com o campo
          if (m.path) {
            const s = sectionsRef.current.find((x) => x.key === m.key);
            const node = s ? nodeAt(describe(sectionSchemas[s.type]), m.path) : null;
            if (node?.kind === 'text' && isNarrow()) {
              setSheet({ key: m.key, path: m.path });
            }
          }
          break;
        }
        case 'text-live':
          setField(m.key, m.path, m.value, true);
          break;
        case 'pick-image': {
          const s = sectionsRef.current.find((x) => x.key === m.key);
          if (!s) break;
          const schema = describe(sectionSchemas[s.type]);
          const node = nodeAt(schema, m.path);
          if (node?.kind === 'media') {
            setPhoto({ key: m.key, path: m.path, ratio: node.ratio, label: node.label });
          }
          break;
        }
        default:
          break;
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [select, setField]);

  /* ---------- ações ---------- */
  const goToPage = async (next: string) => {
    await flush();
    router.push(`/admin/editor?pagina=${encodeURIComponent(next)}`);
  };

  const publish = async () => {
    setPublishing(true);
    try {
      await flush();
      const bad = Object.keys(validate(sectionsRef.current));
      if (bad.length) {
        select(bad[0]!);
        toast.show({ message: 'Corrija os campos marcados antes de publicar.' });
        return;
      }
      const r = await publishAction(slug);
      if (r.ok) {
        setPending(0);
        setSave('saved');
        toast.show({
          message: r.message ?? 'Alterações publicadas.',
          link: { href: path, label: 'Ver no site' },
        });
      } else {
        toast.show({ message: r.error });
      }
    } finally {
      setPublishing(false);
    }
  };

  const discard = async () => {
    setConfirmDiscard(false);
    const r = await discardAction(slug);
    if (r.ok) {
      toast.show({ message: r.message ?? 'Rascunho descartado.' });
      window.location.reload(); // volta ao que está no ar
    } else toast.show({ message: r.error });
  };

  const onPhoto = (p: PickerPhoto) => {
    if (!photo) return;
    setLibrary((l) => (l.some((x) => x.id === p.id) ? l : [p, ...l]));
    setMedia((m) => ({
      ...m,
      [p.id]: { src: p.url, alt: p.alt, width: p.width, height: p.height },
    }));
    setField(photo.key, photo.path, p.id);
    setPhoto(null);
  };

  /* ---------- painéis ---------- */
  const current = sections.find((s) => s.key === selected?.key) ?? null;
  const schema = current ? describe(sectionSchemas[current.type as SectionType]) : null;

  const api: PanelApi | null = current
    ? {
        errors: errors[current.key] ?? {},
        media,
        set: (p, v, typing) => setField(current.key, p, v, typing),
        pick: (p, ratio, label) => setPhoto({ key: current.key, path: p, ratio, label }),
      }
    : null;

  const sectionsPanel = (
    <>
      <PanelTitle>Seções da página</PanelTitle>
      <SectionList
        sections={sections}
        selectedKey={selected?.key ?? null}
        invalid={invalid}
        onSelect={(k) => {
          select(k);
          if (narrow) setDrawer(null);
        }}
        onMove={moveSection}
        onReorder={reorder}
        onToggle={toggle}
      />
      <Hint>Cabeçalho e rodapé são globais: edite em “Contato e WhatsApp”.</Hint>
    </>
  );

  const fieldsPanel = (
    <>
      <PanelTitle>{current ? current.title : 'Campos'}</PanelTitle>
      {current && schema && api ? (
        current.type === 'data-backed' ? (
          <Alert tone="info">
            O conteúdo desta seção vem das telas de Restaurantes, Atividades e Equipe. Aqui dá para
            mudar a posição dela na página ou escondê-la.
          </Alert>
        ) : (
          <FieldPanel
            key={current.key}
            schema={schema}
            content={current.content}
            api={api}
            focusPath={selected?.path ?? null}
          />
        )
      ) : (
        <Hint>
          Clique em uma seção na lista, ou em um texto ou foto da página, para editar aqui.
        </Hint>
      )}
    </>
  );

  /* ---------- prévia em escala ---------- */
  const logicalW = device === 'mobile' ? MOBILE_W : DESKTOP_W;
  const scale = Math.min(1, stageSize.w / logicalW);
  const shownW = logicalW * scale;

  const status =
    pending === 0 && (save === 'idle' || save === 'saved')
      ? 'Tudo publicado'
      : pending === 0
        ? 'Alterações ainda não publicadas'
        : `${pending} ${pending === 1 ? 'alteração não publicada' : 'alterações não publicadas'}`;

  const sheetNode = sheet
    ? (() => {
        const s = sections.find((x) => x.key === sheet.key);
        const node = s && sheet.path ? nodeAt(describe(sectionSchemas[s.type]), sheet.path) : null;
        return s && sheet.path && node?.kind === 'text' ? { s, node, path: sheet.path } : null;
      })()
    : null;

  return (
    <Root>
      <Top>
        <TopLeft>
          <Back href="/admin" aria-label="Voltar ao painel">
            <Logo variant="compact" tone="white" height={32} />
          </Back>
          <PageSelect>
            <Select
              label="Editando a página"
              value={slug}
              options={pages.map((p) => ({ value: p.slug, label: p.title }))}
              onChange={(e) => void goToPage(e.target.value)}
            />
          </PageSelect>
        </TopLeft>

        <TopMid>
          <Seg role="group" aria-label="Tamanho da prévia">
            <SegBtn
              type="button"
              aria-pressed={device === 'desktop'}
              onClick={() => setDevice('desktop')}
            >
              Computador
            </SegBtn>
            <SegBtn
              type="button"
              aria-pressed={device === 'mobile'}
              onClick={() => setDevice('mobile')}
            >
              Celular
            </SegBtn>
          </Seg>
          <TopBtn type="button" onClick={doUndo} disabled={!canUndo(hist)}>
            Desfazer
          </TopBtn>
          <TopBtn type="button" onClick={doRedo} disabled={!canRedo(hist)}>
            Refazer
          </TopBtn>
        </TopMid>

        <TopRight>
          <StatusBox>
            <strong data-pending={pending > 0}>{status}</strong>
            <span role="status" aria-live="polite">
              {SAVE_TEXT[save]}
              {save === 'error' ? (
                <>
                  {' '}
                  <button type="button" onClick={() => void flush()}>
                    Tentar de novo
                  </button>
                </>
              ) : null}
            </span>
          </StatusBox>
          {pending > 0 ? (
            <TopBtn type="button" onClick={() => setConfirmDiscard(true)}>
              Descartar
            </TopBtn>
          ) : null}
          <TopLink href={path} target="_blank" rel="noopener noreferrer">
            Ver no site
          </TopLink>
          <Publish type="button" onClick={() => void publish()} disabled={publishing}>
            {publishing ? 'Publicando…' : 'Publicar alterações'}
          </Publish>
        </TopRight>
      </Top>

      {narrow ? (
        <Mobilebar>
          <TopBtn type="button" onClick={() => setDrawer('sections')}>
            Seções
          </TopBtn>
          <TopBtn type="button" onClick={() => setDrawer('fields')} disabled={!current}>
            Campos
          </TopBtn>
        </Mobilebar>
      ) : null}

      <Body data-narrow={narrow}>
        {!narrow ? <Left aria-label="Seções">{sectionsPanel}</Left> : null}
        <Center ref={stage} data-device={device}>
          <FrameBox style={{ width: shownW, height: '100%' }}>
            <iframe
              ref={frame}
              key={slug}
              title={`Prévia da página ${props.path}`}
              src={`/admin/preview/${slug}`}
              style={{
                width: logicalW,
                height: stageSize.h / scale,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                border: 0,
                background: 'var(--surface-page, white)',
                display: 'block',
              }}
            />
          </FrameBox>
        </Center>
        {!narrow ? <Right aria-label="Campos do bloco selecionado">{fieldsPanel}</Right> : null}
      </Body>

      {narrow ? (
        <>
          <Dialog
            open={drawer === 'sections'}
            sheet
            onClose={() => setDrawer(null)}
            title="Seções"
            footer={<Button onClick={() => setDrawer(null)}>Fechar</Button>}
          >
            {sectionsPanel}
          </Dialog>
          <Dialog
            open={drawer === 'fields'}
            sheet
            onClose={() => setDrawer(null)}
            title={current?.title ?? 'Campos'}
            footer={<Button onClick={() => setDrawer(null)}>Fechar</Button>}
          >
            {fieldsPanel}
          </Dialog>
        </>
      ) : null}

      <Dialog
        open={!!sheetNode}
        sheet
        onClose={() => setSheet(null)}
        title={sheetNode ? sheetNode.node.label : 'Texto'}
        footer={
          <>
            <Button variant="ghost" onClick={doUndo} disabled={!canUndo(hist)}>
              Desfazer
            </Button>
            <Button onClick={() => setSheet(null)}>Aplicar</Button>
          </>
        }
      >
        {sheetNode ? (
          <div>
            <TextField
              label={sheetNode.node.label}
              multiline={sheetNode.node.multiline}
              rows={4}
              value={String(getAt(sheetNode.s.content, sheetNode.path) ?? '')}
              hint={sheetNode.node.hint}
              error={errors[sheetNode.s.key]?.[sheetNode.path]}
              onChange={(e) => setField(sheetNode.s.key, sheetNode.path, e.target.value, true)}
            />
            {sheetNode.node.max ? (
              <Count
                value={String(getAt(sheetNode.s.content, sheetNode.path) ?? '')}
                max={sheetNode.node.max}
              />
            ) : null}
          </div>
        ) : null}
      </Dialog>

      <PhotoDialog
        open={!!photo}
        onClose={() => setPhoto(null)}
        label={photo?.label ?? 'Foto'}
        ratio={photo?.ratio ?? '4 / 3'}
        currentId={
          photo
            ? (() => {
                const s = sections.find((x) => x.key === photo.key);
                const v = s ? getAt(s.content, photo.path) : null;
                return typeof v === 'string' ? v : null;
              })()
            : null
        }
        library={library}
        onDone={onPhoto}
      />

      <Dialog
        open={confirmDiscard}
        alert
        onClose={() => setConfirmDiscard(false)}
        title="Descartar o rascunho?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDiscard(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void discard()}>Descartar rascunho</Button>
          </>
        }
      >
        <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
          Todas as alterações ainda não publicadas desta página serão perdidas. O que está no ar não
          muda.
        </p>
      </Dialog>
    </Root>
  );
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: var(--surface-sunken);
  color: var(--ink);
  font-family: var(--font-body);
`;
const Top = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3) var(--space-5);
  padding: var(--space-2) var(--space-4);
  background: var(--surface-forest);
  color: var(--ink-on-forest);
`;
const TopLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-4);
`;
const Back = styled.a`
  display: inline-flex;
  align-items: center;
  min-height: var(--tap-min);
  border-radius: var(--radius-sm);

  &:focus-visible {
    outline: 3px solid var(--focus-on-forest);
    outline-offset: 2px;
  }
`;
const PageSelect = styled.div`
  min-width: 190px;
  /* o rótulo fica visível, mas discreto, sobre o verde */
  label {
    color: var(--ink-on-forest-muted);
    font-size: 12px;
  }
`;
const TopMid = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
`;
const TopRight = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
`;
const Seg = styled.div`
  display: inline-flex;
  border: var(--border-thick) solid var(--ink-on-forest-muted);
  border-radius: var(--radius-pill);
  overflow: hidden;
`;
const SegBtn = styled.button`
  min-height: var(--tap-min);
  padding: 0 var(--space-4);
  border: 0;
  background: transparent;
  color: var(--ink-on-forest);
  font: 700 15px/20px var(--font-body);
  cursor: pointer;

  &[aria-pressed='true'] {
    background: var(--ink-on-forest);
    color: var(--surface-forest);
  }
  &:focus-visible {
    outline: 3px solid var(--focus-on-forest);
    outline-offset: -3px;
  }
`;
const topBtn = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--tap-min);
  padding: 0 var(--space-3);
  border: var(--border-thick) solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--ink-on-forest);
  font: 700 15px/20px var(--font-body);
  text-decoration: none;
  cursor: pointer;

  &:hover:not(:disabled) { border-color: var(--ink-on-forest-muted); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
  &:focus-visible { outline: 3px solid var(--focus-on-forest); outline-offset: 2px; }
`;
const TopBtn = styled.button`
  ${topBtn}
`;
const TopLink = styled.a`
  ${topBtn}
`;
const Publish = styled.button`
  min-height: var(--tap-min);
  padding: 0 var(--space-5);
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--earth);
  color: var(--on-earth);
  font: 800 16px/22px var(--font-body);
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--earth-hover);
  }
  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
  &:focus-visible {
    outline: 3px solid var(--focus-on-forest);
    outline-offset: 2px;
  }
`;
const StatusBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font: 600 13px/18px var(--font-body);
  color: var(--ink-on-forest-muted);

  strong {
    font: 800 14px/18px var(--font-body);
    color: var(--ink-on-forest);
  }
  button {
    border: 0;
    background: none;
    padding: 0;
    color: inherit;
    font: inherit;
    text-decoration: underline;
    cursor: pointer;
  }
`;
const Mobilebar = styled.div`
  display: flex;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background: var(--surface-forest);
  border-top: var(--border-thin) solid var(--ink-on-forest-muted);
`;
const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr) 360px;

  &[data-narrow='true'] {
    grid-template-columns: minmax(0, 1fr);
  }
`;
const side = `
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  background: var(--surface-raised);
`;
const Left = styled.nav`
  ${side}
  border-right: var(--border-thin) solid var(--line);
`;
const Right = styled.aside`
  ${side}
  border-left: var(--border-thin) solid var(--line);
`;
const Center = styled.main`
  min-width: 0;
  min-height: 0;
  overflow: auto;
  display: flex;
  justify-content: center;
  padding: 0;
  background: var(--surface-sunken);

  &[data-device='mobile'] {
    padding: var(--space-4) 0;
  }
`;
const FrameBox = styled.div`
  flex: none;
  overflow: hidden;
  background: var(--surface-page, var(--branco));
  box-shadow: var(--shadow-md);
`;
const PanelTitle = styled.h2`
  margin: 0;
  font: 800 16px/22px var(--font-body);
  color: var(--ink);
`;
const Hint = styled.p`
  margin: 0;
  font: 600 14px/20px var(--font-body);
  color: var(--ink-muted);
`;
