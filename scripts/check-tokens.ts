/**
 * Compara src/design-system/tokens/tokens.json (fonte única do projeto) com
 * _handoff/design-system/tokens.json. Só avisa; nunca copia nem falha o build.
 * As chaves que existem só na nossa cópia (ex.: fontSizeMobile) são ignoradas.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ours = resolve(root, 'src/design-system/tokens/tokens.json');
const theirs = resolve(root, '_handoff/design-system/tokens.json');

if (!existsSync(theirs)) {
  console.log('tokens:check — _handoff/design-system/tokens.json não encontrado; nada a comparar.');
  process.exit(0);
}

const EXTRA_KEYS = new Set(['fontSizeMobile', 'lineHeightMobile']);

const strip = (v: unknown): unknown => {
  if (Array.isArray(v)) return v.map(strip);
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v)
        .filter(([k]) => !EXTRA_KEYS.has(k))
        .map(([k, val]) => [k, strip(val)]),
    );
  }
  return v;
};

const diffs: string[] = [];
const walk = (a: unknown, b: unknown, path: string) => {
  if (JSON.stringify(a) === JSON.stringify(b)) return;
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      walk((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${path}.${k}`);
    }
    return;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    const named = (x: unknown[]) => x.every((i) => i && typeof i === 'object' && 'name' in i);
    if (named(a) && named(b)) {
      const idx = (x: unknown[]) =>
        new Map((x as { name: string }[]).map((i) => [i.name, i] as const));
      const ma = idx(a);
      const mb = idx(b);
      for (const n of new Set([...ma.keys(), ...mb.keys()]))
        walk(ma.get(n), mb.get(n), `${path}[${n}]`);
      return;
    }
  }
  diffs.push(path.replace(/^\./, ''));
};

walk(
  strip(JSON.parse(readFileSync(ours, 'utf8'))),
  strip(JSON.parse(readFileSync(theirs, 'utf8'))),
  '',
);

if (diffs.length === 0) {
  console.log('tokens:check — nossa cópia está igual ao _handoff.');
} else {
  console.warn(`tokens:check — AVISO: ${diffs.length} diferença(s) em relação ao _handoff:`);
  for (const d of diffs.slice(0, 30)) console.warn(`  - ${d}`);
  if (diffs.length > 30) console.warn(`  … e mais ${diffs.length - 30}`);
  console.warn('Nada foi copiado. Revise e atualize src/design-system/tokens/tokens.json à mão.');
}
