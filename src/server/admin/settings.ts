import 'server-only';
import contatoJson from '@/content/contato.json';
import { settingsSchema, type SettingsParsed } from '@/content/adminSchemas';
import type { SessionUser } from '../auth/session';
import { db } from '../db';
import { audit, parseInput, touchSite } from './shared';

/** Configurações para o formulário (ou os valores do seed, se a linha ainda não existe). */
export async function getSettingsForm() {
  const s = await db.siteSettings.findUnique({ where: { id: 'site' } });
  return {
    whatsapp: s?.whatsapp ?? contatoJson.whatsapp,
    instagram: s?.instagram ?? contatoJson.instagram,
    email: s?.email ?? contatoJson.email,
    city: s?.city ?? contatoJson.cidade,
    hours: s?.hours ?? contatoJson.horario,
    messages: (s?.messages as Record<string, string> | undefined) ?? contatoJson.mensagens,
  };
}

export async function saveSettings(actor: SessionUser, rawInput: unknown): Promise<SettingsParsed> {
  const input = parseInput(settingsSchema, rawInput);
  const data = { ...input };
  await db.siteSettings.upsert({
    where: { id: 'site' },
    update: data,
    create: { id: 'site', ...data },
  });
  await audit(
    actor,
    'settings',
    'settings.update',
    'site',
    'Atualizou contato e mensagens do WhatsApp',
    true,
  );
  touchSite();
  return input;
}
