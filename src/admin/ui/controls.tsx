'use client';

import Link from 'next/link';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button, type ButtonProps } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import type { AdminIconName, IconName } from '@/lib/iconNames';

/* ---------- Botão de ícone (alvo ≥ 44px) ---------- */
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName | AdminIconName;
  /** obrigatório: botão só com ícone precisa de nome acessível */
  label: string;
  tone?: 'default' | 'danger' | 'line';
}
export function IconButton({ icon, label, tone = 'default', ...rest }: IconButtonProps) {
  return (
    <IBtn type="button" aria-label={label} title={label} $tone={tone} {...rest}>
      <Icon name={icon} size={20} />
    </IBtn>
  );
}
export const IconLink = ({
  icon,
  label,
  href,
  tone = 'default',
  external,
}: {
  icon: IconName | AdminIconName;
  label: string;
  href: string;
  tone?: 'default' | 'danger' | 'line';
  external?: boolean;
}) => (
  <IBtn
    as={Link}
    href={href}
    aria-label={label}
    title={label}
    $tone={tone}
    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
  >
    <Icon name={icon} size={20} />
  </IBtn>
);
const IBtn = styled.button<{ $tone: 'default' | 'danger' | 'line' }>`
  display: inline-grid;
  place-items: center;
  width: var(--tap-min);
  height: var(--tap-min);
  border: ${({ $tone }) => ($tone === 'line' ? 'var(--border-thick) solid var(--line-strong)' : '0')};
  border-radius: var(--radius-sm);
  background: ${({ $tone }) => ($tone === 'line' ? 'var(--surface-raised)' : 'transparent')};
  color: ${({ $tone }) => ($tone === 'danger' ? 'var(--danger)' : 'var(--ink-muted)')};
  cursor: pointer;
  text-decoration: none;

  &:hover:not(:disabled) {
    background: ${({ $tone }) => ($tone === 'danger' ? 'var(--danger-soft)' : 'var(--brand-soft)')};
    color: ${({ $tone }) => ($tone === 'danger' ? 'var(--danger)' : 'var(--brand)')};
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

/* ---------- Situação: sempre ícone + palavra ---------- */
type Status =
  'PUBLICADO' | 'RASCUNHO' | 'PAUSADO' | 'ESGOTADO' | 'ATIVO' | 'DESATIVADO' | 'BLOQUEADO';
const STATUS: Record<
  Status,
  { label: string; icon: IconName | AdminIconName; tone: 'ok' | 'warn' | 'earth' | 'off' }
> = {
  PUBLICADO: { label: 'No site', icon: 'check', tone: 'ok' },
  RASCUNHO: { label: 'Rascunho', icon: 'edit', tone: 'warn' },
  PAUSADO: { label: 'Pausado', icon: 'pause', tone: 'earth' },
  ESGOTADO: { label: 'Esgotado', icon: 'flag', tone: 'earth' },
  ATIVO: { label: 'Ativo', icon: 'check', tone: 'ok' },
  DESATIVADO: { label: 'Desativado', icon: 'close', tone: 'off' },
  BLOQUEADO: { label: 'Bloqueado', icon: 'lock', tone: 'warn' },
};
export function StatusBadge({ status }: { status: Status }) {
  const s = STATUS[status];
  return (
    <Badge $tone={s.tone}>
      <Icon name={s.icon} size={14} />
      {s.label}
    </Badge>
  );
}
const Badge = styled.span<{ $tone: 'ok' | 'warn' | 'earth' | 'off' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  font: 700 13px/18px var(--font-body);
  white-space: nowrap;
  ${({ $tone }) =>
    $tone === 'ok'
      ? 'background: var(--brand-soft); color: var(--brand);'
      : $tone === 'warn'
        ? 'background: var(--warning-soft); color: var(--warning);'
        : $tone === 'earth'
          ? 'background: var(--earth-soft); color: var(--earth-strong);'
          : 'background: var(--surface-sunken); color: var(--ink-muted); box-shadow: inset 0 0 0 1px var(--line);'}
`;

/* ---------- Abas (links: o estado vive na URL) ---------- */
export interface TabItem {
  href: string;
  label: string;
  count?: number;
  active: boolean;
}
export function Tabs({ items, label }: { items: TabItem[]; label: string }) {
  return (
    <TabBar aria-label={label}>
      {items.map((t) => (
        <Tab key={t.href} href={t.href} aria-current={t.active ? 'page' : undefined}>
          {t.label}
          {t.count !== undefined ? <TabCount>{t.count}</TabCount> : null}
        </Tab>
      ))}
    </TabBar>
  );
}
const TabBar = styled.nav`
  display: flex;
  gap: var(--space-1);
  border-bottom: var(--border-thin) solid var(--line);
  flex-wrap: wrap;
`;
const TabCount = styled.span`
  padding: 1px 8px;
  border-radius: var(--radius-pill);
  background: var(--surface-sunken);
  color: var(--ink-muted);
  font: 800 12px/16px var(--font-body);
`;
const Tab = styled(Link)`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--tap-min);
  padding: 0 var(--space-4);
  font: 700 15px/20px var(--font-body);
  color: var(--ink-muted);
  text-decoration: none;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;

  &:hover {
    color: var(--brand);
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: -3px;
  }
  &[aria-current='page'] {
    color: var(--brand);
  }
  &[aria-current='page']::after {
    content: '';
    position: absolute;
    left: var(--space-3);
    right: var(--space-3);
    bottom: -2px;
    height: 3px;
    border-radius: 2px;
    background: repeating-linear-gradient(90deg, var(--brand) 0 6px, transparent 6px 10px);
  }
`;

/* ---------- Alertas (ícone + texto, nunca só cor) ---------- */
export function Alert({
  tone = 'info',
  title,
  children,
  action,
  role,
}: {
  tone?: 'ok' | 'warn' | 'err' | 'info';
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  role?: 'alert' | 'status';
}) {
  const icon: IconName | AdminIconName =
    tone === 'ok' ? 'check' : tone === 'info' ? 'flag' : 'alert';
  return (
    <AlertBox $tone={tone} role={role ?? (tone === 'err' ? 'alert' : undefined)}>
      <Icon name={icon} size={20} />
      <div>
        {title ? <strong>{title}</strong> : null}
        {children ? <p>{children}</p> : null}
      </div>
      {action ? <span>{action}</span> : null}
    </AlertBox>
  );
}
const AlertBox = styled.div<{ $tone: 'ok' | 'warn' | 'err' | 'info' }>`
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  font: 600 15px/22px var(--font-body);
  ${({ $tone }) =>
    $tone === 'ok'
      ? 'background: var(--brand-soft); color: var(--brand);'
      : $tone === 'warn'
        ? 'background: var(--warning-soft); color: var(--warning);'
        : $tone === 'err'
          ? 'background: var(--danger-soft); color: var(--danger);'
          : 'background: var(--surface-sunken); color: var(--ink-muted);'}

  svg {
    flex: none;
    margin-top: 1px;
  }
  & > div {
    flex: 1;
    color: var(--ink);
  }
  strong {
    font-weight: 800;
    display: block;
  }
  p {
    margin: 2px 0 0;
    font-weight: 400;
    color: var(--ink-muted);
  }
  & > span {
    margin-left: auto;
  }
`;

/* ---------- Interruptor ---------- */
export function Switch({
  checked,
  onChange,
  label,
  name,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  name?: string;
}) {
  return (
    <SwitchLabel>
      <input
        type="checkbox"
        role="switch"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="track" aria-hidden />
      {label}
    </SwitchLabel>
  );
}
const SwitchLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  min-height: var(--tap-min);
  font: 700 15px/20px var(--font-body);
  color: var(--ink);
  cursor: pointer;
  position: relative;

  input {
    position: absolute;
    opacity: 0;
    width: 44px;
    height: 26px;
    margin: 0;
    cursor: pointer;
  }
  .track {
    position: relative;
    width: 44px;
    height: 26px;
    border-radius: var(--radius-pill);
    background: var(--line-strong);
    flex: none;
    transition: background-color var(--dur-fast) var(--ease-standard);
  }
  .track::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--surface-raised);
    transition: transform var(--dur-fast) var(--ease-stamp);
  }
  input:checked + .track {
    background: var(--brand);
  }
  input:checked + .track::after {
    transform: translateX(18px);
  }
  input:focus-visible + .track {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }
  @media (prefers-reduced-motion: reduce) {
    .track,
    .track::after {
      transition: none;
    }
  }
`;

/* ---------- Carregando: blocos de espera (nunca spinner) ---------- */
const pulse = keyframes`
  0%, 100% { opacity: 0.55; }
  50% { opacity: 0.9; }
`;
export const Sk = styled.div<{ $h?: string; $w?: string }>`
  height: ${({ $h }) => $h ?? '16px'};
  width: ${({ $w }) => $w ?? '100%'};
  border-radius: var(--radius-sm);
  background: var(--areia-200);
  animation: ${pulse} 1.4s var(--ease-standard) infinite;
  [data-theme='noite'] & {
    background: var(--noite-700);
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.7;
  }
`;

/* ---------- Botão de ação destrutiva (ferrugem): excluir ---------- */
export function DangerButton({ style, ...rest }: ButtonProps) {
  const vars = {
    '--_bg': 'var(--danger)',
    '--_fg': 'var(--on-earth)',
    '--_bg-h': 'var(--danger)',
    '--_sh': 'var(--shadow-stamp-earth)',
    ...style,
  } as CSSProperties;
  return <Button variant="earth" style={vars} {...rest} />;
}
