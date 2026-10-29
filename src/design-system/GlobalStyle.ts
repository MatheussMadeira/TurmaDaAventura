'use client';

import { createGlobalStyle } from 'styled-components';
import { cssVars } from './tokens/cssVars';
import { theme } from './tokens/theme';

const textClass = (name: keyof typeof theme.text) => {
  const s = theme.text[name];
  const style = s.fontStyle === 'italic' ? 'italic ' : '';
  const letter = s.letterSpacing !== 'normal' ? `letter-spacing: ${s.letterSpacing};` : '';
  const upper = name === 'overline' ? 'text-transform: uppercase;' : '';
  return `.${name} { font: ${style}${s.fontWeight} ${s.fontSize}/${s.lineHeight} var(--font-${s.family}); ${letter} ${upper} }`;
};

const classes = (Object.keys(theme.text) as (keyof typeof theme.text)[]).map(textClass).join('\n');

export const GlobalStyle = createGlobalStyle`
  ${cssVars}

  *, *::before, *::after { box-sizing: border-box; }

  html {
    -webkit-text-size-adjust: 100%;
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    background: var(--surface);
    color: var(--ink);
    font: 400 17px/27px var(--font-body);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  img, svg, video { display: block; max-width: 100%; }

  a { color: var(--link); }

  :focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }

  ${classes}

  /* Mobile (< 768px): display 40/44, h1 34/40, h2 28/34 — ver tokens.json (type.groups[].usage) */
  @media (max-width: ${parseInt(theme.bp['bp-md'], 10) - 1}px) {
    .display { font-size: 40px; line-height: 44px; }
    .h1 { font-size: 34px; line-height: 40px; }
    .h2 { font-size: 28px; line-height: 34px; }
  }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
  }
`;
