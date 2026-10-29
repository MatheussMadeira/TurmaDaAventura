import 'server-only';
import { redirect, unstable_rethrow } from 'next/navigation';
import type { ZodError } from 'zod';
import type { Permission } from '@/lib/permissions';
import { AuthzError, authorize, type SessionUser } from './auth/session';

/** Resultado padrão das Server Actions do admin (serializável). */
export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Erro de regra de negócio com mensagem pronta para a tela. */
export class DomainError extends Error {
  constructor(
    message: string,
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

/** Primeiro erro por campo: { nome: "…", 'cards.0.title': "…" }. */
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

export function fail(error: string, fieldErrors?: Record<string, string>): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

export function failZod(error: ZodError): ActionResult<never> {
  const fieldErrors = zodFieldErrors(error);
  const n = Object.keys(fieldErrors).length;
  return fail(`Revise ${n} ${n === 1 ? 'campo' : 'campos'}. Nada foi salvo ainda.`, fieldErrors);
}

/**
 * Envelope de TODA Server Action: autoriza no servidor (usuário no banco, ativo, papel, senha trocada)
 * ANTES de qualquer leitura/escrita e traduz erros em resultado — a UI nunca vê stack trace.
 */
export async function run<T = undefined>(
  opts: { permission?: Permission; allowMustChange?: boolean },
  fn: (user: SessionUser) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    const user = await authorize(opts);
    return await fn(user);
  } catch (e) {
    unstable_rethrow(e); // redirect()/notFound() lançados dentro de fn
    if (e instanceof AuthzError) {
      if (e.code === 'unauthenticated') redirect('/admin/login');
      if (e.code === 'must-change-password') redirect('/admin/trocar-senha');
      return fail(e.message);
    }
    if (e instanceof DomainError) return fail(e.message, e.fieldErrors);
    console.error('[admin action]', e);
    return fail('Não foi possível concluir. Tente de novo em instantes.');
  }
}
