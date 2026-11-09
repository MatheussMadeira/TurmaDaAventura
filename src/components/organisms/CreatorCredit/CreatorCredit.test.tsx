import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '@/test/a11y';
import { renderWithProviders } from '@/test/render';
import { CreatorCredit } from './CreatorCredit';

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

afterEach(() => {
  vi.restoreAllMocks();
});

const trigger = () => screen.getByRole('button', { name: /Trilha aberta por Matheus Madeira/ });

describe('CreatorCredit', () => {
  it('mostra o gatilho com o nome e o diálogo fechado', () => {
    renderWithProviders(<CreatorCredit />);
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).toHaveAttribute('aria-haspopup', 'dialog');
    expect(document.querySelector('dialog')).not.toHaveAttribute('open');
  });

  it('abre a ficha, nomeia o diálogo e acompanha aria-expanded; fechar devolve o foco', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreatorCredit />);
    await user.click(trigger());

    const dialog = document.querySelector('dialog')!;
    expect(dialog).toHaveAttribute('open');
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    const title = within(dialog).getByRole('heading', { level: 2, name: 'Matheus Madeira' });
    expect(dialog).toHaveAttribute('aria-labelledby', title.id);

    await user.click(within(dialog).getByRole('button', { name: 'Fechar', hidden: true }));
    expect(dialog).not.toHaveAttribute('open');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).toHaveFocus();
  });

  it('clicar fora (no fundo do diálogo) fecha', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreatorCredit />);
    await user.click(trigger());
    const dialog = document.querySelector('dialog')!;
    await user.click(dialog);
    expect(dialog).not.toHaveAttribute('open');
  });

  it('links externos seguros para LinkedIn e GitHub, com analytics', async () => {
    const user = userEvent.setup();
    const push = vi.fn();
    (window as unknown as { dataLayer: unknown[] }).dataLayer = { push } as unknown as unknown[];
    renderWithProviders(<CreatorCredit />);
    await user.click(trigger());

    const dialog = document.querySelector('dialog')!;
    const linkedin = within(dialog).getByRole('link', { name: 'Ver LinkedIn', hidden: true });
    const github = within(dialog).getByRole('link', { name: 'Ver GitHub', hidden: true });
    expect(linkedin).toHaveAttribute('href', 'https://www.linkedin.com/in/matheus-madeira22/');
    expect(github).toHaveAttribute('href', 'https://github.com/MatheussMadeira');
    for (const a of [linkedin, github]) {
      expect(a).toHaveAttribute('target', '_blank');
      expect(a).toHaveAttribute('rel', expect.stringContaining('noopener'));
    }
    expect(push).toHaveBeenCalledWith({ event: 'creator_credit_open' });

    linkedin.addEventListener('click', (e) => e.preventDefault());
    github.addEventListener('click', (e) => e.preventDefault());
    await user.click(linkedin);
    await user.click(github);
    expect(push).toHaveBeenCalledWith({ event: 'creator_credit_click', network: 'linkedin' });
    expect(push).toHaveBeenCalledWith({ event: 'creator_credit_click', network: 'github' });
    delete (window as unknown as { dataLayer?: unknown }).dataLayer;
  });

  it('não tem violações de acessibilidade (axe), nem com o diálogo aberto', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<CreatorCredit />);
    await expectNoA11yViolations(container);
    await user.click(trigger());
    await expectNoA11yViolations(container);
  });
});
