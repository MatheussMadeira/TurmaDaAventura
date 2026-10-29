'use client';

import { createGlobalStyle } from 'styled-components';
import { cssVars } from './tokens/cssVars';
import { theme } from './tokens/theme';

const textClass = (name: keyof typeof theme.text) => {
  const s = theme.text[name];
  const style = s.fontStyle === 'italic' ? 'italic ' : '';
  const letter = s.letterSpacing !== 'normal' ? `letter-spacing: ${s.letterSpacing};` : '';
  const upper = name === 'overline' ? 'text-transform: uppercase;' : '';
  // Fraunces: eixos variáveis como no bundle.css (opsz vem do token; SOFT/WONK são fixos).
  const variation =
    s.family === 'display'
      ? `font-variation-settings: 'opsz' ${s.opticalSize}, 'SOFT' 100, 'WONK' 0;`
      : '';
  return `.${name} { font: ${style}${s.fontWeight} ${s.fontSize}/${s.lineHeight} var(--font-${s.family}); ${letter} ${upper} ${variation} }`;
};

const classes = (Object.keys(theme.text) as (keyof typeof theme.text)[]).map(textClass).join('\n');

const mobileOverrides = (Object.keys(theme.text) as (keyof typeof theme.text)[])
  .filter((name) => theme.text[name].fontSizeMobile !== '')
  .map((name) => {
    const s = theme.text[name];
    return `.${name} { font-size: ${s.fontSizeMobile}; line-height: ${s.lineHeightMobile}; }`;
  })
  .join('\n');

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

  /* Mobile: valores de fontSizeMobile/lineHeightMobile do tokens.json */
  @media (max-width: ${parseInt(theme.bp['bp-md'], 10) - 1}px) {
    ${mobileOverrides}
  }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
  }
`;
