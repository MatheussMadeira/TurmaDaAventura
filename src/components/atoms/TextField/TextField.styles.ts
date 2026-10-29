import styled, { css, keyframes } from 'styled-components';
import { media } from '@/design-system/media';

const shake = keyframes`
  0%, 100% { transform: none; }
  20%, 60% { transform: translateX(calc(-1 * var(--move-xs))); }
  40%, 80% { transform: translateX(var(--move-xs)); }
`;

const msgIn = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: none; }
`;

export const FieldRoot = styled.div<{ $error: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  /* data-state="focus" força o anel para documentação */
  &[data-state='focus'] :is(input, textarea, select) {
    border-color: var(--brand);
    box-shadow:
      0 0 0 3px var(--brand-soft),
      0 0 0 5px var(--focus);
  }

  ${({ $error }) =>
    $error &&
    css`
      :is(input, textarea, select) {
        border-color: var(--danger);
        animation: ${shake} 300ms var(--ease-standard);
      }
    `}

  ${media.reducedMotion} {
    :is(input, textarea, select) {
      animation: none;
    }
  }
`;

export const Label = styled.label`
  font: 700 15px/20px var(--font-body);
  color: var(--ink);
`;

export const Required = styled.span`
  color: var(--danger);
`;

export const Message = styled.p<{ $error?: boolean }>`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font: 600 13px/18px var(--font-body);
  color: ${({ $error }) => ($error ? 'var(--danger)' : 'var(--ink-muted)')};
  ${({ $error }) =>
    $error &&
    css`
      animation: ${msgIn} var(--dur-medium) var(--ease-enter) both;
    `}

  ${media.reducedMotion} {
    animation: none;
  }
`;

/* Estilo compartilhado de <input>, <textarea> e <select>. */
export const inputCss = css`
  width: 100%;
  box-sizing: border-box;
  min-height: 48px;
  padding: 12px var(--space-4);
  font: 400 16px/22px var(--font-body);
  color: var(--ink);
  background: var(--surface-raised);
  border: var(--border-thick) solid var(--line-strong);
  border-radius: var(--radius-sm);
  transition:
    border-color var(--dur-fast) var(--ease-standard),
    box-shadow var(--dur-medium) var(--ease-enter);
  appearance: none;

  &::placeholder {
    color: var(--ink-subtle);
  }
  &:hover {
    border-color: var(--ink-muted);
  }
  &:focus {
    outline: none;
    border-color: var(--brand);
    box-shadow:
      0 0 0 3px var(--brand-soft),
      0 0 0 5px var(--focus);
  }
  ${media.reducedMotion} {
    transition: none;
  }
`;

export const Input = styled.input`
  ${inputCss}
`;

export const Textarea = styled.textarea`
  ${inputCss}
  resize: vertical;
  min-height: 104px;
`;

export const SelectWrap = styled.div`
  position: relative;

  select {
    ${inputCss}
    padding-right: 44px;
    cursor: pointer;
  }
`;

export const Chevron = styled.span`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-muted);
  pointer-events: none;
  display: inline-flex;
`;
