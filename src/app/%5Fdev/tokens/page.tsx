import tokens from '@/design-system/tokens/tokens.json';
import { devMetadata, devOnly } from '../guard';
import { TokensView } from './TokensView';

export const metadata = devMetadata('Tokens');

export default function TokensPage() {
  devOnly();
  return <TokensView tokens={tokens} />;
}
