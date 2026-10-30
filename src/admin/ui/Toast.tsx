'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import { Icon } from '@/components/atoms/Icon';

interface ToastData {
  id: number;
  message: string;
  link?: { href: string; label: string };
  /** ação (ex.: Desfazer) */
  action?: { label: string; onClick: () => void };
}

interface ToastApi {
  show: (t: Omit<ToastData, 'id'>) => void;
}

const Ctx = createContext<ToastApi>({ show: () => undefined });
export const useToast = () => useContext(Ctx);

const TTL = 6000;

/** Confirmação discreta, sem sair da página. Aviso aria-live; some sozinho (ou ao clicar numa ação). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const seq = useRef(0);

  const show = useCallback((t: Omit<ToastData, 'id'>) => {
    seq.current += 1;
    setToast({ ...t, id: seq.current });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), TTL);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <Region role="status" aria-live="polite">
        {toast ? (
          <Bubble key={toast.id}>
            <span className="icon" aria-hidden>
              <Icon name="check" size={18} />
            </span>
            <span>{toast.message}</span>
            {toast.link ? <Link href={toast.link.href}>{toast.link.label}</Link> : null}
            {toast.action ? (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  setToast(null);
                }}
              >
                {toast.action.label}
              </button>
            ) : null}
          </Bubble>
        ) : null}
      </Region>
    </Ctx.Provider>
  );
}

const rise = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
`;
const Region = styled.div`
  position: fixed;
  left: 50%;
  bottom: var(--space-5);
  transform: translateX(-50%);
  z-index: var(--z-float);
  max-width: calc(100vw - 2 * var(--space-4));
`;
const Bubble = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4) var(--space-3) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--surface-forest);
  color: var(--ink-on-forest);
  box-shadow: var(--shadow-md);
  font: 700 15px/20px var(--font-body);
  animation: ${rise} var(--dur-medium) var(--ease-enter) both;

  .icon {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--caqui-200);
    color: var(--mata-900);
    flex: none;
  }
  a,
  button {
    color: var(--ink-on-forest);
    font: 800 15px/20px var(--font-body);
    background: none;
    border: 0;
    padding: 0 var(--space-1);
    min-height: var(--tap-min);
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
    border-radius: 6px;
  }
  a:focus-visible,
  button:focus-visible {
    outline: 3px solid var(--focus-on-forest);
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
