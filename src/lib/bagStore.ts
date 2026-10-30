import { useSyncExternalStore } from 'react';
import { BAG_STORAGE_KEY, loadBag, saveBag, type BagItem } from './bag';

/**
 * Estado da sacola fora do React, para sobreviver à troca de página e abas. Lê o localStorage na
 * primeira leitura no navegador (no servidor e na hidratação o snapshot é sempre vazio) e
 * acompanha mudanças de outras abas pelo evento `storage`.
 */
const EMPTY: BagItem[] = [];
let items: BagItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

function ensureLoaded() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  items = loadBag();
}

export const getBag = () => {
  ensureLoaded();
  return items;
};

export function setBag(next: BagItem[]) {
  loaded = true;
  items = next.length ? next : EMPTY;
  saveBag(items);
  emit();
}

const onStorage = (e: StorageEvent) => {
  if (e.key !== null && e.key !== BAG_STORAGE_KEY) return;
  items = loadBag();
  loaded = true;
  emit();
};

function subscribe(cb: () => void) {
  if (listeners.size === 0) window.addEventListener('storage', onStorage);
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) window.removeEventListener('storage', onStorage);
  };
}

/** Itens da sacola (vazia no servidor e na hidratação). */
export const useBagItems = () => useSyncExternalStore(subscribe, getBag, () => EMPTY);

/** Só para testes: volta ao estado inicial sem tocar no storage. */
export function resetBagStore() {
  items = EMPTY;
  loaded = false;
  emit();
}
