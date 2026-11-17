import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { SiteSettingsProvider } from '@/components/SiteSettings';
import type { PartyTheme } from '@/content/types';
import { expectNoA11yViolations } from '@/test/a11y';
import { renderWithProviders } from '@/test/render';
import { ThemeCatalog, detailParagraphs } from './ThemeCatalog';

/* O jsdom ainda não implementa showModal/close do <dialog>: simulamos o essencial. */
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

afterEach(() => vi.restoreAllMocks());

const theme = (over: Partial<PartyTheme>): PartyTheme => ({
  slug: 'safari',
  icon: 'tree',
  title: 'Safári na selva',
  description: 'Uma expedição para a criançada.',
  tags: ['4 a 10 anos'],
  details: '',
  image: null,
  imageAlt: '',
  ...over,
});

const themes = [
  theme({
    details:
      'Primeiro parágrafo da festa.\n\nSegundo parágrafo, com mais detalhes.\n\n\n  \nTerceiro.',
  }),
  theme({ slug: 'astronauta', title: 'Astronauta', details: '' }),
];

const renderCatalog = () =>
  renderWithProviders(
    <SiteSettingsProvider value={{ phone: '5531999999999', messages: {} }}>
      <ThemeCatalog themes={themes} />
    </SiteSettingsProvider>,
  );

describe('ThemeCatalog', () => {
  it('só o card com detalhes tem o botão "Ver detalhes"', () => {
    renderCatalog();
    expect(screen.getAllByRole('button', { name: /Ver detalhes/ })).toHaveLength(1);
    expect(screen.getByRole('button', { name: /Ver detalhes.*Safári na selva/ })).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
    expect(document.querySelector('dialog')).not.toHaveAttribute('open');
  });

  it('abre o modal com título, etiquetas e os parágrafos; Fechar devolve o foco ao botão', async () => {
    const user = userEvent.setup();
    renderCatalog();
    const trigger = screen.getByRole('button', { name: /Ver detalhes/ });
    await user.click(trigger);

    const dialog = document.querySelector('dialog')!;
    expect(dialog).toHaveAttribute('open');
    const title = within(dialog).getByRole('heading', { level: 2, name: 'Safári na selva' });
    expect(dialog).toHaveAttribute('aria-labelledby', title.id);
    expect(within(dialog).getByText('4 a 10 anos')).toBeInTheDocument();
    expect(within(dialog).getByText('Primeiro parágrafo da festa.')).toBeInTheDocument();
    expect(within(dialog).getByText('Segundo parágrafo, com mais detalhes.')).toBeInTheDocument();
    expect(within(dialog).getByText('Terceiro.')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Fechar', hidden: true }));
    expect(dialog).not.toHaveAttribute('open');
    expect(trigger).toHaveFocus();
  });

  it('clicar fora fecha', async () => {
    const user = userEvent.setup();
    renderCatalog();
    await user.click(screen.getByRole('button', { name: /Ver detalhes/ }));
    const dialog = document.querySelector('dialog')!;
    await user.click(dialog);
    expect(dialog).not.toHaveAttribute('open');
  });

  it('o WhatsApp do modal já leva o nome do tema', async () => {
    const user = userEvent.setup();
    renderCatalog();
    await user.click(screen.getByRole('button', { name: /Ver detalhes/ }));
    const link = within(document.querySelector('dialog')!).getByRole('link', {
      name: 'Pedir orçamento deste tema',
      hidden: true,
    });
    const url = new URL(link.getAttribute('href')!);
    expect(url.origin + url.pathname).toBe('https://wa.me/5531999999999');
    expect(url.searchParams.get('text')).toBe(
      'Olá! Quero um orçamento de festa com o tema “Safári na selva”.',
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('não tem violações de acessibilidade (axe), nem com o modal aberto', async () => {
    const user = userEvent.setup();
    const { container } = renderCatalog();
    await expectNoA11yViolations(container);
    await user.click(screen.getByRole('button', { name: /Ver detalhes/ }));
    await expectNoA11yViolations(container);
  });
});

describe('detailParagraphs', () => {
  it('separa por linha em branco e descarta o que sobra', () => {
    expect(detailParagraphs('a\n\n b \n\n\n\nc')).toEqual(['a', 'b', 'c']);
    expect(detailParagraphs('  \n ')).toEqual([]);
    expect(detailParagraphs('linha 1\nlinha 2')).toEqual(['linha 1\nlinha 2']);
  });
});
