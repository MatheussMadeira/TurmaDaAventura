'use client';

import type { ReactNode, SVGAttributes } from 'react';
import { ICON_NAMES, type AdminIconName, type IconName } from '@/lib/iconNames';
import { Svg } from './Icon.styles';

export type { AdminIconName, IconName };
/** Qualquer ícone do set (conteúdo do site + interface do painel). */
export type AnyIconName = IconName | AdminIconName;

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, 'name'> {
  name: AnyIconName;
  /** px; padrão 24 */
  size?: number;
  /** Texto para leitores de tela. Sem label o ícone é decorativo (aria-hidden). */
  label?: string;
}

/* Traço arredondado de 2px em grade 24px, herdando currentColor (referência: bundle.js). */
const ADMIN_ICONS: Record<AdminIconName, ReactNode> = {
  edit: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M13.5 6.5l4 4" />
    </>
  ),
  trash: (
    <>
      <path d="M5 7h14" />
      <path d="M10 7V4.5h4V7" />
      <path d="M7 7l1 13h8l1-13" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx={12} cy={12} r={3} />
    </>
  ),
  'eye-off': (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx={12} cy={12} r={3} />
      <path d="M4 4l16 16" />
    </>
  ),
  'arrow-up': (
    <>
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </>
  ),
  'arrow-down': (
    <>
      <path d="M12 5v14" />
      <path d="M6 13l6 6 6-6" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M4 16v3.5h16V16" />
    </>
  ),
  image: (
    <>
      <rect x={3.5} y={4.5} width={17} height={15} rx={3} />
      <circle cx={9} cy={10} r={1.5} />
      <path d="M4 17l5-5 4 4 3-3 4 4" />
    </>
  ),
  copy: (
    <>
      <rect x={8.5} y={8.5} width={12} height={12} rx={2.5} />
      <path d="M15.5 8.5V6A2.5 2.5 0 0 0 13 3.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5" />
    </>
  ),
  lock: (
    <>
      <rect x={5} y={11} width={14} height={9.5} rx={3} />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  logout: (
    <>
      <path d="M10 4.5H6.5A2.5 2.5 0 0 0 4 7v10a2.5 2.5 0 0 0 2.5 2.5H10" />
      <path d="M15 8l4 4-4 4" />
      <path d="M19 12H9" />
    </>
  ),
  pause: (
    <>
      <path d="M9 5v14" />
      <path d="M15 5v14" />
    </>
  ),
  sun: (
    <>
      <circle cx={12} cy={12} r={4} />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  home: (
    <>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 9.5V20h12V9.5" />
    </>
  ),
  user: (
    <>
      <circle cx={12} cy={8.5} r={3.5} />
      <path d="M4.5 20c.6-3.6 3.6-5.5 7.5-5.5s6.9 1.9 7.5 5.5" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4l-9 9" />
      <path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4L2.8 19.5h18.4z" />
      <path d="M12 10v4.5" />
      <circle cx={12} cy={17} r={0.6} fill="currentColor" />
    </>
  ),
};

const ICONS: Record<IconName, ReactNode> = {
  whatsapp: (
    <>
      <path d="M4.2 19.8l1.1-3.9A8.4 8.4 0 1 1 8.4 19l-4.2.8z" />
      <path
        d="M9.1 8.4c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .4-.1.6l-.5.6c.6 1.2 1.6 2.1 2.8 2.7l.6-.6c.2-.2.4-.2.6-.1l1.6.7c.2.1.4.3.3.6v.5c-.1.6-.9 1.3-1.7 1.3-2.9-.2-6-3.2-6.2-6.2 0-.6.3-1.1.6-1.4z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  instagram: (
    <>
      <rect x={3.5} y={3.5} width={17} height={17} rx={5} />
      <circle cx={12} cy={12} r={4} />
      <circle cx={17.2} cy={6.8} r={0.9} fill="currentColor" stroke="none" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
  'arrow-right': (
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  'chevron-down': <path d="M6 9l6 6 6-6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  'map-pin': (
    <>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx={12} cy={9.5} r={2.5} />
    </>
  ),
  clock: (
    <>
      <circle cx={12} cy={12} r={8.5} />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  calendar: (
    <>
      <rect x={3.5} y={5} width={17} height={15.5} rx={3} />
      <path d="M3.5 10h17" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </>
  ),
  users: (
    <>
      <circle cx={9} cy={8.5} r={3.5} />
      <path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" />
      <path d="M15.5 5.2a3.5 3.5 0 0 1 0 6.6" />
      <path d="M18 14.8c2 .7 3.2 2.4 3.5 5.2" />
    </>
  ),
  compass: (
    <>
      <circle cx={12} cy={12} r={8.5} />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  tent: (
    <>
      <path d="M12 4L2.5 20h19z" />
      <path d="M12 4v16" />
      <path d="M9 20l3-6 3 6" />
      <path d="M10.5 3l1.5 1 1.5-1" />
    </>
  ),
  tree: (
    <>
      <path d="M12 3l-6 8h3.5l-4 6h13l-4-6H18z" />
      <path d="M12 17v4" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z" />
      <path d="M5 19l7-7" />
    </>
  ),
  scissors: (
    <>
      <circle cx={6.5} cy={7} r={2.5} />
      <circle cx={6.5} cy={17} r={2.5} />
      <path d="M8.6 8.4L20 18" />
      <path d="M8.6 15.6L20 6" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.3 0 1.8-.9 1.5-1.9-.4-1.2.2-2.4 1.6-2.4H17a3.5 3.5 0 0 0 3.5-3.5c0-5-3.8-9.2-8.5-9.2z" />
      <circle cx={8} cy={10} r={1} fill="currentColor" />
      <circle cx={12} cy={7.5} r={1} fill="currentColor" />
      <circle cx={16} cy={10} r={1} fill="currentColor" />
    </>
  ),
  utensils: (
    <>
      <path d="M7 3v8" />
      <path d="M4.5 3v5a2.5 2.5 0 0 0 5 0V3" />
      <path d="M7 11v10" />
      <path d="M17 21V3c-2.2 1.2-3.5 3.8-3.5 7.5V13H17" />
    </>
  ),
  briefcase: (
    <>
      <rect x={3} y={7} width={18} height={13} rx={3} />
      <path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="M3 12.5h18" />
    </>
  ),
  star: <path d="M12 3.8l2.5 5.2 5.6.7-4.1 3.9 1 5.6L12 16.5l-5 2.7 1-5.6-4.1-3.9 5.6-.7z" />,
  flag: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4.5c4-2 6 2 10 0l4-1v9l-4 1c-4 2-6-2-10 0" />
    </>
  ),
  backpack: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0v10.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19.5z" />
      <path d="M9.5 3.6V3h5v.6" />
      <path d="M9 14h6v3.5H9z" />
    </>
  ),
  phone: (
    <path d="M5 3.5h3.2l1.6 4.2-2.1 1.4a11 11 0 0 0 7.2 7.2l1.4-2.1 4.2 1.6V19a1.5 1.5 0 0 1-1.6 1.5C10.4 20 4 13.6 3.5 5.1A1.5 1.5 0 0 1 5 3.5z" />
  ),
  mail: (
    <>
      <rect x={3} y={5} width={18} height={14} rx={3} />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </>
  ),
  heart: (
    <path d="M12 20s-8-4.6-8-10.4A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8 2.6C20 15.4 12 20 12 20z" />
  ),
  shield: (
    <>
      <path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z" />
      <path d="M8.5 12l2.5 2.5 4.5-4.5" />
    </>
  ),
};

export const iconNames: readonly IconName[] = ICON_NAMES;

export function Icon({ name, size = 24, label, ...rest }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      {...rest}
    >
      {(ICONS as Record<string, ReactNode>)[name] ??
        (ADMIN_ICONS as Record<string, ReactNode>)[name]}
    </Svg>
  );
}
