'use client';

import { useRef } from 'react';
import { dur } from '@/motion/tokens';
import { useInView } from '@/motion/useInView';
import { Icon, type IconName } from '../../atoms/Icon';
import { Marker, Num, Root, Step, Text, Title } from './Trail.styles';

export interface TrailStep {
  title: string;
  text?: string;
  icon?: IconName;
}

export interface TrailProps {
  steps: TrailStep[];
  className?: string;
}

export function Trail({ steps, className }: TrailProps) {
  const ref = useRef<HTMLOListElement>(null);
  const seen = useInView(ref, { amount: 0.35 });
  const n = steps.length;

  return (
    <Root ref={ref} $n={n} data-visible={seen} className={className}>
      {steps.map((s, i) => {
        /* marco i carimba em i × 1200 / (n − 1) ms, acompanhando a linha */
        const delay = n > 1 ? (i * dur.trail) / (n - 1) : 0;
        return (
          <Step key={s.title} style={{ ['--d' as string]: `${delay}s` }}>
            <Marker data-marker>
              <Icon name={s.icon ?? 'flag'} size={26} />
            </Marker>
            <Num className="overline">Etapa {String(i + 1).padStart(2, '0')}</Num>
            <Title className="h4">{s.title}</Title>
            {s.text ? <Text className="body-sm">{s.text}</Text> : null}
          </Step>
        );
      })}
    </Root>
  );
}
