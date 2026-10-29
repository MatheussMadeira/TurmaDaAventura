'use client';

import { Icon, type IconName } from '../../atoms/Icon';
import { Seal } from '../FeatureList/FeatureList.styles';
import { Root, Value, Label, Description } from './Stat.styles';

export interface StatProps {
  /** o número ou destaque, ex.: "1:6" ou "100%" */
  value: string;
  label: string;
  description?: string;
  /** ícone em selo acima do número */
  icon?: IconName;
  tone?: 'brand' | 'olive' | 'earth';
  className?: string;
}

export function Stat({ value, label, description, icon, tone = 'brand', className }: StatProps) {
  return (
    <Root className={className}>
      {icon ? (
        <Seal $tone={tone}>
          <Icon name={icon} size={24} />
        </Seal>
      ) : null}
      <Value>{value}</Value>
      <Label>{label}</Label>
      {description ? <Description className="body-sm">{description}</Description> : null}
    </Root>
  );
}
