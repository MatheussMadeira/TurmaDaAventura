# Implementação (Next.js + styled-components)

Como levar este sistema para o código de produção. Os componentes deste design system são a referência visual e de API; o site é escrito em **Next.js (App Router) + styled-components**, organizado em **Atomic Design**.

## Estrutura de pastas

```text
src/
  app/
    layout.tsx              # fontes, GlobalStyle, Header, Footer, WhatsAppFloat
    page.tsx                # Início
    oficina/page.tsx
    restaurantes/page.tsx
    eventos-corporativos/page.tsx
    quem-somos/page.tsx
  design-system/
    tokens/
      tokens.json           # cópia do tokens.json deste sistema (fonte única)
      cssVars.ts            # gerado: CSS custom properties por tema
      theme.ts              # gerado: objeto de tema que aponta para var(--*)
    GlobalStyle.ts
    StyledComponentsRegistry.tsx
    media.ts                # helpers de breakpoint
  components/
    atoms/        Icon/ Button/ Tag/ Logo/ Media/ CamoPattern/ TextField/ Select/
    molecules/    SectionHeader/ WhatsAppButton/ ServiceCard/ RestaurantCard/ TeamCard/ ValuePillar/
    organisms/    Header/ Hero/ Trail/ CTABanner/ QuoteForm/ Footer/ WhatsAppFloat/
    templates/    PageTemplate/
  motion/
    tokens.ts               # durações, curvas e distâncias (gerado do tokens.json)
    variants.ts             # variants do Framer Motion (fadeUp, stagger, stamp…)
    Reveal.tsx  PageTransition.tsx  useReducedMotion re-export
  content/
    restaurantes.json  oficinas.json  equipe.json
  lib/
    whatsapp.ts  analytics.ts
public/
  brand/          # SVGs do grupo Logos
  fonts/          # Fraunces-Variable*.woff2, Nunito-Variable*.woff2
```

Cada componente: `Componente.tsx`, `Componente.styles.ts`, `index.ts` (e opcionalmente `Componente.stories.tsx`). Átomos não importam moléculas; moléculas não importam organismos.

## Tokens → tema

A regra: **cores mudam por tema via CSS custom properties**; o objeto `theme` do styled-components só guarda referências `var(--x)`. Assim trocar Dia/Noite é só mudar `data-theme` no `<html>`, sem re-render.

```ts
// scripts/build-tokens.ts  (rode no prebuild)
import tokens from '../src/design-system/tokens/tokens.json';
import { writeFileSync } from 'node:fs';

const val = (v: any, th: string) => {
  const raw = typeof v === 'string' ? v : v[th] ?? v.dia;
  const alias = /^\{(.+)\}$/.exec(raw);
  return alias ? `var(--${alias[1]})` : raw;
};
const block = (th: string) => [
  ...tokens.color.tokens.map((t) => `--${t.name}: ${val(t.value, th)};`),
  ...tokens.shadow.tokens.map((t) => `--${t.name}: ${val(t.value, th)};`),
].join('\n');
const scalar = ['spacing', 'radius', 'border', 'size', 'duration', 'easing', 'distance', 'zIndex']
  .flatMap((k) => (tokens as any)[k].tokens.map((t: any) => `--${t.name}: ${t.value};`))
  .concat(Object.entries(tokens.type.families).map(([k, v]) => `--font-${k}: ${v};`))
  .join('\n');

writeFileSync('src/design-system/tokens/cssVars.ts', `export const cssVars = \`
:root, [data-theme="dia"] { ${block('dia')} }
[data-theme="noite"] { ${block('noite')} }
:root { ${scalar} }\`;`);

const names = (k: string) => Object.fromEntries((tokens as any)[k].tokens.map((t: any) => [t.name, `var(--${t.name})`]));
writeFileSync('src/design-system/tokens/theme.ts', `export const theme = ${JSON.stringify({
  color: Object.fromEntries(tokens.color.tokens.map((t) => [t.name, `var(--${t.name})`])),
  space: names('spacing'), radius: names('radius'), shadow: names('shadow'),
  border: names('border'), size: names('size'), z: names('zIndex'),
  duration: names('duration'), easing: names('easing'), move: names('distance'),
  bp: Object.fromEntries(tokens.breakpoint.tokens.map((t) => [t.name, t.value])),
  font: { display: 'var(--font-display)', body: 'var(--font-body)' },
}, null, 2)} as const;\nexport type Theme = typeof theme;`);
```

```ts
// src/design-system/styled.d.ts
import 'styled-components';
import type { Theme } from './tokens/theme';
declare module 'styled-components' { export interface DefaultTheme extends Theme {} }
```

## Fontes

```ts
// src/app/fonts.ts
import localFont from 'next/font/local';
export const fraunces = localFont({
  src: [{ path: '../../public/fonts/Fraunces-Variable.woff2', style: 'normal' },
        { path: '../../public/fonts/Fraunces-Variable-Italic.woff2', style: 'italic' }],
  weight: '100 900', variable: '--font-fraunces', display: 'swap',
});
export const nunito = localFont({
  src: [{ path: '../../public/fonts/Nunito-Variable.woff2', style: 'normal' },
        { path: '../../public/fonts/Nunito-Variable-Italic.woff2', style: 'italic' }],
  weight: '200 1000', variable: '--font-nunito', display: 'swap',
});
```

No `GlobalStyle`, aponte `--font-display: var(--font-fraunces), Georgia, serif;` e `--font-body: var(--font-nunito), system-ui, sans-serif;`. As fontes estão na pasta **fonts/** deste sistema (OFL).

## SSR do styled-components (App Router)

Habilite `compiler: { styledComponents: true }` no `next.config.js` e envolva o layout com o registry (`useServerInsertedHTML` + `ServerStyleSheet`), conforme a documentação do Next.js. Componentes com estado (`Header`, `QuoteForm`) levam `'use client'`.

## Exemplo — átomo Button

```tsx
// components/atoms/Button/Button.styles.ts
import styled, { css } from 'styled-components';

const variants = {
  primary: css`--_bg: ${({ theme }) => theme.color.brand}; --_fg: ${({ theme }) => theme.color['on-brand']};
    --_bg-h: ${({ theme }) => theme.color['brand-hover']}; --_sh: ${({ theme }) => theme.shadow['shadow-stamp-brand']};`,
  earth: css`--_bg: ${({ theme }) => theme.color.earth}; --_fg: ${({ theme }) => theme.color['on-earth']};
    --_bg-h: ${({ theme }) => theme.color['earth-hover']}; --_sh: ${({ theme }) => theme.shadow['shadow-stamp-earth']};`,
  outline: css`--_bg: transparent; --_fg: ${({ theme }) => theme.color.brand}; --_bd: ${({ theme }) => theme.color.brand};
    --_bg-h: ${({ theme }) => theme.color['brand-soft']}; --_sh: none;`,
  // ghost, inverse, ghost-inverse: ver components/bundle.css (.tda-btn--*)
};

export const StyledButton = styled.button<{ $variant: keyof typeof variants; $size: 'sm' | 'md' | 'lg' }>`
  ${({ $variant }) => variants[$variant]}
  display: inline-flex; align-items: center; justify-content: center; gap: ${({ theme }) => theme.space['space-2']};
  min-height: ${({ theme }) => theme.size['tap-min']}; padding: 0 ${({ theme }) => theme.space['space-5']};
  font: 800 16px/20px ${({ theme }) => theme.font.body};
  color: var(--_fg); background: var(--_bg); border: 2px solid var(--_bd, transparent);
  border-radius: ${({ theme }) => theme.radius['radius-md']}; box-shadow: var(--_sh);
  transition: transform .16s ease-out, box-shadow .16s ease-out, background-color .16s ease-out;
  &:hover { background: var(--_bg-h); transform: translateY(-1px); }
  &:active { transform: translateY(4px); box-shadow: none; }
  &:focus-visible { outline: 3px solid ${({ theme }) => theme.color.focus}; outline-offset: 3px; }
  @media (prefers-reduced-motion: reduce) { transition: none; &:hover { transform: none; } }
`;
```

Use **transient props** (`$variant`, `$size`) para não vazar atributos ao DOM; `as={Link}` quando houver `href` interno.

## Animação (Framer Motion + CSS)

Regra de divisão: **CSS** (styled-components) para hover, press, foco, loops leves e o header; **Framer Motion** para entradas ao rolar, stagger, layout animado (filtro da Oficina) e transição entre páginas. Os valores vêm dos tokens `duration`, `easing` e `distance`; nada solto no código.

```ts
// src/motion/tokens.ts  (gerado no prebuild a partir do tokens.json)
export const dur = { instant: 0.1, fast: 0.16, medium: 0.28, slow: 0.5, trail: 1.2, stagger: 0.08 };
export const ease = {
  enter: [0.22, 1, 0.36, 1], exit: [0.4, 0, 1, 1],
  standard: [0.4, 0, 0.2, 1], stamp: [0.34, 1.56, 0.64, 1],
} as const;
export const move = { xs: 4, sm: 12, md: 24 };
```

```ts
// src/motion/variants.ts
import type { Variants } from 'framer-motion';
import { dur, ease, move } from './tokens';

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: move.md },
  show: { opacity: 1, y: 0, transition: { duration: dur.slow, ease: ease.enter } },
};
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: dur.stagger } },
};
export const stamp: Variants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -20 },
  show: { opacity: 1, scale: 1, rotate: 0, transition: { duration: dur.slow, ease: ease.stamp } },
};
```

```tsx
// src/motion/Reveal.tsx
'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, stagger as staggerV } from './variants';

export function Reveal({ children, stagger, as = 'div', ...rest }: { children: React.ReactNode; stagger?: boolean; as?: 'div' | 'section' | 'ul' }) {
  const reduce = useReducedMotion();
  const M = motion[as];
  return (
    <M initial={reduce ? false : 'hidden'} whileInView="show" viewport={{ once: true, amount: 0.2 }}
       variants={stagger ? staggerV : fadeUp} {...rest}>
      {children}
    </M>
  );
}
// Filhos de um <Reveal stagger> usam <motion.div variants={fadeUp}>.
```

```tsx
// Botão carimbo em styled-components (sem JS)
transition: transform ${({ theme }) => `${theme.duration['dur-fast']} ${theme.easing['ease-stamp']}`};
&:active { transform: translateY(${({ theme }) => theme.move['move-xs']}); box-shadow: none; transition-duration: 60ms; }
@media (prefers-reduced-motion: reduce) { transition-duration: 1ms; }
```

- **Trilha:** a linha é um `motion.path` (ou um `::before` com `clip-path`) com `pathLength` de 0 → 1 em `dur.trail`; cada marcador usa `stamp` com `delay = i * dur.trail / (n - 1)`.
- **Transição de página:** no App Router, use `template.tsx` com `motion.main` (`initial {opacity: 0, y: move.sm}`, `animate {opacity: 1, y: 0}`, `dur.medium`, `ease.enter`).
- **Filtro da Oficina:** `LayoutGroup` + `layout` nos cards, `AnimatePresence mode="popLayout"` para entradas e saídas; o chip ativo usa `layoutId="filtro-ativo"`.
- **Header:** um hook `useScrollDirection` define `data-scrolled` e `data-hidden`; as transições ficam no CSS (`dur-medium`, `ease-standard`).
- **Performance:** anime só `transform`/`opacity`; use `LazyMotion` + `domAnimation` para reduzir o bundle; pare loops fora da tela (`useInView`).
- **SSR sem "pisca":** com `initial="hidden"` o HTML do servidor já vem oculto e aparece na hidratação. Para conteúdo acima da dobra (hero), anime com CSS (`@keyframes` com `animation-fill-mode: both`), não com `whileInView`.

## WhatsApp

```ts
// lib/whatsapp.ts
export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP!; // ex.: 5511999999999
export const whatsappUrl = (message?: string, phone = WHATSAPP) =>
  `https://wa.me/${phone.replace(/\D/g, '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
```

- Toda chamada passa por `whatsappUrl` com a mensagem da página (lista em **Páginas do site**).
- Registre `whatsapp_click` com `{ page, placement: 'header' | 'hero' | 'cta' | 'float' | 'form' }` no GA4/Meta Pixel.
- Links externos: `target="_blank" rel="noopener noreferrer"`.

## Conteúdo

Restaurantes, oficinas e equipe vêm de JSON em `content/` (ou de um CMS headless, ex.: Sanity/Contentful) com tipos iguais às props de `RestaurantCard`, `ServiceCard` e `TeamCard` (`components/index.d.ts`). Nenhum campo de preço no modelo de dados.

## Checklist de qualidade

- Lighthouse: Acessibilidade ≥ 95, Performance ≥ 90 (fotos em `next/image`, AVIF/WebP).
- SEO local: `LocalBusiness` em JSON-LD, `metadata` por página, Open Graph com o logo completo.
- LGPD: política de privacidade no rodapé; o `QuoteForm` não armazena dados.
