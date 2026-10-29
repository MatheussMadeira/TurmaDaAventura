import localFont from 'next/font/local';

/* Só o que pinta a primeira dobra é pré-carregado (Fraunces + Nunito normais, ~160 KB).
   A Fraunces itálica serve apenas ao .tagline e carrega sob demanda (preload: false);
   a Nunito itálica não é usada em lugar nenhum e por isso não é registrada. */
export const fraunces = localFont({
  src: [{ path: '../../public/fonts/Fraunces-Variable.woff2', style: 'normal' }],
  weight: '100 900',
  variable: '--font-fraunces',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});

/* Itálica enxuta (scripts/build-fonts.py): wght 400 / opsz 36 / SOFT 100 / WONK 0, Latin + PT-BR, ~20 KB.
   O arquivo original Fraunces-Variable-Italic.woff2 continua em public/fonts, sem alteração. */
export const frauncesItalic = localFont({
  src: [
    { path: '../../public/fonts/Fraunces-Italic-subset.woff2', style: 'italic', weight: '400' },
  ],
  variable: '--font-fraunces-italic',
  preload: false,
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
  declarations: [
    {
      prop: 'unicode-range',
      value: 'U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+2013-2014, U+2018-201E, U+2026',
    },
  ],
});

export const nunito = localFont({
  src: [{ path: '../../public/fonts/Nunito-Variable.woff2', style: 'normal' }],
  weight: '200 1000',
  variable: '--font-nunito',
  display: 'swap',
  adjustFontFallback: 'Arial',
});
