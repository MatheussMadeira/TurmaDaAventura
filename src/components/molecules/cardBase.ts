import { css } from 'styled-components';
import { media } from '@/design-system/media';

/** Base visual dos cards (ServiceCard, RestaurantCard, TeamCard, QuoteForm). */
export const cardBase = css`
  display: flex;
  flex-direction: column;
  background: var(--surface-raised);
  border: var(--border-thin) solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  color: var(--ink);
  text-decoration: none;
`;

/** Card com link: sobe 4px, sombra md, foto 1.04, seta +4px. `data-state` força o estado para documentação. */
export const cardLink = css`
  transition:
    transform var(--dur-medium) var(--ease-enter),
    box-shadow var(--dur-medium) var(--ease-enter);

  img,
  [data-media-placeholder] {
    transition: transform var(--dur-slow) var(--ease-enter);
  }
  [data-card-more] svg {
    transition: transform var(--dur-fast) var(--ease-enter);
  }

  &:hover,
  &[data-state='hover'] {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);

    img,
    [data-media-placeholder] {
      transform: scale(1.04);
    }
    [data-card-more] svg {
      transform: translateX(var(--move-xs));
    }
  }
  &:active,
  &[data-state='pressed'] {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
    border-color: var(--brand);
  }
  &:focus-visible,
  &[data-state='focus'] {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }

  ${media.reducedMotion} {
    transition-duration: 1ms;
    img,
    [data-media-placeholder],
    [data-card-more] svg {
      transition-duration: 1ms;
    }
    &:hover,
    &[data-state='hover'] {
      transform: none;
      img,
      [data-media-placeholder] {
        transform: none;
      }
    }
  }
`;

/* Dentro do card a foto vai de borda a borda, sem cantos próprios. */
export const cardMedia = css`
  [data-media] {
    border-radius: 0;
  }
`;

export const cardBodyCss = css`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-5);
  flex: 1;
`;

export const cardOverline = css`
  margin: 0;
  color: var(--earth-strong);
`;

export const cardTitle = css`
  margin: 0;
  font-family: var(--font-display);
  color: var(--ink);
`;

export const cardText = css`
  margin: 0;
  color: var(--ink-muted);
`;

export const cardMore = css`
  margin-top: auto;
  padding-top: var(--space-2);
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font: 800 15px/20px var(--font-body);
  color: var(--brand);
`;
