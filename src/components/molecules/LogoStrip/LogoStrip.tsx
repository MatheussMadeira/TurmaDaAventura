'use client';

import Image from 'next/image';

import { Grid, Cell } from './LogoStrip.styles';

export interface LogoStripItem {
  /** nome da empresa (alt do logo) */
  name?: string;
  /** logo real; sem ele aparece o placeholder neutro tracejado */
  logo?: string;
}

export interface LogoStripProps {
  /** quantos placeholders mostrar quando `items` não vem; padrão 6 */
  count?: number;
  items?: LogoStripItem[];
  className?: string;
}

export function LogoStrip({ count = 6, items, className }: LogoStripProps) {
  const list = items ?? Array.from({ length: count }, (): LogoStripItem => ({}));
  return (
    <Grid forwardedAs="ul" stagger className={className}>
      {list.map((it, i) => (
        <Cell key={i}>
          {it.logo ? (
            <Image
              src={it.logo}
              alt={it.name ?? ''}
              fill
              sizes="200px"
              style={{ objectFit: 'contain', padding: 'var(--space-3)' }}
            />
          ) : (
            'Logo da empresa'
          )}
        </Cell>
      ))}
    </Grid>
  );
}
