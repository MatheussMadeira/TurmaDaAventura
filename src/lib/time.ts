/** "Há 5 min", "Há 3 h", "Ontem", "Há 2 dias", "12/10/2026". Texto curto para listas do painel. */
export function timeAgo(date: Date | string, now: Date = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Math.max(0, now.getTime() - d.getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'Agora';
  if (min < 60) return `Há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Há ${h} h`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'Ontem';
  if (days < 30) return `Há ${days} dias`;
  return d.toLocaleDateString('pt-BR');
}

export const ENTITY_AREA: Record<string, string> = {
  restaurant: 'Restaurantes',
  activity: 'Oficina',
  team: 'Quem somos',
  settings: 'Contato',
  page: 'Páginas',
  media: 'Fotos',
  user: 'Usuários',
  site: 'Sistema',
};
