import type { ReactElement } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '@/test/a11y';
import { renderWithProviders } from '@/test/render';
import { contentModuleMock, fixtureGroups } from '@/test/contentFixture';
import HomePage from './(site)/page';
import OficinasPage from './(site)/oficinas/page';
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
      'Inicio/TresJeitos',
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

describe('restaurantes — endereço e overline', () => {
  it('endereços sem o bairro em todos os registros', () => {
    const groups = fixtureGroups();
    expect(groups.length).toBeGreaterThan(0);
    for (const r of groups.flatMap((g) => g.restaurants)) {
      expect(r.address).not.toContain('·');
      expect(r.address).not.toContain(r.neighborhood);
    }
  });

  it('Início: overline "{bairro} · {região}" (ex.: Pinheiros · Zona Oeste)', async () => {
    const { container } = renderWithProviders(await HomePage());
    const overlines = [
      ...container.querySelectorAll('[data-section="Inicio/OndeEsta"] article .overline'),
    ].map((el) => el.textContent);
    expect(overlines).toEqual([
      'Pinheiros · Zona Oeste',
      'Granja Viana · Zona Oeste',
      'Moema · Zona Sul',
    ]);
  });

  it('Restaurantes: overline é só o bairro (a região já é o título do grupo)', async () => {
    const { container } = renderWithProviders(await RestaurantesPage());
    const overlines = [
      ...container.querySelectorAll('[data-section="Restaurantes/Lista"] article .overline'),
    ].map((el) => el.textContent);
    expect(overlines).toEqual([
      'Pinheiros',
      'Vila Madalena',
      'Granja Viana',
      'Moema',
      'Campo Belo',
      'Brooklin',
    ]);
    expect(
      [...container.querySelectorAll('[data-section="Restaurantes/Lista"] h2')].map(
        (h) => h.textContent,
      ),
    ).toEqual(['Zona Oeste e Granja Viana', 'Zona Sul']);
  });
});
