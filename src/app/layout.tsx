import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { GlobalStyle } from '@/design-system/GlobalStyle';
import { StyledComponentsRegistry } from '@/design-system/StyledComponentsRegistry';
import { MotionProvider } from '@/motion/MotionProvider';
import { fraunces, frauncesItalic, nunito } from './fonts';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Turma da Aventura', template: '%s · Turma da Aventura' },
  description:
    'Recreação infantil com cara de expedição: restaurantes, eventos corporativos e oficinas.',
  icons: { icon: '/brand/simbolo-pegadas.svg' },
};

export const viewport: Viewport = { themeColor: '#1F632A' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="pt-BR"
      data-theme="dia"
      className={`${fraunces.variable} ${frauncesItalic.variable} ${nunito.variable}`}
    >
      <body>
        <StyledComponentsRegistry>
          <GlobalStyle />
          <MotionProvider>{children}</MotionProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
