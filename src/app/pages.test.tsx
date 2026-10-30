import type { ReactElement } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '@/test/a11y';
import { renderWithProviders } from '@/test/render';
import { contentModuleMock, fixtureRestaurants } from '@/test/contentFixture';
import HomePage from './(site)/page';
import OficinasPage from './(site)/oficinas/page';
import FestasPage from './(site)/festas-e-aniversarios/page';
import RestaurantesPage from './(site)/restaurantes/page';
import EventosPage from './(site)/eventos-corporativos/page';
import QuemSomosPage from './(site)/quem-somos/page';

vi.mock('@/server/content', () => contentModuleMock());

/* data-section = nomes do canvas (docs/site.md, "Seções por página"). O Hero não é <Section>. */
const pages: { name: string; page: () => Promise<ReactElement>; sections: string[] }[] = [
  {
    name: 'Início',
    page: HomePage,
    sections: [
      'Inicio/QuatroJeitos',
      'Inicio/Pilares',
      'Inicio/ComoFunciona',
      'Inicio/OndeEsta',
      'Inicio/Galeria',
      'Inicio/CTA',
    ],
  },
  {
    name: 'Oficinas',
    page: OficinasPage,
    sections: [
      'Oficinas/Catalogo',
      'Oficinas/ComoMontamos',
      'Oficinas/SegurancaMateriais',
      'Oficinas/PreOrcamento',
      'Oficinas/CTA',
    ],
  },
  {
    name: 'Festas e aniversários',
    page: FestasPage,
    sections: [
      'Festas/Formatos',
      'Festas/Temas',
      'Festas/OQueInclui',
      'Festas/ComoFunciona',
      'Festas/PreOrcamento',
      'Festas/CTA',
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
  it('tem um único H1', async () => {
    renderWithProviders(await page());
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('tem as seções do canvas, na ordem', async () => {
    const { container } = renderWithProviders(await page());
    const found = [...container.querySelectorAll('[data-section]')].map((el) =>
      el.getAttribute('data-section'),
    );
    expect(found).toEqual(sections);
  });

  it('não mostra preço', async () => {
    const { container } = renderWithProviders(await page());
    expect(container.textContent).not.toMatch(/R\$|\d\s*reais|a partir de r\$/i);
  });

  it('não tem violações de acessibilidade (axe)', async () => {
    const { container } = renderWithProviders(await page());
    await expectNoA11yViolations(container);
  });

  it('toda imagem tem alt (decorativas com alt vazio)', async () => {
    const { container } = renderWithProviders(await page());
    for (const img of container.querySelectorAll('img')) expect(img).toHaveAttribute('alt');
  });
});

describe('Oficinas — filtro', () => {
  it('filtra por categoria e anuncia a contagem', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    renderWithProviders(await OficinasPage());
    expect(screen.getByRole('status')).toHaveTextContent('Mostrando 9 atividades');
    await user.click(screen.getByRole('button', { name: /natureza/i }));
    expect(screen.getByRole('status')).toHaveTextContent('Mostrando 2 atividades');
    expect(screen.getByRole('button', { name: /natureza/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

describe('Festas e aniversários', () => {
  it('mostra os 6 temas com etiquetas, foto 16:10 (placeholder) e âncora #temas', async () => {
    const { container } = renderWithProviders(await FestasPage());
    const temas = container.querySelector('[data-section="Festas/Temas"]')!;
    expect(temas.id).toBe('temas');
    expect(temas.querySelectorAll('article')).toHaveLength(6);
    expect(temas.textContent).toContain('Expedição na floresta');
    expect(temas.querySelectorAll('[data-media]')).toHaveLength(6);
    expect(temas.textContent).toContain('Personalizável');
  });

  it('o botão secundário do Hero leva para os temas', async () => {
    renderWithProviders(await FestasPage());
    expect(screen.getByRole('link', { name: /Ver os temas/ })).toHaveAttribute('href', '#temas');
  });

  it('o formulário já vem com o tipo "Festa ou aniversário" e título "Monte a festa"', async () => {
    renderWithProviders(await FestasPage());
    expect(screen.getByLabelText(/tipo de evento/i)).toHaveValue('Festa ou aniversário');
    expect(screen.getByText('Monte a festa')).toBeInTheDocument();
  });
});

describe('restaurantes — endereço, overline e título', () => {
  it('endereços sem o bairro em todos os registros', () => {
    const list = fixtureRestaurants();
    expect(list.length).toBeGreaterThan(0);
    for (const r of list) {
      expect(r.address).not.toContain('·');
      expect(r.address).not.toContain(r.neighborhood);
    }
  });

  it('Início: overline do card é só o bairro', async () => {
    const { container } = renderWithProviders(await HomePage());
    const overlines = [
      ...container.querySelectorAll('[data-section="Inicio/OndeEsta"] article .overline'),
    ].map((el) => el.textContent);
    expect(overlines).toEqual(['Belvedere', 'Savassi', 'Pampulha']);
  });

  it('Restaurantes: um título só ("N restaurantes com a Turma"), sem chips de âncora, grade única', async () => {
    const { container } = renderWithProviders(await RestaurantesPage());
    const lista = container.querySelector('[data-section="Restaurantes/Lista"]')!;
    const overlines = [...lista.querySelectorAll('article .overline')].map((el) => el.textContent);
    expect(overlines).toEqual(fixtureRestaurants().map((r) => r.neighborhood));
    expect([...lista.querySelectorAll('h2')].map((h) => h.textContent)).toEqual([
      `${fixtureRestaurants().length} restaurantes com a Turma`,
    ]);
    // sem chips de âncora na introdução
    expect(container.querySelectorAll('[data-section="Restaurantes/Intro"] a').length).toBe(0);
  });
});
