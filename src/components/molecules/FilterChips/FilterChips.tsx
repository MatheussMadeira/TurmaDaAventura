'use client';

import { useId } from 'react';
import { LayoutGroup } from 'framer-motion';
import { dur, ease } from '@/motion/tokens';
import { Chip, Count, List, Pill } from './FilterChips.styles';

export interface FilterOption {
  value: string;
  label: string;
  /** contagem exibida ao lado do rótulo */
  count?: number;
}

export interface FilterChipsProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  /** nome do grupo para leitores de tela, ex.: "Filtrar por categoria" */
  label: string;
  className?: string;
  /** Força o estado de um chip para documentação: { value, state }. */
  forceState?: { value: string; state: 'hover' | 'focus' };
}

export function FilterChips({
  options,
  value,
  onChange,
  label,
  className,
  forceState,
}: FilterChipsProps) {
  const group = useId();
  return (
    <LayoutGroup id={group}>
      <List role="group" aria-label={label} className={className}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <Chip
              key={o.value}
              type="button"
              aria-pressed={active}
              data-state={forceState?.value === o.value ? forceState.state : undefined}
              onClick={() => onChange(o.value)}
            >
              {active ? (
                <Pill
                  layoutId="filtro-ativo"
                  transition={{ duration: dur.medium, ease: ease.enter }}
                  aria-hidden
                />
              ) : null}
              {o.label}
              {o.count !== undefined ? <Count>{o.count}</Count> : null}
            </Chip>
          );
        })}
      </List>
    </LayoutGroup>
  );
}
