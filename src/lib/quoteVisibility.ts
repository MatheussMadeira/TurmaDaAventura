import { useSyncExternalStore } from 'react';

/** Quais QuoteForms estão (≥ 25%) na tela. O WhatsAppFloat some enquanto houver algum. */
const visible = new Set<string>();
const listeners = new Set<() => void>();

export function setQuoteVisible(id: string, isVisible: boolean) {
  const had = visible.has(id);
  if (isVisible === had) return;
  if (isVisible) visible.add(id);
  else visible.delete(id);
  listeners.forEach((l) => l());
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export const useQuoteCovered = () =>
  useSyncExternalStore(
    subscribe,
    () => visible.size > 0,
    () => false,
  );
