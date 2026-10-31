import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BagProvider, SiteFloat } from '@/components/organisms/Bag';
import { SiteSettingsProvider } from '@/components/SiteSettings';
import { BAG_STORAGE_KEY } from '@/lib/bag';
import { resetBagStore } from '@/lib/bagStore';
import { productsJsonLd } from '@/lib/seo';
import { expectNoA11yViolations } from '@/test/a11y';
import { contentModuleMock, fixtureProducts } from '@/test/contentFixture';
import { renderWithProviders } from '@/test/render';
import ProdutosPage from './(site)/produtos/page';

vi.mock('@/server/content', () => contentModuleMock());

const PHONE = '5531999999999';
const START = 'Olá, Turma da Aventura! Quero fazer um pedido pelo site:';

async function renderPage() {
  const page = await ProdutosPage();
  return renderWithProviders(
    <SiteSettingsProvider value={{ phone: PHONE, messages: { sacola: START } }}>
      <BagProvider>
        {page}
        <SiteFloat />
      </BagProvider>
    </SiteSettingsProvider>,
  );
}

const addButton = (name: string) =>
  screen.getByRole('button', { name: new RegExp(`Adicionar à sacola.*${name}`) });

let tab: { closed: boolean; opener: unknown; location: { href: string }; close: () => void };

beforeEach(() => {
  tab = { closed: false, opener: window, location: { href: '' }, close: vi.fn() };
  vi.spyOn(window, 'open').mockReturnValue(tab as unknown as Window);
});

afterEach(() => {
  window.localStorage.clear();
  resetBagStore();
  vi.restoreAllMocks();
});

describe('página Produtos', () => {
  it('tem um H1, os 9 produtos e zero preço', async () => {
    const { container } = await renderPage();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(container.querySelectorAll('[data-section="Produtos/Catalogo"] article')).toHaveLength(
      9,
    );
    expect(container.textContent).not.toMatch(/R\$|\d\s*reais|preço|valor total/i);
    expect(screen.getByText(/Nenhum pagamento é feito no site/)).toBeInTheDocument();
  });

  it('não tem violações de acessibilidade (axe), nem com a sacola aberta', async () => {
    const user = userEvent.setup();
    const { container } = await renderPage();
    await expectNoA11yViolations(container);
    await user.click(addButton('Kit mini horta'));
    await user.click(screen.getByRole('button', { name: /Ver sacola/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Sua sacola' });
    await expectNoA11yViolations(dialog);
  });

  it('filtra por categoria e anuncia a contagem', async () => {
    const user = userEvent.setup();
    await renderPage();
    expect(screen.getByText(/Mostrando/)).toHaveTextContent('Mostrando 9 produtos');
    await user.click(screen.getByRole('button', { name: /Kits de atividade/ }));
    expect(screen.getByText(/Mostrando/)).toHaveTextContent('Mostrando 3 produtos');
  });

  it('etiquetas: mínimo, personalizável e nos restaurantes', async () => {
    await renderPage();
    const horta = screen.getByRole('article', { name: 'Kit mini horta' });
    expect(within(horta).getByText('Mín. 10 un.')).toBeInTheDocument();
    expect(within(horta).getByText('Personalizável')).toBeInTheDocument();
    const massinha = screen.getByRole('article', { name: 'Massinha natural' });
    expect(within(massinha).getByText('Nos restaurantes')).toBeInTheDocument();
    expect(within(massinha).queryByText(/Mín\./)).toBeNull();
  });
});

describe('sacola', () => {
  it('começa no mínimo; diminuir abaixo do mínimo tira da sacola', async () => {
    const user = userEvent.setup();
    await renderPage();
    await user.click(addButton('Kit mini horta'));
    const card = screen.getByRole('article', { name: 'Kit mini horta' });
    expect(within(card).getByText('Na sacola')).toBeInTheDocument();
    expect(
      within(card).getByRole('group', { name: /Quantidade de Kit mini horta/ }),
    ).toHaveTextContent('10');
    await user.click(within(card).getByRole('button', { name: 'Aumentar' }));
    expect(within(card).getByRole('group')).toHaveTextContent('11');
    await user.click(within(card).getByRole('button', { name: 'Diminuir' }));
    await user.click(within(card).getByRole('button', { name: 'Diminuir' }));
    expect(within(card).queryByText('Na sacola')).toBeNull();
    expect(screen.queryByRole('button', { name: /Ver sacola/ })).toBeNull();
  });

  it('o botão "Ver sacola" substitui o WhatsApp flutuante e volta quando esvazia', async () => {
    const user = userEvent.setup();
    await renderPage();
    // o WhatsApp flutuante entra depois de 1,5 s (fica escondido até lá)
    const whats = () => document.querySelectorAll('a[aria-label^="Falar com a Turma"]');
    expect(whats()).toHaveLength(1);
    await user.click(addButton('Massinha natural'));
    expect(whats()).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Ver sacola, 1 produto' })).toBeInTheDocument();
    await user.click(addButton('Kit tintas naturais'));
    expect(screen.getByRole('button', { name: 'Ver sacola, 2 produtos' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Ver sacola/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Sua sacola' });
    for (const remove of within(dialog).getAllByRole('button', { name: /Remover/ }))
      await user.click(remove);
    await user.click(within(dialog).getByRole('link', { name: 'Ver produtos' }));
    expect(whats()).toHaveLength(1);
  });

  it('a gaveta é um diálogo modal: Esc fecha e o foco volta ao botão', async () => {
    const user = userEvent.setup();
    await renderPage();
    await user.click(addButton('Massinha natural'));
    const fab = screen.getByRole('button', { name: /Ver sacola/ });
    await user.click(fab);
    const dialog = await screen.findByRole('dialog', { name: 'Sua sacola' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(fab).toHaveFocus();
  });

  it('sobrevive a recarregar: a lista volta do localStorage', async () => {
    const user = userEvent.setup();
    const first = await renderPage();
    await user.click(addButton('Kit mini horta'));
    expect(window.localStorage.getItem(BAG_STORAGE_KEY)).toContain('Kit mini horta');
    first.unmount();
    resetBagStore(); // como uma página nova: o estado em memória some, o storage fica
    await renderPage();
    expect(
      await screen.findByRole('button', { name: 'Ver sacola, 1 produto' }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('article', { name: 'Kit mini horta' })).getByText('Na sacola'),
    ).toBeInTheDocument();
  });

  it('enviar: abre o wa.me com a mensagem, esvazia e oferece desfazer', async () => {
    const user = userEvent.setup();
    await renderPage();
    await user.click(addButton('Kit mini horta'));
    await user.click(
      within(screen.getByRole('article', { name: 'Kit mini horta' })).getByRole('button', {
        name: 'Aumentar',
      }),
    );
    await user.click(addButton('Massinha natural'));
    await user.click(screen.getByRole('button', { name: /Ver sacola/ }));

    const dialog = await screen.findByRole('dialog', { name: 'Sua sacola' });
    await user.type(within(dialog).getByLabelText('Seu nome'), 'Mariana');
    await user.type(within(dialog).getByLabelText(/Personalização e observações/), 'Tema floresta');
    await user.click(within(dialog).getByRole('button', { name: 'Enviar pedido no WhatsApp' }));

    const url = new URL(tab.location.href);
    expect(url.origin + url.pathname).toBe(`https://wa.me/${PHONE}`);
    expect(url.searchParams.get('text')).toBe(
      [
        START,
        '',
        '• 11 × Kit mini horta',
        '• 1 × Massinha natural',
        '',
        'Nome: Mariana',
        'Observações: Tema floresta',
      ].join('\n'),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(window.localStorage.getItem(BAG_STORAGE_KEY)).toBeNull();
    expect(screen.getByText('Pedido enviado.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Desfazer' }));
    expect(screen.getByRole('button', { name: 'Ver sacola, 2 produtos' })).toBeInTheDocument();
  });

  it('sacola vazia: o botão de enviar fica desabilitado', async () => {
    const user = userEvent.setup();
    await renderPage();
    await user.click(addButton('Massinha natural'));
    await user.click(screen.getByRole('button', { name: /Ver sacola/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Sua sacola' });
    await user.click(within(dialog).getByRole('button', { name: /Remover/ }));
    expect(within(dialog).getByText('Sua sacola está vazia')).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: 'Enviar pedido no WhatsApp' }),
    ).toBeDisabled();
    await act(async () => undefined);
  });
});

describe('produto esgotado e JSON-LD', () => {
  it('esgotado aparece com a etiqueta e sem botão de adicionar', async () => {
    const { ProductCard } = await import('@/components/molecules/ProductCard');
    const p = { ...fixtureProducts()[0]!, soldOut: true };
    renderWithProviders(<ProductCard product={p} />);
    expect(screen.getByText('Esgotado')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Adicionar/ })).toBeNull();
  });

  it('JSON-LD: ItemList/Product sem offers nem preço', () => {
    const ld = productsJsonLd(fixtureProducts());
    expect(ld['@type']).toBe('ItemList');
    expect(ld.itemListElement).toHaveLength(9);
    const text = JSON.stringify(ld);
    expect(text).not.toMatch(/offers|price|priceCurrency|"Offer"/i);
  });
});
