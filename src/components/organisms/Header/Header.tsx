'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from 'framer-motion';
import { NAV_ITEMS, type NavItem } from '@/lib/nav';
import { useScrollDirection } from '@/motion/useScrollDirection';
import { Logo } from '../../atoms/Logo';
import { WhatsAppButton } from '../../molecules/WhatsAppButton';
import { Burger, Cta, Indicator, Inner, List, Nav, NavLink, Root, Toggle } from './Header.styles';

export type { NavItem };

export interface HeaderProps {
  items?: NavItem[];
  /** href da página atual (aria-current); padrão: rota atual */
  current?: string;
  phone?: string;
  message?: string;
  defaultOpen?: boolean;
  /** desliga o comportamento de rolagem (encolher / esconder ao descer) */
  static?: boolean;
  /** força o estado "rolado" (documentação) */
  scrolled?: boolean;
  className?: string;
}

export function Header({
  items = NAV_ITEMS,
  current,
  phone,
  message,
  defaultOpen = false,
  static: isStatic = false,
  scrolled: forceScrolled = false,
  className,
}: HeaderProps) {
  const pathname = usePathname();
  const active = current ?? pathname ?? undefined;
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(defaultOpen);
  const [hovered, setHovered] = useState<string | null>(null);
  const { scrolled, hidden } = useScrollDirection(isStatic);
  const listId = useId();

  /* Indicador único: mede o link alvo (hover/foco ou página ativa) e se move por transform.
     Medidas recalculadas no resize do menu, no resize da janela e quando as fontes carregam. */
  const navRef = useRef<HTMLElement>(null);
  const links = useRef(new Map<string, HTMLAnchorElement>());
  const target = hovered ?? active;
  const [pos, setPos] = useState<{ x: number; w: number } | null>(null);
  const [phase, setPhase] = useState<'placed' | 'draw' | 'on'>('placed');

  const measure = useCallback(() => {
    const nav = navRef.current;
    const el = target ? links.current.get(target) : undefined;
    if (!nav || !el) {
      setPos(null);
      setPhase('placed');
      return;
    }
    const origin = nav.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const next = { x: rect.left - origin.left + pad, w: Math.max(rect.width - pad * 2, 0) };
    setPos((p) => (p && Math.abs(p.x - next.x) < 0.5 && Math.abs(p.w - next.w) < 0.5 ? p : next));
  }, [target]);

  useEffect(() => {
    const schedule = () => window.requestAnimationFrame(measure);
    const first = schedule();
    const ro = new ResizeObserver(schedule);
    if (navRef.current) ro.observe(navRef.current);
    window.addEventListener('resize', schedule);
    void document.fonts?.ready.then(schedule);
    return () => {
      window.cancelAnimationFrame(first);
      ro.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [measure]);

  /* primeira vez que o traço aparece: nasce com scaleX 0 e se desenha (dur-slow) */
  const placed = pos !== null && phase === 'placed';
  useEffect(() => {
    if (!placed) return;
    const id = window.requestAnimationFrame(() => setPhase('draw'));
    return () => window.cancelAnimationFrame(id);
  }, [placed]);

  return (
    <Root
      className={className}
      data-open={open}
      data-scrolled={scrolled || forceScrolled}
      data-hidden={hidden && !open && !reduce}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false);
      }}
    >
      <Inner>
        <Logo variant="compact" tone="auto" height={52} href="/" />
        <Nav aria-label="Principal" ref={navRef}>
          <List id={listId} onMouseLeave={() => setHovered(null)} onBlur={() => setHovered(null)}>
            {items.map((it, i) => {
              const isActive = it.href === active;
              return (
                <li key={it.href} style={{ ['--i' as string]: i }}>
                  <NavLink
                    href={it.href}
                    aria-current={isActive ? 'page' : undefined}
                    ref={(el) => {
                      if (el) links.current.set(it.href, el);
                      else links.current.delete(it.href);
                    }}
                    onMouseEnter={() => setHovered(it.href)}
                    onFocus={() => setHovered(it.href)}
                    onClick={() => setOpen(false)}
                  >
                    {it.label}
                  </NavLink>
                </li>
              );
            })}
          </List>
          <Indicator
            aria-hidden
            data-phase={pos ? phase : 'off'}
            onTransitionEnd={() => setPhase((p) => (p === 'draw' ? 'on' : p))}
            style={{
              transform: pos
                ? `translateX(${pos.x}px) scaleX(${phase === 'placed' ? 0 : pos.w / 100})`
                : 'translateX(0) scaleX(0)',
            }}
          />
        </Nav>
        <Cta>
          <WhatsAppButton size="sm" phone={phone} message={message} placement="header">
            Orçamento
          </WhatsAppButton>
        </Cta>
        <Toggle
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen(!open)}
        >
          <Burger aria-hidden>
            <span />
            <span />
            <span />
          </Burger>
        </Toggle>
      </Inner>
    </Root>
  );
}
