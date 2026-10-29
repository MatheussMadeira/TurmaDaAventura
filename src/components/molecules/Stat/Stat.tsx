'use client';

import { Root, Value, Label, Description } from './Stat.styles';

export interface StatProps {
  /** o número ou destaque, ex.: "1:6" ou "100%" */
  value: string;
  label: string;
  description?: string;
  className?: string;
}

export function Stat({ value, label, description, className }: StatProps) {
  return (
    <Root className={className}>
      <Value>{value}</Value>
      <Label>{label}</Label>
      {description ? <Description className="body-sm">{description}</Description> : null}
    </Root>
  );
}
