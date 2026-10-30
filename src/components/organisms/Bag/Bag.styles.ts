import styled, { keyframes } from 'styled-components';
import { media } from '@/design-system/media';

/* ---------- botão flutuante "Ver sacola" (substitui o WhatsAppFloat quando há itens) ---------- */
const stamp = keyframes`
  from { transform: scale(0.5); opacity: 0.4; }
  to { transform: scale(1); opacity: 1; }
`;

export const Fab = styled.button`
  position: fixed;
  right: var(--space-5);
  bottom: var(--space-5);
  z-index: var(--z-float);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 64px;
  padding: 0 22px 0 18px;
  box-sizing: border-box;
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--brand);
  color: var(--on-brand);
  box-shadow: var(--shadow-stamp-brand), var(--shadow-md);
  font: 800 16px/20px var(--font-body);
  cursor: pointer;

  /* some junto com o QuoteForm (y +24, fade) e fica fora da árvore de acessibilidade */
  opacity: 1;
  visibility: visible;
  transform: none;
  transition:
    transform var(--dur-slow) var(--ease-enter),
    opacity var(--dur-medium) var(--ease-standard),
    visibility 0s linear 0s;

  &[data-shown='false'] {
    opacity: 0;
    visibility: hidden;
    transform: translateY(var(--move-md));
    transition-timing-function: var(--ease-exit);
    transition-delay: 0s, 0s, var(--dur-medium);
  }
  &[data-shown='true']:hover {
    background: var(--brand-hover);
    transform: translateY(-2px);
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }

  @media (max-width: 639px) {
    right: var(--space-4);
    bottom: var(--space-4);
    min-height: 56px;
  }
  ${media.reducedMotion} {
    transition-duration: 150ms;
    transform: none !important;
  }
`;

export const FabCount = styled.span`
  display: grid;
  place-items: center;
  min-width: 26px;
  height: 26px;
  padding: 0 6px;
  border-radius: var(--radius-pill);
  background: var(--ink-on-forest);
  color: var(--surface-forest);
  font: 800 13px/1 var(--font-body);
  animation: ${stamp} var(--dur-medium) var(--ease-stamp) both;

  ${media.reducedMotion} {
    animation: none;
  }
`;

/* ---------- gaveta ---------- */
const slideIn = keyframes`
  from { transform: translateX(var(--move-md)); opacity: 0; }
  to { transform: none; opacity: 1; }
`;
const slideUp = keyframes`
  from { transform: translateY(var(--move-md)); opacity: 0; }
  to { transform: none; opacity: 1; }
`;
const fade = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  background: var(--scrim);
  animation: ${fade} var(--dur-medium) var(--ease-enter) both;
`;

export const Drawer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-overlay);
  width: min(440px, 100%);
  display: flex;
  flex-direction: column;
  background: var(--surface-raised);
  box-shadow: var(--shadow-md);
  font-family: var(--font-body);
  color: var(--ink);
  animation: ${slideIn} var(--dur-medium) var(--ease-enter) both;

  ${media.down('bp-md')} {
    top: auto;
    left: 0;
    width: 100%;
    max-height: 88vh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    animation-name: ${slideUp};
  }
  ${media.reducedMotion} {
    animation-name: ${fade};
  }
`;

export const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-5);
  border-bottom: var(--border-thin) solid var(--line);
`;

export const Over = styled.p`
  margin: 0;
  color: var(--earth-strong);
`;

export const Title = styled.h2`
  margin: 0;
  font: 700 26px/32px var(--font-display);
  font-variation-settings:
    'opsz' 36,
    'SOFT' 100;
`;

export const Close = styled.button`
  display: grid;
  place-items: center;
  width: var(--tap-min);
  height: var(--tap-min);
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--brand-soft);
  color: var(--brand);
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
`;

export const Body = styled.div`
  flex: 1;
  overflow: auto;
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
`;

export const Foot = styled.div`
  padding: var(--space-4) var(--space-5) var(--space-5);
  border-top: var(--border-thin) solid var(--line);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  background: var(--surface-raised);
`;

export const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-2);

  img {
    width: 80px;
    height: auto;
  }
  h3,
  p {
    margin: 0;
  }
  p {
    color: var(--ink-muted);
  }
`;

export const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;

export const Item = styled.li`
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--surface-sunken);
`;

export const ItemImg = styled.div`
  width: 64px;
  height: 64px;
  border-radius: var(--radius-sm);
  overflow: hidden;

  [data-media] {
    height: 100%;
    aspect-ratio: auto !important;
  }
`;

export const ItemName = styled.p`
  margin: 0;
  font: 800 15px/20px var(--font-body);
`;

export const ItemMeta = styled.p`
  margin: 2px 0 0;
  font: 600 13px/18px var(--font-body);
  color: var(--ink-muted);
`;

export const ItemRow = styled.div`
  grid-column: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
`;

export const Remove = styled.button`
  min-height: var(--tap-min);
  padding: 0 var(--space-2);
  border: 0;
  background: none;
  color: var(--danger);
  font: 700 14px/18px var(--font-body);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  border-radius: var(--radius-sm);

  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
`;

export const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const Note = styled.div`
  display: flex;
  gap: var(--space-2);
  align-items: flex-start;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--brand-soft);
  color: var(--ink);
  font: 600 14px/20px var(--font-body);

  svg {
    color: var(--brand);
    flex: none;
    margin-top: 1px;
  }
`;

/* ---------- aviso "Pedido enviado. Desfazer" ---------- */
const rise = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
`;

export const ToastRegion = styled.div`
  position: fixed;
  left: 50%;
  bottom: var(--space-5);
  transform: translateX(-50%);
  z-index: var(--z-float);
  max-width: calc(100vw - 2 * var(--space-4));
`;

export const ToastBubble = styled.div`
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
  button:focus-visible {
    outline: 3px solid var(--focus-on-forest);
    outline-offset: 2px;
  }
  ${media.reducedMotion} {
    animation: none;
  }
`;
