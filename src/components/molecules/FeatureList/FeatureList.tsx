'use client';

import { Icon, type IconName } from '../../atoms/Icon';

import { Grid, Feature, Seal, Title, Text } from './FeatureList.styles';

export interface FeatureItem {
  icon: IconName;
  title: string;
  text?: string;
  /** cor deste selo; padrão = a do FeatureList */
  tone?: 'brand' | 'olive' | 'earth';
}

export interface FeatureListProps {
  items: FeatureItem[];
  /** cor do selo do ícone */
  tone?: 'brand' | 'olive' | 'earth';
  /** colunas no desktop (3 → 2 → 1 nos breakpoints) */
  columns?: 2 | 3;
  className?: string;
}

export function FeatureList({ items, tone = 'brand', columns = 3, className }: FeatureListProps) {
  return (
    <Grid forwardedAs="ul" stagger $columns={columns} className={className}>
      {items.map((it) => (
        <Feature key={it.title}>
          <Seal $tone={it.tone ?? tone}>
            <Icon name={it.icon} size={26} />
          </Seal>
          <div>
            <Title className="h4">{it.title}</Title>
            {it.text ? <Text className="body-sm">{it.text}</Text> : null}
          </div>
        </Feature>
      ))}
    </Grid>
  );
}
