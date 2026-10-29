/**
 * Gera, a partir de src/design-system/tokens/tokens.json (cópia de
 * _handoff/design-system/tokens.json — fonte única):
 *   - src/design-system/tokens/cssVars.ts  (custom properties por tema)
 *   - src/design-system/tokens/theme.ts    (objeto de tema apontando para var(--*))
 *   - src/motion/tokens.ts                 (dur, ease, move, reveal)
 * Roda no predev/prebuild.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type ThemedValue = string | { dia: string; noite?: string };
interface Token<V = string> {
  name: string;
  value: V;
}
interface TextStyle {
  name: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  fontStyle?: string;
  letterSpacing?: string;
}
interface Tokens {
  color: { tokens: Token<ThemedValue>[] };
  type: {
    families: Record<string, string>;
    groups: { family: string; styles: TextStyle[] }[];
  };
  spacing: { tokens: Token[] };
  radius: { tokens: Token[] };
  shadow: { tokens: Token<ThemedValue>[] };
  border: { tokens: Token[] };
  breakpoint: { tokens: Token[] };
  size: { tokens: Token[] };
  duration: { tokens: Token[] };
  easing: { tokens: Token[] };
  distance: { tokens: Token[] };
  zIndex: { tokens: Token[] };
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(
  readFileSync(resolve(root, 'src/design-system/tokens/tokens.json'), 'utf8'),
) as Tokens;

const HEADER = '// GERADO por scripts/build-tokens.ts — não edite à mão.\n';

const resolveValue = (v: ThemedValue, theme: 'dia' | 'noite'): string => {
  const raw = typeof v === 'string' ? v : (v[theme] ?? v.dia);
  const alias = /^\{(.+)\}$/.exec(raw);
  return alias ? `var(--${alias[1]})` : raw;
};

const themed = (list: Token<ThemedValue>[], theme: 'dia' | 'noite') =>
  list.map((t) => `  --${t.name}: ${resolveValue(t.value, theme)};`);

const fontVar = (family: string) =>
  family.replace(/^"?(\w+)"?/, (_, name: string) => `var(--font-${name.toLowerCase()})`);

const scalars = [
  tokens.spacing,
  tokens.radius,
  tokens.border,
  tokens.size,
  tokens.duration,
  tokens.easing,
  tokens.distance,
  tokens.zIndex,
].flatMap((g) => g.tokens.map((t) => `  --${t.name}: ${t.value};`));

const families = Object.entries(tokens.type.families).map(
  ([key, value]) => `  --font-${key}: ${fontVar(value)};`,
);

const dia = [...themed(tokens.color.tokens, 'dia'), ...themed(tokens.shadow.tokens, 'dia')];
const noite = [...themed(tokens.color.tokens, 'noite'), ...themed(tokens.shadow.tokens, 'noite')];

const cssVars = `${HEADER}export const cssVars = \`
:root, [data-theme="dia"] {
${dia.join('\n')}
}
[data-theme="noite"] {
${noite.join('\n')}
}
:root {
${[...scalars, ...families].join('\n')}
}
\`;
`;

const refs = (list: Token<unknown>[]) =>
  Object.fromEntries(list.map((t) => [t.name, `var(--${t.name})`]));

const textStyles = Object.fromEntries(
  tokens.type.groups.flatMap((g) =>
    g.styles.map((s) => [
      s.name,
      {
        family: g.family,
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        fontWeight: s.fontWeight,
        fontStyle: s.fontStyle ?? 'normal',
        letterSpacing: s.letterSpacing ?? 'normal',
      },
    ]),
  ),
);

const theme = {
  color: refs(tokens.color.tokens),
  space: refs(tokens.spacing.tokens),
  radius: refs(tokens.radius.tokens),
  shadow: refs(tokens.shadow.tokens),
  border: refs(tokens.border.tokens),
  size: refs(tokens.size.tokens),
  z: refs(tokens.zIndex.tokens),
  duration: refs(tokens.duration.tokens),
  easing: refs(tokens.easing.tokens),
  move: refs(tokens.distance.tokens),
  bp: Object.fromEntries(tokens.breakpoint.tokens.map((t) => [t.name, t.value])),
  font: { display: 'var(--font-display)', body: 'var(--font-body)' },
  text: textStyles,
};

const themeTs = `${HEADER}export const theme = ${JSON.stringify(theme, null, 2)} as const;

export type Theme = typeof theme;
`;

// --- motion/tokens.ts ---
const strip = (name: string, prefix: string) => name.replace(new RegExp(`^${prefix}-`), '');
const seconds = (v: string) => (v.endsWith('ms') ? parseFloat(v) / 1000 : parseFloat(v));
const px = (v: string) => parseFloat(v);
const bezier = (v: string) =>
  /cubic-bezier\(([^)]+)\)/
    .exec(v)![1]!
    .split(',')
    .map((n) => parseFloat(n.trim()));

const dur = Object.fromEntries(
  tokens.duration.tokens.map((t) => [strip(t.name, 'dur'), seconds(t.value)]),
);
const ease = Object.fromEntries(
  tokens.easing.tokens.map((t) => [strip(t.name, 'ease'), bezier(t.value)]),
);
const move = Object.fromEntries(
  tokens.distance.tokens.map((t) => [strip(t.name, 'move'), px(t.value)]),
);

const motionTs = `${HEADER}export const dur = ${JSON.stringify(dur, null, 2)} as const;

export const ease = ${JSON.stringify(ease, null, 2).replace(
  /\[\s+([\d.\s,-]+?)\s+\]/g,
  (_, nums: string) => `[${nums.replace(/\s+/g, ' ')}]`,
)} as const;

export const move = ${JSON.stringify(move, null, 2)} as const;

export const reveal = { amount: 0.2, once: true, maxStagger: 6 } as const;
`;

const write = (rel: string, content: string) => {
  const file = resolve(root, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
};

write('src/design-system/tokens/cssVars.ts', cssVars);
write('src/design-system/tokens/theme.ts', themeTs);
write('src/motion/tokens.ts', motionTs);

console.log('tokens: cssVars.ts, theme.ts e motion/tokens.ts gerados');
