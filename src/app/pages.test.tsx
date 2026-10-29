import type { ReactElement } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '@/test/a11y';
import { renderWithProviders } from '@/test/render';
import HomePage from './(site)/page';
import OficinaPage from './(site)/oficina/page';
import RestaurantesPage from './(site)/restaurantes/page';
import EventosPage from './(site)/eventos-corporativos/page';
import QuemSomosPage from './(site)/quem-somos/page';

/* data-section = nomes do canvas (docs/site.md, "Seções por página"). O Hero não é <Section>. */
const pages: { name: string; page: () => ReactElement; sections: string[] }[] = [
  {
    name: 'Início',
    page: HomePage,
    sections: [
      'Inicio/TresJeitos',
      'Inicio/Pilares',
      'Inicio/ComoFunciona',
      'Inicio/OndeEsta',
      'Inicio/Galeria',
      'Inicio/CTA',
    ],
  },
  {
    name: 'Oficina',
    page: OficinaPage,
    sections: [
      'Oficina/Catalogo',
      'Oficina/ComoMontamos',
      'Oficina/SegurancaMateriais',
      'Oficina/PreOrcamento',
      'Oficina/CTA',
    ],
  },
  {
    name: 'Restaurantes',
    page: RestaurantesPage,
    sections: [
      'Restaurantes/Intro',
      'Restaurantes/Lista',
      'Restaurantes/TemUmRestaurante',
      'Restaurantes/CTA',
    ],
  },
  {
    name: 'Eventos corporativos',
    page: EventosPage,
    sections: [
      'EventosCorporativos/Formatos',
      'EventosCorporativos/EmpresasAtendidas',
      'EventosCorporativos/ComoFunciona',
      'EventosCorporativos/Beneficios',
      'EventosCorporativos/PreOrcamento',
      'EventosCorporativos/CTA',
    ],
  },
  {
    name: 'Quem somos',
    page: QuemSomosPage,
    sections: [
      'QuemSomos/Historia',
      'QuemSomos/Pilares',
      'QuemSomos/Equipe',
      'QuemSomos/Seguranca',
      'QuemSomos/CTA',
    ],
  },
];

describe.each(pages)('página $name', ({ page, sections }) => {
  it('tem um único H1', () => {
    renderWithProviders(page());
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('tem as seções do canvas, na ordem', () => {
    const { container } = renderWithProviders(page());
    const found = [...container.querySelectorAll('[data-section]')].map((el) =>
      el.getAttribute('data-section'),
    );
    expect(found).toEqual(sections);
  });

  it('não mostra preço', () => {
    const { container } = renderWithProviders(page());
    expect(container.textContent).not.toMatch(/R\$|\d\s*reais|a partir de r\$/i);
  });

  it('não tem violações de acessibilidade (axe)', async () => {
    const { container } = renderWithProviders(page());
    await expectNoA11yViolations(container);
  });

  it('toda imagem tem alt (decorativas com alt vazio)', () => {
    const { container } = renderWithProviders(page());
    for (const img of container.querySelectorAll('img')) expect(img).toHaveAttribute('alt');
  });
});

describe('Oficina — filtro', () => {
  it('filtra por categoria e anuncia a contagem', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    renderWithProviders(<OficinaPage />);
    expect(screen.getByRole('status')).toHaveTextContent('Mostrando 9 atividades');
    await user.click(screen.getByRole('button', { name: /natureza/i }));
    expect(screen.getByRole('status')).toHaveTextContent('Mostrando 2 atividades');
    expect(screen.getByRole('button', { name: /natureza/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
