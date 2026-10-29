'use client';

import { useRef } from 'react';
import { useInView } from '@/motion/useInView';
import { Icon, type IconName } from '../../atoms/Icon';
import { Badge, Num, Root, Text, Title, type PillarTone } from './ValuePillar.styles';

export interface ValuePillarProps {
  title: string;
  /** posição no trio (0, 1, 2) — escalona a entrada do selo */
  index?: number;
  text?: string;
  number?: string;
  icon?: IconName;
  tone?: PillarTone;
  className?: string;
}

export function ValuePillar({
  title,
  index = 0,
  text,
  number,
  icon = 'star',
  tone = 'brand',
  className,
}: ValuePillarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref);
  return (
    <Root ref={ref} data-visible={seen} className={className}>
      <Badge $tone={tone} $index={index}>
        <Icon name={icon} size={30} />
      </Badge>
      {number ? <Num className="overline">{number}</Num> : null}
      <Title className="h3">{title}</Title>
      {text ? <Text className="body">{text}</Text> : null}
    </Root>
  );
}
