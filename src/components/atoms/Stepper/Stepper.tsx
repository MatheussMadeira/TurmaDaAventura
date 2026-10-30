'use client';

import { MAX_QTY } from '@/lib/bag';
import { Root, Step, Value } from './Stepper.styles';

export interface StepperProps {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  /** nome do grupo para leitores de tela, ex.: "Quantidade de Kit mini horta" */
  label: string;
  max?: number;
  className?: string;
}

/** − qtd + com alvos de 44px. A quantidade é anunciada (aria-live) a cada mudança. */
export function Stepper({
  value,
  onDecrease,
  onIncrease,
  label,
  max = MAX_QTY,
  className,
}: StepperProps) {
  return (
    <Root role="group" aria-label={label} className={className}>
      <Step type="button" aria-label="Diminuir" onClick={onDecrease}>
        −
      </Step>
      <Value aria-live="polite">{value}</Value>
      <Step type="button" aria-label="Aumentar" disabled={value >= max} onClick={onIncrease}>
        +
      </Step>
    </Root>
  );
}
