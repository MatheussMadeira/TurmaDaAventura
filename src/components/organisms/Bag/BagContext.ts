'use client';

import { createContext, useContext } from 'react';
import type { BagForm, BagItem, BagProduct } from '@/lib/bag';

export interface BagApi {
  items: BagItem[];
  /** produtos distintos na sacola (o número do botão) */
  count: number;
  /** soma das quantidades (só para analytics) */
  units: number;
  qtyOf: (slug: string) => number;
  add: (product: BagProduct) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  form: BagForm;
  setForm: (patch: BagForm) => void;
  /** abre o WhatsApp com o pedido, esvazia a sacola e oferece "Desfazer" */
  send: () => void;
}

const noop = () => undefined;

/** Sem provider (editor visual, /_dev): sacola vazia e botões sem efeito. */
const IDLE: BagApi = {
  items: [],
  count: 0,
  units: 0,
  qtyOf: () => 0,
  add: noop,
  setQty: noop,
  remove: noop,
  isOpen: false,
  open: noop,
  close: noop,
  form: {},
  setForm: noop,
  send: noop,
};

export const BagContext = createContext<BagApi>(IDLE);
export const useBag = () => useContext(BagContext);
