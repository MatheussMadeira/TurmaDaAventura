'use client';

import { countLabel } from '@/lib/bag';
import { useQuoteCovered } from '@/lib/quoteVisibility';
import { Icon } from '../../atoms/Icon';
import { WhatsAppFloat } from '../WhatsAppFloat';
import { useBag } from './BagContext';
import { Fab, FabCount } from './Bag.styles';

/** Botão flutuante "Ver sacola" com o contador. O número carimba (ease-stamp) a cada produto novo. */
export function BagButton() {
  const { count, open } = useBag();
  const covered = useQuoteCovered();
  return (
    <Fab
      type="button"
      data-shown={!covered}
      aria-haspopup="dialog"
      aria-label={`Ver sacola, ${countLabel(count)}`}
      onClick={open}
    >
      <Icon name="backpack" size={22} />
      Ver sacola
      <FabCount key={count} aria-hidden>
        {count}
      </FabCount>
    </Fab>
  );
}

/**
 * O que flutua no canto das páginas do site: "Ver sacola" quando a sacola tem itens, senão o
 * WhatsApp. Os dois somem enquanto um QuoteForm está na tela.
 */
export function SiteFloat() {
  const { count } = useBag();
  return count > 0 ? <BagButton /> : <WhatsAppFloat label="Fale com a gente" />;
}
