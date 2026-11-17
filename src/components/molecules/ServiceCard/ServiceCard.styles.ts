import Link from 'next/link';
import styled, { css } from 'styled-components';
import {
  cardBase,
  cardBodyCss,
  cardLink,
  cardMedia,
  cardMore,
  cardOverline,
  cardText,
  cardTitle,
} from '../cardBase';

interface RootProps {
  $earth: boolean;
  $link: boolean;
}

const root = css<RootProps>`
  ${cardBase}
  ${cardMedia}
  ${({ $link }) => $link && cardLink}
  ${({ $earth }) => $earth && 'background: var(--surface-earth);'}
`;

export const Article = styled.article<RootProps>`
  ${root}
`;
export const CardLink = styled(Link)<RootProps>`
  ${root}
`;

export const IconBadge = styled.span<{ $earth: boolean }>`
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  margin: var(--space-5) var(--space-5) 0;
  border-radius: 18px 18px 18px 4px;
  background: var(--brand-soft);
  color: var(--brand);
  ${({ $earth }) =>
    $earth &&
    'background: var(--earth-soft); color: var(--earth-strong); box-shadow: inset 0 0 0 1.5px var(--earth);'}
`;

export const Body = styled.div`
  ${cardBodyCss}
`;
export const Overline = styled.p`
  ${cardOverline}
`;
export const Title = styled.h3`
  ${cardTitle}
`;
export const Text = styled.p`
  ${cardText}
`;
export const More = styled.span`
  ${cardMore}
`;

/** "Ver detalhes": mesmo visual do "Saiba mais", mas é um botão que abre o modal. */
export const MoreButton = styled.button`
  ${cardMore}
  align-self: flex-start;
  min-height: var(--tap-min);
  margin-inline: calc(-1 * var(--space-2));
  padding: var(--space-2);
  border: 0;
  border-radius: var(--radius-sm);
  background: none;
  cursor: pointer;
  text-align: left;

  &:hover svg {
    transform: translateX(2px);
  }
  svg {
    transition: transform var(--dur-fast) var(--ease-standard);
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
`;
