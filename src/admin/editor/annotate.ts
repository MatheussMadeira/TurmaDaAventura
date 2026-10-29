import { sectionSchemas, type SectionType } from '@/content/sections/schemas';
import { describe, labelAt, mediaSlots, nodeAt, textLeaves } from './describe';

/**
 * Marca no DOM da prévia o que é editável. Os componentes do site recebem texto puro por props
 * (não sabem que existe editor), então a ligação é feita DEPOIS de renderizar: cada texto do
 * conteúdo é procurado no elemento que o mostra. O que não tem correspondência segura (texto
 * quebrado em vários elementos, valor repetido) continua editável pelo painel da direita.
 */
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

const ATTRS = ['data-edit-path', 'data-edit-label', 'data-edit-kind', 'data-edit-max'];

export function clearAnnotations(root: ParentNode) {
  root.querySelectorAll('[data-edit-path]').forEach((el) => {
    ATTRS.forEach((a) => el.removeAttribute(a));
  });
}

const ownText = (el: Element) =>
  norm(
    Array.from(el.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent ?? '')
      .join(''),
  );

export const counterLabel = (label: string, length: number, max?: number) =>
  max ? `${label} · ${length}/${max}` : label;

export function annotateSection(root: HTMLElement, type: SectionType, content: unknown) {
  clearAnnotations(root);
  const schema = describe(sectionSchemas[type]);

  // textos
  const pending = textLeaves(schema, content).map(([path, value]) => ({
    path,
    value: norm(value),
    used: false,
  }));
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  for (let n = walker.nextNode() as Element | null; n; n = walker.nextNode() as Element | null) {
    if (n.closest('svg, script, style, [data-edit-path]')) continue;
    const text = ownText(n);
    if (!text) continue;
    const leaf = pending.find((l) => !l.used && l.value === text);
    if (!leaf) continue;
    leaf.used = true;
    const node = nodeAt(schema, leaf.path);
    const max = node?.kind === 'text' ? node.max : undefined;
    n.setAttribute('data-edit-path', leaf.path);
    n.setAttribute('data-edit-kind', 'text');
    if (max) n.setAttribute('data-edit-max', String(max));
    n.setAttribute(
      'data-edit-label',
      counterLabel(labelAt(schema, leaf.path) || 'Texto', leaf.value.length, max),
    );
  }

  // fotos: só quando o número de molduras bate com o de campos de foto (senão não arrisca)
  const slots = mediaSlots(schema, content);
  const frames = Array.from(root.querySelectorAll<HTMLElement>('[data-media]'));
  if (slots.length && frames.length === slots.length) {
    slots.forEach(([path, , label], i) => {
      const frame = frames[i]!;
      frame.setAttribute('data-edit-path', path);
      frame.setAttribute('data-edit-kind', 'image');
      frame.setAttribute('data-edit-label', `${label} · Trocar foto`);
    });
  }
}
