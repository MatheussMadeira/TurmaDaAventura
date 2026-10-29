import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cssVars } from './tokens/cssVars';

/* Regra 1 do CLAUDE.md: nada de cor, fonte, raio, sombra ou duração fora de tokens.json.
   Este teste lê todo styles/componente e confere que cada var(--x) existe e que não há cor solta. */

const root = join(process.cwd(), 'src');
const files: string[] = [];
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(styles\.ts|tsx)$/.test(name) && !/\.test\./.test(name) && !p.includes('_dev'))
      files.push(p);
  }
};
walk(join(root, 'components'));
walk(join(root, 'motion'));

const defined = new Set([...cssVars.matchAll(/--([a-z0-9-]+):/g)].map((m) => m[1]));
/* variáveis locais (definidas e usadas dentro do próprio componente) e as injetadas pelo next/font */
const isLocal = (n: string) => n.startsWith('_') || n.startsWith('tda-') || n === 'i' || n === 'd';

describe('estilos usam só tokens', () => {
  it('encontrou arquivos de estilo', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it.each(files.map((f) => [f.replace(root, 'src'), f]))(
    '%s: var(--x) existe em tokens.json',
    (_n, file) => {
      const text = readFileSync(file as string, 'utf8');
      const unknown = [...text.matchAll(/var\(--([a-zA-Z0-9_-]+)/g)]
        .map((m) => m[1] as string)
        .filter((n) => !defined.has(n) && !isLocal(n));
      expect(unknown).toEqual([]);
    },
  );

  it.each(files.map((f) => [f.replace(root, 'src'), f]))('%s: sem cor literal', (_n, file) => {
    const text = readFileSync(file as string, 'utf8');
    const literal = text.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/g) ?? [];
    expect(literal).toEqual([]);
  });
});
