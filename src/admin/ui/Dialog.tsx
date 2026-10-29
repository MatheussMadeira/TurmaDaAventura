'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** botões do rodapé (o primeiro foco vai para o primeiro campo/botão do corpo) */
  footer?: ReactNode;
  wide?: boolean;
  /** fecha ao clicar no fundo (desligue em diálogos de ação destrutiva) */
  closeOnBackdrop?: boolean;
  /** role="alertdialog" para confirmações destrutivas */
  alert?: boolean;
}

/**
 * Diálogo modal acessível: Esc fecha, o foco fica preso dentro (Tab/Shift+Tab circulam),
 * o foco volta para quem abriu e o resto da página fica inerte para leitores de tela.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
  closeOnBackdrop = true,
  alert,
}: DialogProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const root = ref.current;
    if (!root) return;

    // foca o primeiro campo do corpo; senão o primeiro botão; senão o próprio diálogo
    const first =
      root.querySelector<HTMLElement>(`[data-dialog-body] ${FOCUSABLE}`) ??
      root.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? root).focus();

    // o conteúdo atrás do diálogo fica inerte (foco e leitor de tela)
    const siblings = [...document.body.children].filter(
      (el) => !el.contains(root) && el instanceof HTMLElement,
    ) as HTMLElement[];
    siblings.forEach((el) => el.setAttribute('inert', ''));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (!items.length) {
        e.preventDefault();
        return;
      }
      const firstEl = items[0]!;
      const lastEl = items[items.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey && (active === firstEl || active === root)) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && active === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);

    return () => {
      document.removeEventListener('keydown', onKey, true);
      siblings.forEach((el) => el.removeAttribute('inert'));
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <Overlay
      data-theme={document.documentElement.dataset.theme}
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      <Panel
        ref={ref}
        role={alert ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        $wide={wide}
      >
        <DialogTitle id={titleId}>{title}</DialogTitle>
        <div
          data-dialog-body
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
        >
          {children}
        </div>
        {footer ? <Foot>{footer}</Foot> : null}
      </Panel>
    </Overlay>,
    document.body,
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  display: grid;
  place-items: center;
  padding: var(--space-5);
  background: var(--scrim);
  overflow-y: auto;
  color: var(--ink);
  font-family: var(--font-body);
`;
const Panel = styled.div<{ $wide?: boolean }>`
  width: 100%;
  max-width: ${({ $wide }) => ($wide ? '1040px' : '560px')};
  max-height: calc(100vh - 2 * var(--space-5));
  overflow-y: auto;
  background: var(--surface-raised);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md), var(--shadow-stamp-card);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  &:focus {
    outline: none;
  }
`;
const DialogTitle = styled.h2`
  margin: 0;
  font: 700 26px/32px var(--font-display);
  color: var(--ink);
  font-variation-settings:
    'opsz' 36,
    'SOFT' 100;
`;
const Foot = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  flex-wrap: wrap;
  padding-top: var(--space-2);
`;
