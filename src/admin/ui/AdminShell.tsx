'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import styled from 'styled-components';
import { Icon } from '@/components/atoms/Icon';
import { Logo } from '@/components/atoms/Logo';
import { media } from '@/design-system/media';
import type { AdminIconName, IconName } from '@/lib/iconNames';
import { can, ROLE_LABEL, type Permission, type Role } from '@/lib/permissions';
import { logoutAction } from '@/app/admin/_actions/auth';
import { ToastProvider } from './Toast';

interface NavItem {
  href: string;
  label: string;
  icon: IconName | AdminIconName;
  permission?: Permission;
  /** em breve (parte 5B): aparece desabilitado */
  soon?: boolean;
  countKey?: 'restaurants' | 'activities' | 'themes' | 'products' | 'team' | 'photos';
}

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Site',
    items: [
      { href: '/admin', label: 'Painel', icon: 'home' },
      {
        href: '/admin/editor',
        label: 'Editor visual',
        icon: 'edit',
        permission: 'site',
      },
      {
        href: '/admin/fotos',
        label: 'Fotos',
        icon: 'image',
        permission: 'photos',
        countKey: 'photos',
      },
    ],
  },
  {
    title: 'Conteúdo',
    items: [
      {
        href: '/admin/restaurantes',
        label: 'Restaurantes',
        icon: 'utensils',
        permission: 'restaurants',
        countKey: 'restaurants',
      },
      {
        href: '/admin/atividades',
        label: 'Atividades das Oficinas',
        icon: 'scissors',
        permission: 'activities',
        countKey: 'activities',
      },
      {
        href: '/admin/temas',
        label: 'Temas de festa',
        icon: 'star',
        permission: 'activities',
        countKey: 'themes',
      },
      {
        href: '/admin/produtos',
        label: 'Produtos',
        icon: 'backpack',
        permission: 'activities',
        countKey: 'products',
      },
      {
        href: '/admin/equipe',
        label: 'Equipe',
        icon: 'users',
        permission: 'team',
        countKey: 'team',
      },
    ],
  },
  {
    title: 'Administração',
    items: [
      { href: '/admin/usuarios', label: 'Usuários', icon: 'lock', permission: 'users' },
      {
        href: '/admin/contato',
        label: 'Contato e WhatsApp',
        icon: 'whatsapp',
        permission: 'contact',
      },
    ],
  },
];

export interface ShellUser {
  name: string;
  role: Role;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export function AdminShell({
  user,
  initialTheme,
  counts,
  children,
}: {
  user: ShellUser;
  initialTheme: 'dia' | 'noite';
  counts?: Partial<
    Record<'restaurants' | 'activities' | 'themes' | 'products' | 'team' | 'photos', number>
  >;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [theme, setTheme] = useState(initialTheme);

  const toggleTheme = () => {
    const next = theme === 'dia' ? 'noite' : 'dia';
    setTheme(next);
    document.cookie = `tda-theme=${next}; path=/; max-age=31536000; samesite=lax`;
  };

  // a página inteira (inclusive portais: diálogos e avisos) segue o tema escolhido
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const isActive = (href: string) =>
    href === '/admin'
      ? pathname === '/admin'
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <ToastProvider>
      <Frame data-theme={theme}>
        <Side>
          <SideLogo>
            <Logo variant="compact" tone="white" height={40} href="/admin" />
            <Tag>Painel</Tag>
          </SideLogo>
          <nav aria-label="Painel">
            <Nav>
              {GROUPS.map((g) => {
                const items = g.items.filter((i) => !i.permission || can(user.role, i.permission));
                if (!items.length) return null;
                return (
                  <li key={g.title}>
                    <Group>{g.title}</Group>
                    <ul>
                      {items.map((i) => {
                        const n = i.countKey ? counts?.[i.countKey] : undefined;
                        return (
                          <li key={i.href}>
                            {i.soon ? (
                              <Soon aria-disabled="true" title="Chega na próxima parte">
                                <Icon name={i.icon} size={20} />
                                {i.label}
                                <small>em breve</small>
                              </Soon>
                            ) : (
                              <NavLink
                                href={i.href}
                                aria-current={isActive(i.href) ? 'page' : undefined}
                              >
                                <Icon name={i.icon} size={20} />
                                {i.label}
                                {n !== undefined ? <Count>{n}</Count> : null}
                              </NavLink>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </Nav>
          </nav>
          <User>
            <Avatar aria-hidden>{initials(user.name)}</Avatar>
            <Who>
              <p>{user.name}</p>
              <small>{ROLE_LABEL[user.role]}</small>
            </Who>
            <Foot>
              <ThemeButton
                type="button"
                onClick={toggleTheme}
                aria-pressed={theme === 'noite'}
                aria-label={theme === 'noite' ? 'Usar o tema Dia' : 'Usar o tema Noite'}
                title={
                  theme === 'noite'
                    ? 'Tema Noite (trocar para Dia)'
                    : 'Tema Dia (trocar para Noite)'
                }
              >
                <Icon name={theme === 'noite' ? 'moon' : 'sun'} size={20} />
              </ThemeButton>
              <form action={logoutAction}>
                <Out type="submit">
                  <Icon name="logout" size={18} />
                  Sair
                </Out>
              </form>
            </Foot>
          </User>
        </Side>
        <Main id="conteudo">{children}</Main>
      </Frame>
    </ToastProvider>
  );
}

const Frame = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  min-height: 100vh;
  background: var(--surface-sunken);
  color: var(--ink);
  font-family: var(--font-body);

  ${media.down('bp-lg')} {
    flex-direction: column;
    flex-wrap: nowrap;
  }
`;
const Side = styled.aside`
  flex: 0 0 248px;
  position: sticky;
  top: 0;
  align-self: flex-start;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-5) var(--space-4);
  background: var(--surface-forest);
  color: var(--ink-on-forest);
  overflow-y: auto;

  ${media.down('bp-lg')} {
    position: static;
    height: auto;
    flex: none;
    flex-direction: row;
    align-items: center;
    overflow-x: auto;
    padding: var(--space-2) var(--space-4);
    gap: var(--space-3);
  }
`;
const SideLogo = styled.div`
  padding: var(--space-2) var(--space-2) var(--space-4);
  border-bottom: 1px solid color-mix(in srgb, var(--caqui-200) 20%, transparent);
  ${media.down('bp-lg')} {
    border: 0;
    padding: 0;
    flex: none;
  }
`;
const Tag = styled.p`
  margin: var(--space-2) 0 0;
  font: 800 12px/16px var(--font-body);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--caqui-200);
  ${media.down('bp-lg')} {
    display: none;
  }
`;
const Nav = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  ${media.down('bp-lg')} {
    flex-direction: row;
    ul {
      flex-direction: row;
    }
  }
`;
const Group = styled.p`
  margin: var(--space-3) 0 var(--space-1) var(--space-3);
  font: 800 12px/16px var(--font-body);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-on-forest-muted);
  ${media.down('bp-lg')} {
    display: none;
  }
`;
const linkCss = `
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: var(--tap-min);
  padding: 0 var(--space-3);
  border-radius: var(--radius-sm);
  color: var(--ink-on-forest);
  text-decoration: none;
  font: 700 15px/20px var(--font-body);
  white-space: nowrap;
`;
const NavLink = styled(Link)`
  ${linkCss}
  &:hover {
    background: color-mix(in srgb, var(--branco) 8%, transparent);
  }
  &:focus-visible {
    outline: 3px solid var(--focus-on-forest);
    outline-offset: 2px;
  }
  &[aria-current='page'] {
    background: var(--ink-on-forest);
    color: var(--surface-forest);
  }
`;
const Soon = styled.span`
  ${linkCss}
  opacity: 0.55;
  cursor: not-allowed;
  small {
    margin-left: auto;
    font: 700 11px/14px var(--font-body);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
`;
const Count = styled.span`
  margin-left: auto;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  background: var(--caqui-200);
  color: var(--mata-900);
  font: 800 12px/16px var(--font-body);
`;
const User = styled.div`
  margin-top: auto;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-2) 0;
  border-top: 1px solid color-mix(in srgb, var(--caqui-200) 20%, transparent);
  ${media.down('bp-lg')} {
    margin: 0 0 0 auto;
    border: 0;
    padding: 0;
    flex: none;
    flex-wrap: nowrap;
  }
`;
const Avatar = styled.span`
  flex: none;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--caqui-200);
  color: var(--mata-900);
  font: 800 15px/1 var(--font-body);
`;
const Who = styled.div`
  min-width: 0;
  flex: 1;
  p {
    margin: 0;
    font: 800 14px/18px var(--font-body);
    color: var(--ink-on-forest);
    overflow-wrap: anywhere;
  }
  small {
    font: 600 13px/18px var(--font-body);
    color: var(--ink-on-forest-muted);
  }
  ${media.down('bp-lg')} {
    display: none;
  }
`;
const Foot = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-1);
  width: 100%;
  ${media.down('bp-lg')} {
    width: auto;
  }
`;
const ThemeButton = styled.button`
  display: grid;
  place-items: center;
  width: var(--tap-min);
  height: var(--tap-min);
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--ink-on-forest);
  cursor: pointer;
  &:hover {
    background: color-mix(in srgb, var(--branco) 8%, transparent);
  }
  &:focus-visible {
    outline: 3px solid var(--focus-on-forest);
    outline-offset: 2px;
  }
`;
const Out = styled.button`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--tap-min);
  padding: 0 var(--space-2);
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--ink-on-forest);
  font: 700 14px/18px var(--font-body);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  &:focus-visible {
    outline: 3px solid var(--focus-on-forest);
    outline-offset: 2px;
  }
`;
const Main = styled.main`
  flex: 999 1 560px;
  min-width: 0;
  padding: var(--space-6) var(--space-7) var(--space-7);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);

  ${media.down('bp-lg')} {
    padding: var(--space-5) var(--space-4);
  }
`;
