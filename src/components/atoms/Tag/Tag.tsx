'use client';

import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';
import { StyledTag, type TagTone } from './Tag.styles';

export interface TagProps {
  tone?: TagTone;
  icon?: IconName;
  children?: ReactNode;
  className?: string;
}

export function Tag({ tone = 'olive', icon, children, className }: TagProps) {
  return (
    <StyledTag $tone={tone} className={className}>
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
    </StyledTag>
  );
}
