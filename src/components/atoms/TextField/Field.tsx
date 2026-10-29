'use client';

import type { ReactNode } from 'react';
import { Icon } from '../Icon';
import { FieldRoot, Label, Message, Required } from './TextField.styles';

export interface FieldShellProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  'data-state'?: 'focus';
  children: ReactNode;
}

/** Rótulo + controle + dica/erro. Compartilhado por TextField e Select. */
export function FieldShell({
  id,
  label,
  required,
  hint,
  error,
  className,
  children,
  'data-state': state,
}: FieldShellProps) {
  return (
    <FieldRoot $error={!!error} className={className} data-state={state}>
      <Label htmlFor={id}>
        {label}
        {required ? <Required aria-hidden> *</Required> : null}
      </Label>
      {children}
      {error ? (
        <Message id={`${id}-msg`} $error>
          <Icon name="flag" size={14} />
          {error}
        </Message>
      ) : hint ? (
        <Message id={`${id}-msg`}>{hint}</Message>
      ) : null}
    </FieldRoot>
  );
}

export const describedBy = (id: string, error?: string, hint?: string) =>
  error || hint ? `${id}-msg` : undefined;
