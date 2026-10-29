'use client';

import { useId, type SelectHTMLAttributes } from 'react';
import { Icon } from '../Icon';
import { FieldShell, describedBy } from '../TextField/Field';
import { Chevron, SelectWrap } from '../TextField/TextField.styles';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<string | SelectOption>;
  placeholder?: string;
  hint?: string;
  error?: string;
  'data-state'?: 'focus';
}

export function Select({
  label,
  options,
  placeholder,
  hint,
  error,
  className,
  id: givenId,
  required,
  value,
  'data-state': state,
  ...rest
}: SelectProps) {
  const generated = useId();
  const id = givenId ?? `tda-f${generated.replace(/[^a-zA-Z0-9]/g, '')}`;
  const items = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));

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
      <SelectWrap>
        <select
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          {...(value === undefined && placeholder ? { defaultValue: '' } : { value })}
          {...rest}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {items.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Chevron>
          <Icon name="chevron-down" size={18} />
        </Chevron>
      </SelectWrap>
    </FieldShell>
  );
}
