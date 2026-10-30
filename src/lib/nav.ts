export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Início', href: '/' },
  { label: 'Oficinas', href: '/oficinas' },
  { label: 'Festas', href: '/festas-e-aniversarios' },
  { label: 'Restaurantes', href: '/restaurantes' },
  { label: 'Eventos corporativos', href: '/eventos-corporativos' },
  { label: 'Quem somos', href: '/quem-somos' },
];

/** Rodapé: mesma ordem do menu, com o nome por extenso da página de festas. */
export const FOOTER_ITEMS: NavItem[] = NAV_ITEMS.map((i) =>
  i.href === '/festas-e-aniversarios' ? { ...i, label: 'Festas e aniversários' } : i,
);
