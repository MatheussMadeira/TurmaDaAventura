import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import tokens from '@/design-system/tokens/tokens.json';
import { TokensView } from './TokensView';

export const metadata: Metadata = { title: 'Tokens', robots: { index: false, follow: false } };

export default function TokensPage() {
  if (process.env.VERCEL_ENV === 'production') notFound();
  return <TokensView tokens={tokens} />;
}
