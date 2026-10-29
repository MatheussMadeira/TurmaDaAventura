import styled, { keyframes } from 'styled-components';
import { media } from '@/design-system/media';
import { cardBase } from '../../molecules/cardBase';

const step = keyframes`
  0%, 100% { opacity: 0.25; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-3px); }
`;
const stampIn = keyframes`
  from { opacity: 0; transform: scale(0.6) rotate(-20deg); }
  to { opacity: 1; transform: scale(1) rotate(0); }
`;
const alertIn = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: none; }
`;

export const Form = styled.form`
  ${cardBase}
  container: tda-quote / inline-size;
  overflow: visible;
  padding: var(--space-6);
  gap: var(--space-5);
  box-shadow: var(--shadow-stamp-card);
`;

export const Head = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  h3 {
    margin: 0;
    font-family: var(--font-display);
    color: var(--brand);
  }
  p {
    margin: 0;
    color: var(--ink-muted);
  }
`;

/* Alerta de topo: "Revise N campos" (ícone + texto, nunca só cor). */
export const Alert = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--danger-soft);
  color: var(--danger);
  font: 800 15px/20px var(--font-body);
  animation: ${alertIn} var(--dur-medium) var(--ease-enter) both;

  ${media.reducedMotion} {
    animation: none;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);

  @container tda-quote (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const Full = styled.div`
  grid-column: 1 / -1;
`;

export const Note = styled.p`
  margin: 0;
  text-align: center;
  color: var(--ink-muted);
`;

export const Steps = styled.span`
  display: inline-flex;
  gap: 4px;
  margin-right: var(--space-1);

  & > i {
    width: 6px;
    height: 9px;
    border-radius: 3px;
    background: currentColor;
    animation: ${step} 900ms var(--ease-standard) infinite;
  }
  & > i:nth-child(2) {
    animation-delay: 150ms;
  }
  & > i:nth-child(3) {
    animation-delay: 300ms;
  }
  ${media.reducedMotion} {
    & > i {
      animation: none;
      opacity: 1;
    }
  }
`;

export const Check = styled.span`
  display: inline-flex;
  animation: ${stampIn} var(--dur-medium) var(--ease-stamp) both;

  ${media.reducedMotion} {
    animation: none;
  }
`;

export const SubmitWrap = styled.div`
  /* durante o envio o botão fica opaco e com cursor de progresso */
  &[data-busy='true'] button {
    opacity: 1;
    cursor: progress;
  }
`;
