'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { WHATSAPP } from '@/lib/whatsapp';

export interface SiteSettingsValue {
  /** só dígitos com DDI */
  phone: string;
  /** mensagem pronta por página (+ "float"), editável em Contato e WhatsApp */
  messages: Record<string, string>;
}

const Ctx = createContext<SiteSettingsValue>({ phone: WHATSAPP, messages: {} });

/** Entrega o WhatsApp e as mensagens cadastrados no admin aos botões/flutuante/formulário. */
export function SiteSettingsProvider({
  value,
  children,
}: {
  value: SiteSettingsValue;
  children: ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Sem provider (testes, /_dev) devolve o número do .env e nenhuma mensagem customizada. */
export const useSiteSettings = () => useContext(Ctx);
