'use client';

import { useId, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from 'framer-motion';
import { NAV_ITEMS, type NavItem } from '@/lib/nav';
import { dur, ease } from '@/motion/tokens';
import { useScrollDirection } from '@/motion/useScrollDirection';
import { Logo } from '../../atoms/Logo';
import { WhatsAppButton } from '../../molecules/WhatsAppButton';
import { Burger, Cta, Inner, List, Nav, NavLink, Root, Toggle, Underline } from './Header.styles';

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

  /* O sublinhado só "se desenha" enquanto não houve hover/foco; depois apenas desliza (layoutId). */
  const [interacted, setInteracted] = useState(false);
  const point = (href: string) => {
    setInteracted(true);
    setHovered(href);
  };

  const underlineAt = hovered ?? active;

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
        <Nav aria-label="Principal">
          <List id={listId} onMouseLeave={() => setHovered(null)} onBlur={() => setHovered(null)}>
            {items.map((it, i) => {
              const isActive = it.href === active;
              return (
                <li key={it.href} style={{ ['--i' as string]: i }}>
                  <NavLink
                    href={it.href}
                    aria-current={isActive ? 'page' : undefined}
                    onMouseEnter={() => point(it.href)}
                    onFocus={() => point(it.href)}
                    onClick={() => setOpen(false)}
                  >
                    {it.label}
                    {underlineAt === it.href ? (
                      <Underline
                        layoutId="nav-underline"
                        initial={interacted ? false : { scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          duration: dur.slow,
                          ease: ease.enter,
                          layout: { duration: dur.medium, ease: ease.enter },
                        }}
                        aria-hidden
                      />
                    ) : null}
                  </NavLink>
                </li>
              );
            })}
          </List>
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
