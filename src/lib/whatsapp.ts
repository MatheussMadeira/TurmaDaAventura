export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? '5500000000000';

/** Monta o link wa.me. Sem `phone`, usa NEXT_PUBLIC_WHATSAPP. */
export const whatsappUrl = (message?: string, phone: string = WHATSAPP) =>
  `https://wa.me/${phone.replace(/\D/g, '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

/** Mensagem contextual por rota (docs/site.md). */
export const PAGE_MESSAGES: Record<string, string> = {
  '/': 'Olá! Vim pelo site e quero um orçamento.',
  '/oficinas': 'Olá! Quero saber mais sobre as Oficinas.',
  '/festas-e-aniversarios': 'Olá! Quero orçamento para uma festa de aniversário.',
  '/produtos': 'Olá! Quero saber mais sobre os produtos da Turma.',
  '/restaurantes': 'Olá! Tenho um restaurante e quero recreação para as famílias.',
  '/eventos-corporativos': 'Olá! Quero recreação infantil para um evento corporativo.',
  '/quem-somos': 'Olá! Quero conversar com a Turma da Aventura.',
};

export const DEFAULT_MESSAGE = 'Olá! Vim pelo site e quero saber mais.';

const ROUTE_KEY: Record<string, string> = {
  '/': 'inicio',
  '/oficinas': 'oficinas',
  '/festas-e-aniversarios': 'festas-e-aniversarios',
  '/restaurantes': 'restaurantes',
  '/eventos-corporativos': 'eventos-corporativos',
  '/quem-somos': 'quem-somos',
};

/** Mensagem da rota: a cadastrada em Contato e WhatsApp (overrides) > o padrão da página > a do botão flutuante. */
export const messageForPath = (pathname?: string | null, overrides?: Record<string, string>) => {
  const key = pathname ? ROUTE_KEY[pathname] : undefined;
  return (
    (key && overrides?.[key]) ||
    (pathname && PAGE_MESSAGES[pathname]) ||
    overrides?.float ||
    DEFAULT_MESSAGE
  );
};

export interface QuoteMessageValues {
  nome: string;
  tipo: string;
  data?: string;
  criancas?: string;
  idades?: string;
  cidade?: string;
  msg?: string;
}

export function buildQuoteMessage(v: QuoteMessageValues, nameLabel = 'Nome') {
  const lines = [
    'Olá, Turma da Aventura! Quero um orçamento.',
    '',
    `• ${nameLabel}: ${v.nome}`,
    `• Tipo: ${v.tipo}`,
  ];
  if (v.data) lines.push(`• Data: ${v.data}`);
  if (v.criancas) lines.push(`• Nº de crianças: ${v.criancas}`);
  if (v.idades) lines.push(`• Idades: ${v.idades}`);
  if (v.cidade) lines.push(`• Local/cidade: ${v.cidade}`);
  if (v.msg) lines.push('', v.msg);
  return lines.join('\n');
}
