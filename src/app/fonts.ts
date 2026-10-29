import localFont from 'next/font/local';

/* Só o que pinta a primeira dobra é pré-carregado (Fraunces + Nunito normais, ~160 KB).
   A Fraunces itálica serve apenas ao .tagline e carrega sob demanda (preload: false);
   a Nunito itálica não é usada em lugar nenhum e por isso não é registrada. */
export const fraunces = localFont({
  src: [{ path: '../../public/fonts/Fraunces-Variable.woff2', style: 'normal' }],
  weight: '100 900',
  variable: '--font-fraunces',
  display: 'swap',
});

export const frauncesItalic = localFont({
  src: [{ path: '../../public/fonts/Fraunces-Variable-Italic.woff2', style: 'italic' }],
  weight: '100 900',
  variable: '--font-fraunces-italic',
  display: 'swap',
  preload: false,
});

export const nunito = localFont({
  src: [{ path: '../../public/fonts/Nunito-Variable.woff2', style: 'normal' }],
  weight: '200 1000',
  variable: '--font-nunito',
  display: 'swap',
});
