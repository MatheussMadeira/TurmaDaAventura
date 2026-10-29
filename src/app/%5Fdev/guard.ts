import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

/**
 * Páginas de desenvolvimento (/_dev/*): 404 em produção na Vercel e fora dos buscadores.
 * (Não usamos um layout.tsx aqui: o typegen de rotas do Next 16 quebra com layouts em pastas "%5F…".)
 */
export const devMetadata = (title: string): Metadata => ({ title, robots: { index: false } });

export function devOnly() {
  if (process.env.VERCEL_ENV === 'production') notFound();
}
