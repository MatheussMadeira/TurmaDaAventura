import type { ImageRef } from '@/content/types';
import type { SectionType } from '@/content/sections/schemas';

/** Estado de uma seção como editor e prévia o enxergam. */
export interface SectionState {
  key: string;
  title: string;
  type: SectionType;
  content: unknown;
  visible: boolean;
}

export interface Selection {
  key: string;
  /** caminho do campo dentro da seção (ex.: "cards.1.title"); ausente = a seção inteira */
  path?: string;
}

/** editor → prévia */
export type HostMsg =
  | {
      kind: 'state';
      sections: SectionState[];
      media: Record<string, ImageRef>;
      mobile: boolean;
      selected: Selection | null;
    }
  | { kind: 'scroll'; key: string };

/** prévia → editor */
export type FrameMsg =
  | { kind: 'ready' }
  | { kind: 'select'; key: string; path?: string }
  | { kind: 'text-live'; key: string; path: string; value: string }
  | { kind: 'text-end' }
  | { kind: 'pick-image'; key: string; path: string };

const TAG = 'tda-editor';

export const wrap = (msg: HostMsg | FrameMsg) => ({ tag: TAG, msg });

/** Aceita só mensagens do mesmo site e da janela esperada; qualquer outra coisa é ignorada. */
export function unwrap<T extends HostMsg | FrameMsg>(
  e: MessageEvent,
  expected: Window | null,
): T | null {
  if (e.origin !== window.location.origin) return null;
  if (!expected || e.source !== expected) return null;
  const d = e.data as { tag?: unknown; msg?: unknown } | null;
  if (!d || d.tag !== TAG || typeof d.msg !== 'object' || d.msg === null) return null;
  return d.msg as T;
}
