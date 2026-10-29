'use client';

import { Children, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import styled from 'styled-components';
import { dur, reveal } from './tokens';
import { effects, reducedFade, stagger, type RevealEffect } from './variants';

const elements = {
  div: m.div,
  section: m.section,
  article: m.article,
  header: m.header,
  footer: m.footer,
  span: m.span,
  ul: m.ul,
  ol: m.ol,
} as const;

export interface RevealProps {
  as?: keyof typeof elements;
  /** up = fade + 24px (padrão) · fade · scale = fade + 0.96→1 */
  effect?: RevealEffect;
  /** escalona os filhos diretos (80ms cada, no máximo 6) — use no container do grid */
  stagger?: boolean;
  /** atraso extra em ms */
  delay?: number;
  /** fração visível que dispara a entrada; padrão 0.2 */
  threshold?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/* Itens escalonados são colunas flex para o card esticar na altura da linha do grid. */
const Root = styled(m.div)`
  &[data-stagger='true'] > * {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  &[data-stagger='true'] > * > * {
    flex: 1 0 auto;
  }
`;

export function Reveal({
  as = 'div',
  effect = 'up',
  stagger: staggered = false,
  delay = 0,
  threshold = reveal.amount,
  className,
  style,
  children,
}: RevealProps) {
  const reduce = useReducedMotion();
  const item = reduce ? reducedFade : effects[effect];
  const Tag = elements[as] as ElementType;
  const Item = as === 'ul' || as === 'ol' ? m.li : m.div;
  const viewport = { once: reveal.once, amount: threshold };
  const shared = {
    as: Tag,
    className,
    style,
    initial: 'hidden',
    whileInView: 'show',
    viewport,
    'data-stagger': staggered,
  } as const;

  if (!staggered) {
    return (
      <Root {...shared} variants={item} custom={delay / 1000}>
        {children}
      </Root>
    );
  }

  return (
    <Root {...shared} variants={stagger}>
      {Children.toArray(children).map((child, i) => (
        <Item
          key={i}
          variants={item}
          custom={Math.min(i, reveal.maxStagger - 1) * dur.stagger + delay / 1000}
        >
          {child}
        </Item>
      ))}
    </Root>
  );
}
