'use client';

import { useCallback, useState, useTransition } from 'react';
import type { ActionResult } from '@/server/actions';
import { Alert } from './controls';
import { useToast } from './Toast';

/** Mensagem do campo (primeiro erro daquele nome) vinda do servidor. */
export const fieldError = (r: ActionResult<unknown> | null, key: string) =>
  r && !r.ok ? r.fieldErrors?.[key] : undefined;

/** Aviso no topo: "Revise N campos. Nada foi salvo ainda." (ou o erro geral). */
export function ErrorSummary({ result }: { result: ActionResult<unknown> | null }) {
  if (!result || result.ok) return null;
  const n = result.fieldErrors ? Object.keys(result.fieldErrors).length : 0;
  return (
    <Alert
      tone="err"
      title={n > 0 ? `Revise ${n} ${n === 1 ? 'campo' : 'campos'}` : 'Não foi possível concluir'}
    >
      {n > 0 ? 'Nada foi salvo ainda. Corrija e tente de novo.' : result.error}
    </Alert>
  );
}

/**
 * Executa uma Server Action com estado de "salvando", resultado e toast de sucesso.
 * `run(fn)` devolve o resultado para a tela decidir o próximo passo (ex.: redirecionar).
 */
export function useAction<T = undefined>() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult<T> | null>(null);
  const toast = useToast();

  const run = useCallback(
    (fn: () => Promise<ActionResult<T>>, opts: { toast?: boolean } = {}) =>
      new Promise<ActionResult<T>>((resolve) => {
        start(async () => {
          const r = await fn();
          setResult(r);
          if (r.ok && r.message && opts.toast !== false) toast.show({ message: r.message });
          resolve(r);
        });
      }),
    [toast],
  );

  return { run, pending, result, reset: () => setResult(null) };
}
