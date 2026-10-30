'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { trackWhatsappClick } from '@/lib/analytics';
import {
  addItem,
  buildBagMessage,
  removeItem,
  setQty as setItemQty,
  totalUnits,
  type BagForm,
  type BagItem,
  type BagProduct,
} from '@/lib/bag';
import { setBag, useBagItems } from '@/lib/bagStore';
import { prepareWhatsappLaunch } from '@/lib/openWhatsapp';
import { whatsappUrl } from '@/lib/whatsapp';
import { Icon } from '../../atoms/Icon';
import { useSiteSettings } from '../../SiteSettings';
import { BagContext, type BagApi } from './BagContext';
import { ToastBubble, ToastRegion } from './Bag.styles';

/* A gaveta só é baixada quando alguém abre a sacola. */
const BagDrawer = dynamic(() => import('./BagDrawer').then((m) => m.BagDrawer), { ssr: false });

const UNDO_MS = 8000;

/**
 * Sacola do site: guarda a lista (localStorage, 7 dias), abre/fecha a gaveta e envia o pedido
 * pelo WhatsApp. Sem preço, total ou pagamento. Envolve todas as páginas do site.
 */
export function BagProvider({ children }: { children: ReactNode }) {
  const items = useBagItems();
  const settings = useSiteSettings();
  const pathname = usePathname();
  const [isOpen, setOpen] = useState(false);
  const [form, setFormState] = useState<BagForm>({});
  const [sent, setSent] = useState<BagItem[] | null>(null);

  useEffect(() => {
    if (!sent) return;
    const t = window.setTimeout(() => setSent(null), UNDO_MS);
    return () => window.clearTimeout(t);
  }, [sent]);

  const send = useCallback(() => {
    if (!items.length) return;
    const url = whatsappUrl(buildBagMessage(items, form, settings.messages.sacola), settings.phone);
    trackWhatsappClick({
      page: pathname ?? '/',
      placement: 'bag',
      items: items.length,
      units: totalUnits(items),
    });
    /* Chamado direto do clique: a aba é aberta dentro do gesto (desktop) ou a mesma aba é usada
       (mobile). Ver lib/openWhatsapp.ts. */
    prepareWhatsappLaunch().open(url);
    setSent(items);
    setBag([]);
    setFormState({});
    setOpen(false);
  }, [items, form, settings.messages.sacola, settings.phone, pathname]);

  const api = useMemo<BagApi>(
    () => ({
      items,
      count: items.length,
      units: totalUnits(items),
      qtyOf: (slug) => items.find((i) => i.slug === slug)?.qty ?? 0,
      add: (p: BagProduct) => setBag(addItem(items, p)),
      setQty: (slug, qty) => setBag(setItemQty(items, slug, qty)),
      remove: (slug) => setBag(removeItem(items, slug)),
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      form,
      setForm: (patch) => setFormState((f) => ({ ...f, ...patch })),
      send,
    }),
    [items, isOpen, form, send],
  );

  return (
    <BagContext.Provider value={api}>
      {children}
      {isOpen ? <BagDrawer /> : null}
      <ToastRegion role="status" aria-live="polite">
        {sent ? (
          <ToastBubble>
            <Icon name="check" size={18} />
            <span>Pedido enviado.</span>
            <button
              type="button"
              onClick={() => {
                setBag(sent);
                setSent(null);
              }}
            >
              Desfazer
            </button>
          </ToastBubble>
        ) : null}
      </ToastRegion>
    </BagContext.Provider>
  );
}
