export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Início', href: '/' },
  { label: 'Oficinas', href: '/oficinas' },
  { label: 'Festas', href: '/festas-e-aniversarios' },
  { label: 'Restaurantes', href: '/restaurantes' },
  { label: 'Eventos', href: '/eventos-corporativos' },
  { label: 'Produtos', href: '/produtos' },
  { label: 'Quem somos', href: '/quem-somos' },
];

/** Rótulos completos do rodapé (o menu usa os curtos). */
const FOOTER_LABELS: Record<string, string> = {
  '/festas-e-aniversarios': 'Festas e aniversários',
  '/eventos-corporativos': 'Eventos corporativos',
};

/** Rodapé: mesma ordem do menu, com o nome por extenso de Festas e Eventos. */
export const FOOTER_ITEMS: NavItem[] = NAV_ITEMS.map((i) =>
  FOOTER_LABELS[i.href] ? { ...i, label: FOOTER_LABELS[i.href]! } : i,
);
