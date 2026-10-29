import localFont from 'next/font/local';

export const fraunces = localFont({
  src: [
    { path: '../../public/fonts/Fraunces-Variable.woff2', style: 'normal' },
    { path: '../../public/fonts/Fraunces-Variable-Italic.woff2', style: 'italic' },
  ],
  weight: '100 900',
  variable: '--font-fraunces',
  display: 'swap',
});

export const nunito = localFont({
  src: [
    { path: '../../public/fonts/Nunito-Variable.woff2', style: 'normal' },
    { path: '../../public/fonts/Nunito-Variable-Italic.woff2', style: 'italic' },
  ],
  weight: '200 1000',
  variable: '--font-nunito',
  display: 'swap',
});
