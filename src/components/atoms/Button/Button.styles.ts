import Link from 'next/link';
import styled, { css } from 'styled-components';
import { media } from '@/design-system/media';

export type ButtonVariant = 'primary' | 'earth' | 'outline' | 'ghost' | 'inverse' | 'ghost-inverse';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface StyleProps {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $full: boolean;
}

/* Cada variante só redefine as variáveis privadas --_*; o corpo do botão é um só. */
const variants: Record<ButtonVariant, ReturnType<typeof css>> = {
  primary: css``,
  earth: css`
    --_bg: var(--earth);
    --_fg: var(--on-earth);
    --_sh: var(--shadow-stamp-earth);
    --_bg-h: var(--earth-hover);
  `,
  outline: css`
    --_bg: transparent;
    --_fg: var(--brand);
    --_bd: var(--brand);
    --_sh: none;
    --_bg-h: var(--brand-soft);
  `,
  ghost: css`
    --_bg: transparent;
    --_fg: var(--brand);
    --_sh: none;
    --_bg-h: var(--brand-soft);
    padding-inline: var(--space-3);
  `,
  inverse: css`
    --_bg: var(--ink-on-forest);
    --_fg: var(--surface-forest);
    --_sh: 0 4px 0 0 color-mix(in srgb, var(--carvao-900) 35%, transparent);
    --_bg-h: var(--caqui-200);
    &:focus-visible {
      outline-color: var(--focus-on-forest);
    }
  `,
  'ghost-inverse': css`
    --_bg: transparent;
    --_fg: var(--ink-on-forest);
    --_bd: var(--ink-on-forest);
    --_sh: none;
    --_bg-h: color-mix(in srgb, var(--branco) 8%, transparent);
    &:focus-visible {
      outline-color: var(--focus-on-forest);
    }
  `,
};

const sizes: Record<ButtonSize, ReturnType<typeof css>> = {
  sm: css`
    min-height: 40px;
    padding: 0 var(--space-4);
    font-size: 15px;
    border-radius: var(--radius-sm);
  `,
  md: css``,
  lg: css`
    min-height: 56px;
    padding: 0 var(--space-6);
    font-size: 17px;
  `,
};

export const buttonStyles = css<StyleProps>`
  --_bg: var(--brand);
  --_fg: var(--on-brand);
  --_bd: transparent;
  --_sh: var(--shadow-stamp-brand);
  --_bg-h: var(--brand-hover);

  display: ${({ $full }) => ($full ? 'flex' : 'inline-flex')};
  ${({ $full }) => $full && 'width: 100%;'}
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: var(--tap-min);
  padding: 0 var(--space-5);
  margin-bottom: 4px;
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 20px;
  font-weight: 800;
  letter-spacing: 0.01em;
  color: var(--_fg);
  background: var(--_bg);
  border: var(--border-thick) solid var(--_bd);
  border-radius: var(--radius-md);
  box-shadow: var(--_sh);
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  transition:
    transform var(--dur-fast) var(--ease-stamp),
    box-shadow var(--dur-fast) var(--ease-standard),
    background-color var(--dur-fast) var(--ease-standard);

  ${({ $variant }) => variants[$variant]}
  ${({ $size }) => sizes[$size]}

  &:hover,
  &[data-state='hover'] {
    background: var(--_bg-h);
    transform: translateY(-1px);
  }
  &:active,
  &[data-state='pressed'] {
    background: var(--_bg-h);
    transform: translateY(var(--move-xs));
    box-shadow: none;
    transition-duration: 60ms;
  }
  &:focus-visible,
  &[data-state='focus'] {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }
  &[data-state='focus'] {
    ${({ $variant }) =>
      ($variant === 'inverse' || $variant === 'ghost-inverse') &&
      'outline-color: var(--focus-on-forest);'}
  }
  &[disabled],
  &[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  ${media.reducedMotion} {
    transition-duration: 1ms;
    &:hover,
    &[data-state='hover'] {
      transform: none;
    }
  }
`;

export const StyledButton = styled.button<StyleProps>`
  ${buttonStyles}
`;
export const StyledAnchor = styled.a<StyleProps>`
  ${buttonStyles}
`;
export const StyledLink = styled(Link)<StyleProps>`
  ${buttonStyles}
`;
