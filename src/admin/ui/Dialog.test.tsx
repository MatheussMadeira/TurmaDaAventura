import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from './Dialog';

function Harness({ alert = false, onClose }: { alert?: boolean; onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <main data-testid="page">
        <button onClick={() => setOpen(true)}>Abrir</button>
      </main>
      <Dialog
        open={open}
        alert={alert}
        title="Excluir restaurante?"
        onClose={() => {
          onClose?.();
          setOpen(false);
        }}
        footer={<button>Cancelar</button>}
      >
        <input aria-label="Motivo" />
      </Dialog>
    </>
  );
}

describe('Dialog', () => {
  it('abre com o foco no primeiro campo e deixa o resto da página inerte', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));

    expect(screen.getByRole('dialog', { name: 'Excluir restaurante?' })).toBeInTheDocument();
    expect(screen.getByLabelText('Motivo')).toHaveFocus();
    expect(screen.getByTestId('page').closest('[inert]')).not.toBeNull();
  });

  it('Esc fecha, devolve o foco a quem abriu e tira o inert', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    const opener = screen.getByRole('button', { name: 'Abrir' });
    await user.click(opener);
    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(screen.getByTestId('page').closest('[inert]')).toBeNull();
  });

  it('confirmação destrutiva usa alertdialog', async () => {
    const user = userEvent.setup();
    render(<Harness alert />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    expect(screen.getByRole('alertdialog', { name: 'Excluir restaurante?' })).toBeInTheDocument();
  });

  it('o Tab não deixa o foco sair do diálogo', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    const dialog = screen.getByRole('dialog');
    for (let i = 0; i < 6; i++) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
    for (let i = 0; i < 6; i++) {
      await user.tab({ shift: true });
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
  });
});
