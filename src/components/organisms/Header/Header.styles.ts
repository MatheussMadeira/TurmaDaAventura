import Link from 'next/link';
import { m } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { media } from '@/design-system/media';

const linkIn = keyframes`
  from { opacity: 0; transform: translateY(var(--move-sm)); }
  to { opacity: 1; transform: none; }
`;

/* Header responde à largura do próprio container (container queries), não da janela. */
export const Root = styled.header`
  container: tda-header / inline-size;
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  background: var(--surface-raised);
  border-bottom: var(--border-thin) solid var(--line);
  --tda-logo-h: 52px;
  transition:
    transform var(--dur-medium) var(--ease-standard),
    box-shadow var(--dur-medium) var(--ease-standard);

  &[data-scrolled='true'] {
    box-shadow: var(--shadow-md);
    --tda-logo-h: 44px;
  }
  &[data-hidden='true']:not(:focus-within) {
    transform: translateY(-100%);
    transition-timing-function: var(--ease-exit);
  }

  ${media.reducedMotion} {
    transition-duration: 1ms;
  }
`;

export const Inner = styled.div`
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 var(--space-5);
  min-height: var(--header-h);
  display: flex;
  align-items: center;
  gap: var(--space-5);
  transition: min-height var(--dur-medium) var(--ease-standard);

  [data-scrolled='true'] > & {
    min-height: 64px;
  }

  ${media.containerDown('tda-header', 'bp-lg')} {
    min-height: 64px;
    flex-wrap: wrap;
    gap: var(--space-3);
    padding: 0 var(--space-4);
    --tda-logo-h: 40px;
  }

  ${media.reducedMotion} {
    transition-duration: 1ms;
  }
`;

export const Nav = styled.nav`
  margin-left: auto;

  ${media.containerDown('tda-header', 'bp-lg')} {
    order: 4;
    flex-basis: 100%;
    margin: 0;
    display: none;

    [data-open='true'] & {
      display: block;
      padding-bottom: var(--space-4);
    }
  }
`;

export const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: var(--space-1);

  ${media.containerDown('tda-header', 'bp-lg')} {
    flex-direction: column;

    [data-open='true'] & > li {
      animation: ${linkIn} var(--dur-medium) var(--ease-enter) both;
      animation-delay: calc(var(--i, 0) * 50ms);
    }
  }
  ${media.reducedMotion} {
    & > li {
      animation: none !important;
    }
  }
`;

export const NavLink = styled(Link)`
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: var(--tap-min);
  padding: 0 var(--space-3);
  border-radius: var(--radius-sm);
  font: 700 16px/20px var(--font-body);
  color: var(--ink);
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    color: var(--brand);
    background: var(--brand-soft);
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
  &[aria-current='page'] {
    color: var(--brand);
  }

  ${media.containerDown('tda-header', 'bp-lg')} {
    width: 100%;
    box-sizing: border-box;
    font-size: 18px;
    min-height: 52px;

    &[aria-current='page'] {
      background: var(--brand-soft);
    }
  }
`;

/* Sublinhado tracejado que acompanha hover/foco (layoutId="nav-underline") e se desenha na página ativa. */
export const Underline = styled(m.span)`
  position: absolute;
  left: var(--space-3);
  right: var(--space-3);
  bottom: 6px;
  height: 3px;
  border-radius: 2px;
  background: repeating-linear-gradient(90deg, var(--brand) 0 6px, transparent 6px 10px);
  transform-origin: left;
  pointer-events: none;

  ${media.containerDown('tda-header', 'bp-lg')} {
    display: none;
  }
`;

export const Cta = styled.div`
  ${media.containerDown('tda-header', 'bp-lg')} {
    order: 2;
    margin-left: auto;
  }
  @container tda-header (max-width: 359px) {
    display: none;
  }
`;

export const Toggle = styled.button`
  display: none;
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--brand-soft);
  color: var(--brand);
  cursor: pointer;
  place-items: center;

  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }

  ${media.containerDown('tda-header', 'bp-lg')} {
    display: grid;
    order: 3;
  }
  @container tda-header (max-width: 359px) {
    margin-left: auto;
  }
`;

/* Hambúrguer vira X (transform/opacity). */
export const Burger = styled.span`
  position: relative;
  display: block;
  width: 22px;
  height: 16px;

  & > span {
    position: absolute;
    left: 0;
    right: 0;
    height: 2.5px;
    border-radius: 2px;
    background: currentColor;
    transition:
      transform var(--dur-medium) var(--ease-enter),
      opacity var(--dur-fast) linear,
      top var(--dur-medium) var(--ease-enter);
  }
  & > span:nth-child(1) {
    top: 0;
  }
  & > span:nth-child(2) {
    top: 7px;
  }
  & > span:nth-child(3) {
    top: 14px;
  }
  [data-open='true'] & > span:nth-child(1) {
    top: 7px;
    transform: rotate(45deg);
  }
  [data-open='true'] & > span:nth-child(2) {
    opacity: 0;
  }
  [data-open='true'] & > span:nth-child(3) {
    top: 7px;
    transform: rotate(-45deg);
  }

  ${media.reducedMotion} {
    & > span {
      transition-duration: 1ms;
    }
  }
`;
