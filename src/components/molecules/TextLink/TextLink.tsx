'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Icon } from '../../atoms/Icon';

export interface TextLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

const StyledLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  min-height: var(--tap-min);
  font: 800 16px/20px var(--font-body);
  color: var(--brand);
  text-decoration: none;
  border-radius: var(--radius-sm);

  svg {
    transition: transform var(--dur-fast) var(--ease-enter);
  }
  &:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  &:hover svg {
    transform: translateX(var(--move-xs));
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    &:hover svg {
      transform: none;
    }
  }
`;

/** Link de texto com seta ("Ver todos os restaurantes"). */
export function TextLink({ href, children, className }: TextLinkProps) {
  return (
    <StyledLink href={href} className={className}>
      {children}
      <Icon name="arrow-right" size={18} />
    </StyledLink>
  );
}
