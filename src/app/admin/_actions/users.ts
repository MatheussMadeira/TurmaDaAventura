'use server';

import { revalidatePath } from 'next/cache';
import type { Role } from '@/lib/permissions';
import { fail, run, type ActionResult } from '@/server/actions';
import { changeRole, createUser, resetPassword, setActive } from '@/server/users';

/** Dados que a tela mostra UMA vez (senha temporária). */
export interface TempPasswordData {
  name: string;
  email: string;
  tempPassword: string;
}

const isRole = (v: unknown): v is Role => v === 'ADMIN' || v === 'EQUIPE';

export async function createUserAction(
  _prev: ActionResult<TempPasswordData> | null,
  formData: FormData,
): Promise<ActionResult<TempPasswordData>> {
  return run<TempPasswordData>({ permission: 'users' }, async (actor) => {
    const role = formData.get('role');
    if (!isRole(role)) return fail('Escolha o papel.', { role: 'Escolha o papel.' });
    const { user, tempPassword } = await createUser(actor, {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      role,
    });
    revalidatePath('/admin/usuarios');
    return {
      ok: true,
      message: 'Usuário criado.',
      data: { name: user.name, email: user.email, tempPassword },
    };
  });
}

export async function changeRoleAction(id: string, role: Role): Promise<ActionResult> {
  return run({ permission: 'users' }, async (actor) => {
    if (!isRole(role)) return fail('Papel inválido.');
    await changeRole(actor, id, role);
    revalidatePath('/admin/usuarios');
    return { ok: true, message: 'Papel atualizado.' };
  });
}

export async function setActiveAction(id: string, active: boolean): Promise<ActionResult> {
  return run({ permission: 'users' }, async (actor) => {
    await setActive(actor, id, active);
    revalidatePath('/admin/usuarios');
    return { ok: true, message: active ? 'Acesso reativado.' : 'Acesso desativado.' };
  });
}

export async function resetPasswordAction(id: string): Promise<ActionResult<TempPasswordData>> {
  return run<TempPasswordData>({ permission: 'users' }, async (actor) => {
    const { user, tempPassword } = await resetPassword(actor, id);
    revalidatePath('/admin/usuarios');
    return {
      ok: true,
      message: 'Senha redefinida.',
      data: { name: user.name, email: user.email, tempPassword },
    };
  });
}
