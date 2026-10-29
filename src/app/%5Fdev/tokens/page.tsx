import type { Metadata } from 'next';
import tokens from '@/design-system/tokens/tokens.json';
import { TokensView } from './TokensView';

export const metadata: Metadata = { title: 'Tokens', robots: { index: false } };

export default function TokensPage() {
  return <TokensView tokens={tokens} />;
}
