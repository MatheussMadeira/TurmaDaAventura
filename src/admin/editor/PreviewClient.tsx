'use client';

import { MotionConfig } from 'framer-motion';
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createGlobalStyle } from 'styled-components';
import type { ImageRef } from '@/content/types';
import { eventosRenderers } from '@/site/pages/eventos';
import { inicioRenderers } from '@/site/pages/inicio';
import { festasRenderers } from '@/site/pages/festas';
import { oficinasRenderers } from '@/site/pages/oficinas';
import { produtosRenderers } from '@/site/pages/produtos';
import { quemSomosRenderers } from '@/site/pages/quemSomos';
import { restaurantesRenderers } from '@/site/pages/restaurantes';
import type { Ctx, Renderer } from '@/site/render';
import { sectionTitle } from '@/content/sections/labels';
import { pageBySlug, sectionName } from '@/content/sections/schemas';
import { annotateSection, counterLabel } from './annotate';
import {
  type FrameMsg,
  type HostMsg,
  type SectionState,
  type Selection,
  unwrap,
  wrap,
} from './protocol';

/* eslint-disable @typescript-eslint/no-explicit-any */
const RENDERERS: Record<string, Record<string, Renderer<any>>> = {
  inicio: inicioRenderers,
  oficinas: oficinasRenderers,
  'festas-e-aniversarios': festasRenderers,
  restaurantes: restaurantesRenderers,
  'eventos-corporativos': eventosRenderers,
  produtos: produtosRenderers,
  'quem-somos': quemSomosRenderers,
};

const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

/** Contornos do modo edição: tracejado `earth` ao passar o mouse, `brand` no selecionado. */
const EditStyle = createGlobalStyle`
  [data-editor-section] { position: relative; }
  [data-editor-section].is-selected { box-shadow: inset 0 0 0 var(--border-thick) var(--brand); }
  [data-editor-hidden] {
    padding: var(--space-5);
    text-align: center;
    font: 700 15px/22px var(--font-body);
    color: var(--ink-muted);
    background: var(--areia-100);
    border: var(--border-thick) dashed var(--line-strong);
  }
  [data-edit-path] {
    cursor: text;
    outline: var(--border-thick) dashed transparent;
    outline-offset: 3px;
    border-radius: var(--radius-sm);
    position: relative;
  }
  [data-edit-kind="image"] { cursor: pointer; }
  [data-edit-path]:hover { outline-color: var(--earth); }
  [data-edit-path].is-selected { outline-color: var(--brand); }
  [data-edit-path].is-selected::after,
  [data-edit-path]:hover::after {
    content: attr(data-edit-label);
    position: absolute;
    left: 0;
    bottom: 100%;
    margin-bottom: 6px;
    z-index: 30;
    max-width: 90vw;
    padding: 2px var(--space-2);
    border-radius: var(--radius-sm);
    background: var(--earth);
    color: var(--on-earth);
    font: 800 12px/18px var(--font-body);
    letter-spacing: 0;
    text-transform: none;
    white-space: nowrap;
    pointer-events: none;
  }
  [data-edit-path].is-selected::after { background: var(--brand); color: var(--on-brand); }
  [data-edit-kind="image"]::after { top: 6px; bottom: auto; left: 6px; margin: 0; }
  [data-editing="true"] { outline-color: var(--brand); outline-style: solid; cursor: text; }
  [data-edit-path][data-mobile-preview="true"] { cursor: pointer; }
`;

export interface PreviewProps {
  slug: string;
  sections: SectionState[];
  media: Record<string, ImageRef>;
  data: Record<string, unknown>;
}

export function PreviewClient({
  slug,
  sections: initial,
  media: initialMedia,
  data,
}: PreviewProps) {
  const [sections, setSections] = useState(initial);
  const [media, setMedia] = useState(initialMedia);
  const [mobile, setMobile] = useState(false);
  const [selected, setSelected] = useState<Selection | null>(null);
  const [revs, setRevs] = useState<Record<string, number>>({});
  const editing = useRef<HTMLElement | null>(null);
  const deferred = useRef<HostMsg | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const state = useRef({ selected, mobile });
  useLayoutEffect(() => {
    state.current = { selected, mobile };
  });

  const post = useCallback(
    (msg: FrameMsg) => window.parent.postMessage(wrap(msg), window.location.origin),
    [],
  );

  const apply = useCallback((m: Extract<HostMsg, { kind: 'state' }>) => {
    setSections(m.sections);
    setMedia(m.media);
    setMobile(m.mobile);
    setSelected(m.selected);
  }, []);

  /* editor → prévia */
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const m = unwrap<HostMsg>(e, window.parent);
      if (!m) return;
      if (m.kind === 'state') {
        if (editing.current)
          deferred.current = m; // não mexe no DOM enquanto alguém digita
        else apply(m);
      } else if (m.kind === 'scroll') {
        const el = rootRef.current?.querySelector(`[data-editor-section="${CSS.escape(m.key)}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    window.addEventListener('message', onMessage);
    post({ kind: 'ready' });
    return () => window.removeEventListener('message', onMessage);
  }, [apply, post]);

  /* marca o que é editável e a seleção (depois de cada renderização) */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || editing.current) return;
    for (const el of root.querySelectorAll<HTMLElement>('[data-editor-section]')) {
      const s = sections.find((x) => x.key === el.dataset.editorSection);
      if (!s || !s.visible) continue;
      annotateSection(el, s.type, s.content);
      el.classList.toggle('is-selected', selected?.key === s.key && !selected.path);
    }
    root
      .querySelectorAll('.is-selected[data-edit-path]')
      .forEach((el) => el.classList.remove('is-selected'));
    if (selected?.path) {
      const sec = root.querySelector(`[data-editor-section="${CSS.escape(selected.key)}"]`);
      sec
        ?.querySelector(`[data-edit-path="${CSS.escape(selected.path)}"]`)
        ?.classList.add('is-selected');
    }
    root
      .querySelectorAll('[data-edit-kind="text"]')
      .forEach((el) => el.toggleAttribute('data-mobile-preview', mobile));
  }, [sections, media, revs, selected, mobile]);

  /* cliques, edição no lugar */
  useEffect(() => {
    const endEdit = (el: HTMLElement, key: string, original: ChildNode | null) => {
      el.removeAttribute('contenteditable');
      el.removeAttribute('data-editing');
      editing.current = null;
      // se o navegador trocou o nó de texto, o React perdeu a referência: reconstrói a seção
      const intact = el.childNodes.length === 1 && el.firstChild === original;
      if (!intact) setRevs((r) => ({ ...r, [key]: (r[key] ?? 0) + 1 }));
      post({ kind: 'text-end' });
      if (deferred.current) {
        apply(deferred.current as Extract<HostMsg, { kind: 'state' }>);
        deferred.current = null;
      }
    };

    const startEdit = (el: HTMLElement, key: string, path: string) => {
      const max = Number(el.dataset.editMax) || undefined;
      const label = el.dataset.editLabel?.split(' · ').slice(0, -1).join(' · ') || 'Texto';
      const original = el.firstChild;
      editing.current = el;
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('data-editing', 'true');
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      const selectedLength = () => window.getSelection()?.toString().length ?? 0;
      const onBeforeInput = (e: InputEvent) => {
        if (e.inputType === 'insertParagraph' || e.inputType === 'insertLineBreak') {
          e.preventDefault();
          el.blur();
          return;
        }
        if (max && e.inputType.startsWith('insert') && e.data) {
          const room = max - (el.textContent?.length ?? 0) + selectedLength();
          if (e.data.length > room) e.preventDefault();
        }
      };
      const onPaste = (e: ClipboardEvent) => {
        e.preventDefault();
        let text = norm(e.clipboardData?.getData('text/plain') ?? '');
        if (max)
          text = text.slice(0, Math.max(0, max - (el.textContent?.length ?? 0) + selectedLength()));
        if (text) document.execCommand('insertText', false, text);
      };
      const onInput = () => {
        const value = (el.textContent ?? '').replace(/\s+/g, ' ');
        el.setAttribute('data-edit-label', counterLabel(label, value.trim().length, max));
        post({ kind: 'text-live', key, path, value });
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') el.blur();
      };
      const onBlur = () => {
        el.removeEventListener('beforeinput', onBeforeInput);
        el.removeEventListener('paste', onPaste);
        el.removeEventListener('input', onInput);
        el.removeEventListener('keydown', onKey);
        el.removeEventListener('blur', onBlur);
        endEdit(el, key, original);
      };
      el.addEventListener('beforeinput', onBeforeInput);
      el.addEventListener('paste', onPaste);
      el.addEventListener('input', onInput);
      el.addEventListener('keydown', onKey);
      el.addEventListener('blur', onBlur);
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button[type="submit"]')) e.preventDefault(); // no editor, nada navega
      const sec = target.closest<HTMLElement>('[data-editor-section]');
      if (!sec) return;
      const key = sec.dataset.editorSection!;
      const el = target.closest<HTMLElement>('[data-edit-path]');
      if (!el) {
        post({ kind: 'select', key });
        return;
      }
      if (editing.current === el) return; // caret normal dentro do texto em edição
      const path = el.dataset.editPath!;
      if (el.dataset.editKind === 'image') {
        e.preventDefault();
        post({ kind: 'select', key, path });
        post({ kind: 'pick-image', key, path });
        return;
      }
      const cur = state.current.selected;
      if (!state.current.mobile && cur?.key === key && cur.path === path) {
        e.preventDefault();
        startEdit(el, key, path);
        return;
      }
      post({ kind: 'select', key, path });
    };

    const onSubmit = (e: Event) => e.preventDefault();
    document.addEventListener('click', onClick, true);
    document.addEventListener('submit', onSubmit, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('submit', onSubmit, true);
    };
  }, [apply, post]);

  const renderers = RENDERERS[slug] ?? {};
  const def = pageBySlug(slug);
  const ctx: Ctx<any> = { image: (id) => (id ? (media[id] ?? null) : null), data };

  return (
    <MotionConfig reducedMotion="always">
      <EditStyle />
      <div ref={rootRef}>
        {sections.map((s) => {
          const render = renderers[s.key];
          return (
            <div
              key={`${s.key}:${revs[s.key] ?? 0}`}
              data-editor-section={s.key}
              data-section-title={sectionTitle(slug, s.key)}
            >
              {s.visible ? (
                render ? (
                  <Fragment>
                    {render(s.content, ctx, def ? sectionName(def, s.key) : s.key)}
                  </Fragment>
                ) : null
              ) : (
                <div data-editor-hidden>
                  {sectionTitle(slug, s.key)} — seção oculta (não aparece no site)
                </div>
              )}
            </div>
          );
        })}
      </div>
    </MotionConfig>
  );
}
