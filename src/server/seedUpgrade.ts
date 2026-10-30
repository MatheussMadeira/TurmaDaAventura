/**
 * Atualização de textos do seed SEM apagar edições do cliente.
 * Regra: um campo só muda se o valor atual ainda é EXATAMENTE o texto original do seed. Se já foi
 * editado (nem o original, nem o novo), fica como está e entra na lista de "não atualizados".
 * Módulo puro (sem banco): o seed só faz a leitura/gravação.
 */
export interface Change {
  /** caminho dentro do conteúdo: "secondary.label", "cards", "title" */
  path: string;
  from: unknown;
  to: unknown;
}

export type Outcome = 'updated' | 'already' | 'edited' | 'missing';

export interface Result<T> {
  value: T;
  /** um por mudança, na ordem recebida */
  outcomes: { path: string; outcome: Outcome }[];
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function getAt(root: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => {
    if (acc == null || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[k];
  }, root);
}

function setAt<T>(root: T, path: string, value: unknown): T {
  const keys = path.split('.');
  const walk = (node: unknown, i: number): unknown => {
    if (i === keys.length) return value;
    const obj = (node ?? {}) as Record<string, unknown>;
    return { ...obj, [keys[i]!]: walk(obj[keys[i]!], i + 1) };
  };
  return walk(root, 0) as T;
}

export function applyChanges<T>(root: T, changes: Change[]): Result<T> {
  let value = root;
  const outcomes: Result<T>['outcomes'] = [];
  for (const c of changes) {
    const current = getAt(value, c.path);
    if (current === undefined) outcomes.push({ path: c.path, outcome: 'missing' });
    else if (same(current, c.to)) outcomes.push({ path: c.path, outcome: 'already' });
    else if (same(current, c.from)) {
      value = setAt(value, c.path, c.to);
      outcomes.push({ path: c.path, outcome: 'updated' });
    } else outcomes.push({ path: c.path, outcome: 'edited' });
  }
  return { value, outcomes };
}

/** Linhas do relatório final para o que NÃO foi atualizado porque o cliente já tinha editado. */
export const skippedLines = (where: string, outcomes: Result<unknown>['outcomes']) =>
  outcomes.filter((o) => o.outcome === 'edited').map((o) => `${where} · ${o.path}`);
