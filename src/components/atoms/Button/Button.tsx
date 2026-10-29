'use client';

import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { Icon, type AnyIconName } from '../Icon';
import {
  StyledAnchor,
  StyledButton,
  StyledLink,
  type ButtonSize,
  type ButtonVariant,
} from './Button.styles';

export type { ButtonSize, ButtonVariant };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = verde (ação principal); earth = marrom (secundária forte); inverse/ghost-inverse só sobre surface-forest */
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: AnyIconName;
  iconRight?: AnyIconName;
  fullWidth?: boolean;
  /** Com href renderiza <a> (links internos usam next/link; externos: passe target/rel) */
  href?: string;
  target?: string;
  rel?: string;
  /** Força um estado visual para documentação (/_dev/componentes). */
  'data-state'?: 'hover' | 'focus' | 'pressed';
}

const ICON_SIZE = { sm: 16, md: 20, lg: 22 } as const;
const isExternal = (href: string) => /^(https?:|mailto:|tel:|#)/.test(href);

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth = false,
  href,
  children,
  ...rest
}: ButtonProps) {
  const style = { $variant: variant, $size: size, $full: fullWidth };
  const content = (
    <>
      {iconLeft ? <Icon name={iconLeft} size={ICON_SIZE[size]} /> : null}
      <span>{children}</span>
      {iconRight ? <Icon name={iconRight} size={ICON_SIZE[size]} /> : null}
    </>
  );

  if (href) {
    const { disabled, ...anchorRest } = rest;
    const anchorProps = {
      ...(anchorRest as unknown as AnchorHTMLAttributes<HTMLAnchorElement>),
      'aria-disabled': disabled || undefined,
      'data-state': rest['data-state'],
    };
    return isExternal(href) ? (
      <StyledAnchor href={href} {...style} {...anchorProps}>
        {content}
      </StyledAnchor>
    ) : (
      <StyledLink href={href} {...style} {...anchorProps}>
        {content}
      </StyledLink>
    );
  }

  return (
    <StyledButton type="button" {...style} {...rest}>
      {content}
    </StyledButton>
  );
}
