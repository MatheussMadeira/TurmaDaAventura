import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from '@/design-system/tokens/theme';
import { MotionProvider } from '@/motion/MotionProvider';

function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <MotionProvider>{children}</MotionProvider>
    </ThemeProvider>
  );
}

export const renderWithProviders = (ui: ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: Providers, ...options });
