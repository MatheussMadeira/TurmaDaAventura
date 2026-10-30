'use server';

import { revalidatePath } from 'next/cache';
import type { PublishStatus } from '@/generated/prisma/client';
import { run, type ActionResult } from '@/server/actions';
import {
  deleteActivity,
  moveActivity,
  saveActivity,
  setActivityStatus,
} from '@/server/admin/activities';
import {
  deleteRestaurant,
  moveRestaurant,
  saveRestaurant,
  setRestaurantStatus,
  type SaveMode,
} from '@/server/admin/restaurants';
import { saveSettings } from '@/server/admin/settings';
import { deleteTheme, moveTheme, saveTheme, setThemeStatus } from '@/server/admin/themes';
import { deleteMember, moveMember, saveMember, setMemberVisible } from '@/server/admin/team';
import { deleteMedia, updateMediaAlt } from '@/server/media';

const STATUSES: PublishStatus[] = ['RASCUNHO', 'PUBLICADO', 'PAUSADO'];
const isStatus = (v: unknown): v is PublishStatus => STATUSES.includes(v as PublishStatus);
const isDir = (v: unknown): v is 'up' | 'down' => v === 'up' || v === 'down';
const isMode = (v: unknown): v is SaveMode => v === 'draft' || v === 'publish';

/* ---------------- Restaurantes ---------------- */
export async function saveRestaurantAction(
  id: string | null,
  input: unknown,
  mode: SaveMode,
): Promise<ActionResult<{ id: string }>> {
  return run<{ id: string }>({ permission: 'restaurants' }, async (user) => {
    if (!isMode(mode)) return { ok: false, error: 'Ação inválida.' };
    const saved = await saveRestaurant(user, id, input, mode);
    revalidatePath('/admin/restaurantes');
    return {
      ok: true,
      data: { id: saved.id },
      message:
        mode === 'draft'
          ? 'Rascunho salvo. Ele ainda não aparece no site.'
          : saved.status === 'PUBLICADO'
            ? 'Restaurante salvo e publicado. Ele já aparece no site.'
            : 'Restaurante salvo e pausado. Ele não aparece no site.',
    };
  });
}

export async function setRestaurantStatusAction(
  id: string,
  status: PublishStatus,
): Promise<ActionResult> {
  return run({ permission: 'restaurants' }, async (user) => {
    if (!isStatus(status)) return { ok: false, error: 'Situação inválida.' };
    await setRestaurantStatus(user, id, status);
    revalidatePath('/admin/restaurantes');
    return {
      ok: true,
      message: status === 'PAUSADO' ? 'Restaurante pausado.' : 'Situação atualizada.',
    };
  });
}

export async function deleteRestaurantAction(id: string): Promise<ActionResult> {
  return run({ permission: 'restaurants' }, async (user) => {
    await deleteRestaurant(user, id);
    revalidatePath('/admin/restaurantes');
    return { ok: true, message: 'Restaurante excluído.' };
  });
}

export async function moveRestaurantAction(id: string, dir: 'up' | 'down'): Promise<ActionResult> {
  return run({ permission: 'restaurants' }, async (user) => {
    if (!isDir(dir)) return { ok: false, error: 'Direção inválida.' };
    await moveRestaurant(user, id, dir);
    revalidatePath('/admin/restaurantes');
    return { ok: true };
  });
}

/* ---------------- Atividades ---------------- */
export async function saveActivityAction(
  id: string | null,
  input: unknown,
  mode: SaveMode,
): Promise<ActionResult<{ id: string }>> {
  return run<{ id: string }>({ permission: 'activities' }, async (user) => {
    if (!isMode(mode)) return { ok: false, error: 'Ação inválida.' };
    const saved = await saveActivity(user, id, input, mode);
    revalidatePath('/admin/atividades');
    return {
      ok: true,
      data: { id: saved.id },
      message:
        mode === 'draft'
          ? 'Rascunho salvo. Ele ainda não aparece no site.'
          : saved.status === 'PUBLICADO'
            ? 'Atividade salva e publicada. Ela já aparece nas Oficinas.'
            : 'Atividade salva e pausada.',
    };
  });
}

export async function setActivityStatusAction(
  id: string,
  status: PublishStatus,
): Promise<ActionResult> {
  return run({ permission: 'activities' }, async (user) => {
    if (!isStatus(status)) return { ok: false, error: 'Situação inválida.' };
    await setActivityStatus(user, id, status);
    revalidatePath('/admin/atividades');
    return {
      ok: true,
      message: status === 'PAUSADO' ? 'Atividade pausada.' : 'Situação atualizada.',
    };
  });
}

export async function deleteActivityAction(id: string): Promise<ActionResult> {
  return run({ permission: 'activities' }, async (user) => {
    await deleteActivity(user, id);
    revalidatePath('/admin/atividades');
    return { ok: true, message: 'Atividade excluída.' };
  });
}

export async function moveActivityAction(id: string, dir: 'up' | 'down'): Promise<ActionResult> {
  return run({ permission: 'activities' }, async (user) => {
    if (!isDir(dir)) return { ok: false, error: 'Direção inválida.' };
    await moveActivity(user, id, dir);
    revalidatePath('/admin/atividades');
    return { ok: true };
  });
}

/* ---------------- Temas de festa ---------------- */
export async function saveThemeAction(
  id: string | null,
  input: unknown,
  mode: SaveMode,
): Promise<ActionResult<{ id: string }>> {
  return run<{ id: string }>({ permission: 'activities' }, async (user) => {
    if (!isMode(mode)) return { ok: false, error: 'Ação inválida.' };
    const saved = await saveTheme(user, id, input, mode);
    revalidatePath('/admin/temas');
    return {
      ok: true,
      data: { id: saved.id },
      message:
        mode === 'draft'
          ? 'Rascunho salvo. Ele ainda não aparece no site.'
          : saved.status === 'PUBLICADO'
            ? 'Tema salvo e publicado. Ele já aparece em Festas e aniversários.'
            : 'Tema salvo e pausado.',
    };
  });
}

export async function setThemeStatusAction(
  id: string,
  status: PublishStatus,
): Promise<ActionResult> {
  return run({ permission: 'activities' }, async (user) => {
    if (!isStatus(status)) return { ok: false, error: 'Situação inválida.' };
    await setThemeStatus(user, id, status);
    revalidatePath('/admin/temas');
    return { ok: true, message: status === 'PAUSADO' ? 'Tema pausado.' : 'Situação atualizada.' };
  });
}

export async function deleteThemeAction(id: string): Promise<ActionResult> {
  return run({ permission: 'activities' }, async (user) => {
    await deleteTheme(user, id);
    revalidatePath('/admin/temas');
    return { ok: true, message: 'Tema excluído.' };
  });
}

export async function moveThemeAction(id: string, dir: 'up' | 'down'): Promise<ActionResult> {
  return run({ permission: 'activities' }, async (user) => {
    if (!isDir(dir)) return { ok: false, error: 'Direção inválida.' };
    await moveTheme(user, id, dir);
    revalidatePath('/admin/temas');
    return { ok: true };
  });
}

/* ---------------- Equipe ---------------- */
export async function saveMemberAction(
  id: string | null,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return run<{ id: string }>({ permission: 'team' }, async (user) => {
    const saved = await saveMember(user, id, input);
    revalidatePath('/admin/equipe');
    return {
      ok: true,
      data: { id: saved.id },
      message: 'Pessoa salva. A página Quem somos já foi atualizada.',
    };
  });
}

export async function setMemberVisibleAction(id: string, visible: boolean): Promise<ActionResult> {
  return run({ permission: 'team' }, async (user) => {
    await setMemberVisible(user, id, !!visible);
    revalidatePath('/admin/equipe');
    return { ok: true, message: visible ? 'Pessoa visível no site.' : 'Pessoa oculta do site.' };
  });
}

export async function deleteMemberAction(id: string): Promise<ActionResult> {
  return run({ permission: 'team' }, async (user) => {
    await deleteMember(user, id);
    revalidatePath('/admin/equipe');
    return { ok: true, message: 'Pessoa removida da equipe.' };
  });
}

export async function moveMemberAction(id: string, dir: 'up' | 'down'): Promise<ActionResult> {
  return run({ permission: 'team' }, async (user) => {
    if (!isDir(dir)) return { ok: false, error: 'Direção inválida.' };
    await moveMember(user, id, dir);
    revalidatePath('/admin/equipe');
    return { ok: true };
  });
}

/* ---------------- Contato e WhatsApp (só Administração) ---------------- */
export async function saveSettingsAction(input: unknown): Promise<ActionResult> {
  return run({ permission: 'contact' }, async (user) => {
    await saveSettings(user, input);
    revalidatePath('/admin/contato');
    return { ok: true, message: 'Contato salvo e publicado. Já está no site.' };
  });
}

/* ---------------- Fotos ---------------- */
export async function updateMediaAltAction(id: string, alt: string): Promise<ActionResult> {
  return run({ permission: 'photos' }, async () => {
    await updateMediaAlt(id, alt);
    revalidatePath('/admin/fotos');
    return { ok: true, message: 'Descrição salva.' };
  });
}

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  return run({ permission: 'photos' }, async () => {
    await deleteMedia(id);
    revalidatePath('/admin/fotos');
    return { ok: true, message: 'Foto removida.' };
  });
}
