'use client';

import type { ReactNode, SVGAttributes } from 'react';
import { ICON_NAMES, type IconName } from '@/lib/iconNames';
import { Svg } from './Icon.styles';

export type { IconName };

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, 'name'> {
  name: IconName;
  /** px; padrão 24 */
  size?: number;
  /** Texto para leitores de tela. Sem label o ícone é decorativo (aria-hidden). */
  label?: string;
}

/* Traço arredondado de 2px em grade 24px, herdando currentColor (referência: bundle.js). */
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
      {ICONS[name]}
    </Svg>
  );
}
