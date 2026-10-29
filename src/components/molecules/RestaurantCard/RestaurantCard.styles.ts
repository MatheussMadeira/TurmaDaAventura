import Image from 'next/image';
import styled from 'styled-components';
import { cardBase, cardBodyCss, cardMedia, cardOverline, cardTitle } from '../cardBase';

export const Article = styled.article`
  ${cardBase}
  ${cardMedia}
`;

export const MediaWrap = styled.div`
  position: relative;
`;

export const BrandLogo = styled(Image)`
  position: absolute;
  left: var(--space-4);
  bottom: calc(-1 * var(--space-5));
  width: 64px;
  height: 64px;
  object-fit: contain;
  background: var(--surface-raised);
  border-radius: 50%;
  padding: 6px;
  box-shadow: var(--shadow-md);
  box-sizing: border-box;
`;

export const Body = styled.div`
  ${cardBodyCss}
  padding-top: var(--space-6);

  & > a {
    align-self: flex-start;
    margin-top: auto;
  }
`;

export const Overline = styled.p`
  ${cardOverline}
`;
export const Title = styled.h3`
  ${cardTitle}
`;

export const Meta = styled.ul`
  list-style: none;
  margin: 0 0 var(--space-2);
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  li {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    font: 400 15px/22px var(--font-body);
    color: var(--ink-muted);
  }
  svg {
    color: var(--brand);
    margin-top: 2px;
  }
`;
