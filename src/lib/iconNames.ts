/** Nomes do set de ícones. Módulo neutro (sem 'use client') para schemas, seed e servidor. */
export const ICON_NAMES = [
  'whatsapp',
  'instagram',
  'menu',
  'close',
  'arrow-right',
  'chevron-down',
  'check',
  'map-pin',
  'clock',
  'calendar',
  'users',
  'compass',
  'tent',
  'tree',
  'leaf',
  'scissors',
  'palette',
  'utensils',
  'briefcase',
  'star',
  'flag',
  'backpack',
  'phone',
  'mail',
  'heart',
  'shield',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

/**
 * Ícones só da interface do painel (mesmo traço 2px / grade 24px). Ficam FORA de ICON_NAMES para
 * que os schemas de conteúdo do site não aceitem ícones administrativos.
 */
export const ADMIN_ICON_NAMES = [
  'edit',
  'trash',
  'eye',
  'eye-off',
  'arrow-up',
  'arrow-down',
  'plus',
  'upload',
  'image',
  'copy',
  'lock',
  'logout',
  'pause',
  'sun',
  'moon',
  'home',
  'user',
  'external',
  'alert',
] as const;

export type AdminIconName = (typeof ADMIN_ICON_NAMES)[number];
