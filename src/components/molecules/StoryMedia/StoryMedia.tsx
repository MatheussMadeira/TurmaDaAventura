'use client';

import styled from 'styled-components';
import { media } from '@/design-system/media';
import { Reveal } from '@/motion/Reveal';
import { Logo } from '../../atoms/Logo';
import { Media, type MediaProps } from '../../atoms/Media';

export interface StoryMediaProps extends Pick<
  MediaProps,
  'src' | 'alt' | 'ratio' | 'icon' | 'placeholderId' | 'sizes'
> {
  /** pata decorativa no canto (alt vazio) */
  paw?: boolean;
  className?: string;
}

const Root = styled.div`
  position: relative;

  [data-media] {
    box-shadow: var(--shadow-photo);
    border-radius: var(--radius-xl) var(--radius-xl) var(--radius-xl) 8px;
  }
`;

const Paw = styled.span`
  position: absolute;
  width: 84px;
  right: -18px;
  top: -36px;
  transform: rotate(18deg);
  pointer-events: none;
  --tda-logo-h: auto;

  img {
    width: 100%;
    height: auto;
  }
  ${media.down('bp-md')} {
    display: none;
  }
`;

/** Foto com moldura deslocada (shadow-photo) e, opcionalmente, a pata do logo. Entra com fade + scale. */
export function StoryMedia({ paw = false, className, ...mediaProps }: StoryMediaProps) {
  return (
    <Reveal effect="scale" className={className}>
      <Root>
        <Media {...mediaProps} />
        {paw ? (
          <Paw aria-hidden>
            <Logo variant="paw" tone="auto" height={100} />
          </Paw>
        ) : null}
      </Root>
    </Reveal>
  );
}
