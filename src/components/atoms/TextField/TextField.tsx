'use client';

import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { FieldShell, describedBy } from './Field';
import { Input, Textarea } from './TextField.styles';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  hint?: string;
  error?: string;
  /** vira <textarea> */
  multiline?: boolean;
  rows?: number;
  /** Força o anel de foco para documentação. */
  'data-state'?: 'focus';
}

export function TextField({
  label,
  hint,
  error,
  multiline,
  rows = 4,
  className,
  id: givenId,
  required,
  'data-state': state,
  ...rest
}: TextFieldProps) {
  const generated = useId();
  const id = givenId ?? `tda-f${generated.replace(/[^a-zA-Z0-9]/g, '')}`;
  const common = {
    id,
    required,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy(id, error, hint),
  } as const;

  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={className}
      data-state={state}
    >
      {multiline ? (
        <Textarea
          rows={rows}
          {...common}
          {...(rest as unknown as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <Input type="text" {...common} {...rest} />
      )}
    </FieldShell>
  );
}
