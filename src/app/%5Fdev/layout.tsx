import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { robots: { index: false } };

export default function DevLayout({ children }: { children: ReactNode }) {
  if (process.env.VERCEL_ENV === 'production') notFound();
  return children;
}
