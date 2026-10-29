export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Início', href: '/' },
  { label: 'Oficina', href: '/oficina' },
  { label: 'Restaurantes', href: '/restaurantes' },
  { label: 'Eventos corporativos', href: '/eventos-corporativos' },
  { label: 'Quem somos', href: '/quem-somos' },
];
