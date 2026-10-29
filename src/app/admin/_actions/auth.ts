'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { LOGIN_ERROR, safeNext } from '@/lib/adminAuth';
import { signIn, signOut } from '@/server/auth';
import { db } from '@/server/db';
import { getCurrentUser } from '@/server/auth/session';
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
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult | null> {
  const current = String(formData.get('current') ?? '');
  const next = String(formData.get('next') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  const result = await run({ allowMustChange: true }, async (user) => {
    try {
      await changeOwnPassword(user, current, next, confirm);
    } catch (e) {
      if (e instanceof DomainError) return fail(e.message, e.fieldErrors);
      throw e;
    }
    return { ok: true as const };
  });
  if (!result.ok) return result;

  // a troca invalidou o token antigo: entra de novo com a senha nova (usuário já em cache na requisição)
  const me = await getCurrentUser();
  if (me) await signIn('credentials', { email: me.email, password: next, redirect: false });
  redirect('/admin');
}
