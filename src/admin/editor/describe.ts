import type { z } from 'zod';
import type { FieldMeta } from '@/content/sections/fields';

/**
 * Lê um schema zod de seção e devolve a árvore de campos que o painel da direita desenha.
 * A fonte única é o schema (limites, rótulos, proporção das fotos): mudou lá, muda aqui.
 */
export type FieldNode =
  | {
      kind: 'text';
      label: string;
      max?: number;
      hint?: string;
      multiline?: boolean;
      required: boolean;
    }
  | { kind: 'icon'; label: string }
  | { kind: 'choice'; label: string; options: string[] }
  | { kind: 'media'; label: string; ratio: string }
  | { kind: 'number'; label: string; min?: number; max?: number }
  | { kind: 'group'; fields: { key: string; node: FieldNode }[] }
  | { kind: 'list'; label: string; singular: string; item: FieldNode; min: number; max: number };

/** Rótulos de listas pelo nome do campo: [plural, singular] */
const LIST_LABELS: Record<string, [string, string]> = {
  cards: ['Cartões', 'Cartão'],
  pillars: ['Pilares', 'Pilar'],
  steps: ['Passos', 'Passo'],
  images: ['Fotos', 'Foto'],
  items: ['Itens', 'Item'],
  features: ['Recursos', 'Recurso'],
  panels: ['Painéis', 'Painel'],
  stats: ['Números', 'Número'],
  checks: ['Itens da lista', 'Item'],
  highlights: ['Destaques', 'Destaque'],
};

/** Rótulo de campos sem metadado (campo → texto da tela) */
const KEY_LABELS: Record<string, string> = {
  tone: 'Cor',
  icon: 'Ícone',
  count: 'Quantidade de logos',
};

export const CHOICE_LABELS: Record<string, string> = {
  brand: 'Verde',
  olive: 'Oliva',
  earth: 'Terra',
  default: 'Padrão',
};

interface Def {
  type: string;
  innerType?: z.ZodType;
  element?: z.ZodType;
  shape?: Record<string, z.ZodType>;
  entries?: Record<string, string>;
  checks?: { _zod: { def: Record<string, number | string | undefined> } }[];
}
const defOf = (s: z.ZodType) => (s as unknown as { _zod: { def: Def } })._zod.def;

/** Desembrulha optional/default/nullable juntando os metadados de cada camada. */
function unwrap(schema: z.ZodType): { core: z.ZodType; meta: Partial<FieldMeta> } {
  let s = schema;
  let meta: Partial<FieldMeta> = {};
  for (let i = 0; i < 6; i++) {
    meta = { ...(s.meta() as Partial<FieldMeta> | undefined), ...meta };
    const d = defOf(s);
    if (d.innerType && ['optional', 'default', 'nullable', 'readonly'].includes(d.type)) {
      s = d.innerType;
    } else break;
  }
  return { core: s, meta };
}

function lengthBounds(schema: z.ZodType) {
  let min = 0;
  let max = Number.POSITIVE_INFINITY;
  let s: z.ZodType | undefined = schema;
  while (s) {
    const d = defOf(s);
    for (const c of d.checks ?? []) {
      const cd = c._zod.def;
      if (cd.check === 'min_length') min = Math.max(min, Number(cd.minimum));
      if (cd.check === 'max_length') max = Math.min(max, Number(cd.maximum));
      if (cd.check === 'length_equals') min = max = Number(cd.length);
    }
    s = d.innerType;
  }
  return { min, max };
}

function numberBounds(schema: z.ZodType) {
  const out: { min?: number; max?: number } = {};
  for (const c of defOf(schema).checks ?? []) {
    const cd = c._zod.def;
    if (cd.check === 'greater_than') out.min = Number(cd.value);
    if (cd.check === 'less_than') out.max = Number(cd.value);
  }
  return out;
}

function isRequiredText(schema: z.ZodType) {
  return (defOf(schema).checks ?? []).some(
    (c) => c._zod.def.check === 'min_length' && Number(c._zod.def.minimum) >= 1,
  );
}

export function describe(schema: z.ZodType, key = ''): FieldNode {
  const { core, meta } = unwrap(schema);
  const d = defOf(core);
  const label = meta.label ?? KEY_LABELS[key] ?? key;

  switch (d.type) {
    case 'object':
      return {
        kind: 'group',
        fields: Object.entries(d.shape ?? {}).map(([k, v]) => ({ key: k, node: describe(v, k) })),
      };
    case 'array': {
      const { min, max } = lengthBounds(schema);
      const [plural, singular] = LIST_LABELS[key] ?? [label || 'Itens', 'Item'];
      return {
        kind: 'list',
        label: plural,
        singular,
        item: describe(d.element as z.ZodType, key),
        min,
        max: Number.isFinite(max) ? max : 12,
      };
    }
    case 'enum': {
      const options = Object.values(d.entries ?? {});
      // ícones têm campo próprio (com prévia do desenho)
      return meta.label?.toLowerCase().includes('ícone')
        ? { kind: 'icon', label }
        : { kind: 'choice', label, options };
    }
    case 'number':
      return { kind: 'number', label, ...numberBounds(core) };
    default:
      if (meta.ratio) return { kind: 'media', label, ratio: meta.ratio };
      return {
        kind: 'text',
        label,
        max: meta.max,
        hint: meta.hint,
        multiline: meta.multiline,
        required: isRequiredText(core),
      };
  }
}

/** Valor lido/escrito por caminho ("cards.1.title"). */
export function getAt(root: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => {
    if (acc == null || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[k];
  }, root);
}

/** Cópia do conteúdo com o valor do caminho trocado (imutável). */
export function setAt<T>(root: T, path: string, value: unknown): T {
  const keys = path.split('.');
  const walk = (node: unknown, i: number): unknown => {
    if (i === keys.length) return value;
    const k = keys[i]!;
    if (Array.isArray(node)) {
      const copy = [...node];
      copy[Number(k)] = walk(node[Number(k)], i + 1);
      return copy;
    }
    const obj = (node ?? {}) as Record<string, unknown>;
    return { ...obj, [k]: walk(obj[k], i + 1) };
  };
  return walk(root, 0) as T;
}

/** Folhas de texto editáveis do conteúdo: [caminho, valor] (só strings dos campos "text"). */
export function textLeaves(node: FieldNode, value: unknown, path = ''): [string, string][] {
  const out: [string, string][] = [];
  if (node.kind === 'text') {
    if (typeof value === 'string' && value.trim()) out.push([path, value]);
  } else if (node.kind === 'group') {
    for (const f of node.fields) {
      out.push(...textLeaves(f.node, getAt(value, f.key), path ? `${path}.${f.key}` : f.key));
    }
  } else if (node.kind === 'list' && Array.isArray(value)) {
    value.forEach((v, i) => out.push(...textLeaves(node.item, v, path ? `${path}.${i}` : `${i}`)));
  }
  return out;
}

/** Campos de foto do conteúdo: [caminho, proporção, rótulo]. */
export function mediaSlots(node: FieldNode, value: unknown, path = ''): [string, string, string][] {
  const out: [string, string, string][] = [];
  if (node.kind === 'media') out.push([path, node.ratio, node.label]);
  else if (node.kind === 'group') {
    for (const f of node.fields) {
      out.push(...mediaSlots(f.node, getAt(value, f.key), path ? `${path}.${f.key}` : f.key));
    }
  } else if (node.kind === 'list' && Array.isArray(value)) {
    value.forEach((v, i) => out.push(...mediaSlots(node.item, v, path ? `${path}.${i}` : `${i}`)));
  }
  return out;
}

/** Nó do schema no caminho ("cards.1.title" → o nó de `title`). */
export function nodeAt(root: FieldNode, path: string): FieldNode | null {
  let node: FieldNode | null = root;
  for (const k of path.split('.')) {
    if (!node) return null;
    if (node.kind === 'group') node = node.fields.find((f) => f.key === k)?.node ?? null;
    else if (node.kind === 'list' && /^\d+$/.test(k)) node = node.item;
    else return null;
  }
  return node;
}

/** Nome do campo para a etiqueta e o painel: "Cartão 2 · Título". */
export function labelAt(root: FieldNode, path: string): string {
  const parts: string[] = [];
  let node: FieldNode | null = root;
  for (const k of path.split('.')) {
    if (!node) break;
    if (node.kind === 'group') {
      node = node.fields.find((f) => f.key === k)?.node ?? null;
      if (node && node.kind !== 'list' && node.kind !== 'group') parts.push(node.label);
    } else if (node.kind === 'list' && /^\d+$/.test(k)) {
      if (node.item.kind === 'group') parts.push(`${node.singular} ${Number(k) + 1}`);
      node = node.item;
      if (node.kind !== 'group')
        parts.push(`${(node as { label: string }).label} ${Number(k) + 1}`);
    }
  }
  return parts.join(' · ');
}
