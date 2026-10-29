/**
 * Desfazer/refazer por sessão: pilha de fotografias do estado. Digitar seguido no MESMO campo vira
 * um só passo (coalesce), para o Desfazer não voltar uma letra por vez.
 */
export interface History<T> {
  past: T[];
  present: T;
  future: T[];
  lastKey: string | null;
  lastAt: number;
}

export const COALESCE_MS = 1200;
const LIMIT = 100;

export const initHistory = <T>(present: T): History<T> => ({
  past: [],
  present,
  future: [],
  lastKey: null,
  lastAt: 0,
});

export function push<T>(
  h: History<T>,
  next: T,
  key: string | null = null,
  now = Date.now(),
): History<T> {
  if (Object.is(next, h.present)) return h;
  const merge = key !== null && key === h.lastKey && now - h.lastAt < COALESCE_MS;
  return {
    past: merge ? h.past : [...h.past, h.present].slice(-LIMIT),
    present: next,
    future: [],
    lastKey: key,
    lastAt: now,
  };
}

export function undo<T>(h: History<T>): History<T> {
  if (!h.past.length) return h;
  const previous = h.past[h.past.length - 1]!;
  return {
    past: h.past.slice(0, -1),
    present: previous,
    future: [h.present, ...h.future],
    lastKey: null,
    lastAt: 0,
  };
}

export function redo<T>(h: History<T>): History<T> {
  if (!h.future.length) return h;
  const [next, ...rest] = h.future;
  return {
    past: [...h.past, h.present],
    present: next!,
    future: rest,
    lastKey: null,
    lastAt: 0,
  };
}

export const canUndo = (h: History<unknown>) => h.past.length > 0;
export const canRedo = (h: History<unknown>) => h.future.length > 0;
