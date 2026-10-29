'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { LOGIN_ERROR, safeNext } from '@/lib/adminAuth';
import { signIn, signOut } from '@/server/auth';
import { db } from '@/server/db';
import { changeOwnPassword } from '@/server/users';
import { DomainError, fail, run, type ActionResult } from '@/server/actions';

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult | null> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  if (!email.trim() || !password) return fail(LOGIN_ERROR);

  try {
    await signIn('credentials', {
      email,
      password,
      remember: formData.get('remember') ? 'true' : '',
      redirect: false,
    });
  } catch (e) {
    if (e instanceof AuthError) return fail(LOGIN_ERROR);
    throw e;
  }
  // vai direto ao destino certo: um redirect encadeado (/admin → /admin/trocar-senha) deixaria a URL errada
  const me = await db.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { mustChangePassword: true },
  });
  if (me?.mustChangePassword) redirect('/admin/trocar-senha');
  redirect(safeNext(formData.get('next')) ?? '/admin');
}

export async function logoutAction() {
  await signOut({ redirectTo: '/admin/login' });
}

/** Troca de senha (obrigatória no primeiro acesso). Reemite a sessão com a nova versão do token. */
export async function changePasswordAction(
  _prev: ActionResult<{ to: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ to: string }> | null> {
  const current = String(formData.get('current') ?? '');
  const next = String(formData.get('next') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  let email: string | null = null;
  const result = await run({ allowMustChange: true }, async (user) => {
    email = user.email;
    try {
      await changeOwnPassword(user, current, next, confirm);
    } catch (e) {
      if (e instanceof DomainError) return fail(e.message, e.fieldErrors);
      throw e;
    }
    return { ok: true as const };
  });
  if (!result.ok) return result;

  // a troca invalidou o token antigo: entra de novo com a senha nova.
  // (getCurrentUser() daria null aqui: a versão do token no banco já mudou)
  if (email) await signIn('credentials', { email, password: next, redirect: false });
  // a tela faz navegação completa: um redirect encadeado aqui renderiza /admin com o cookie ANTIGO
  return { ok: true, data: { to: '/admin' } };
}
