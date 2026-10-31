import styled from 'styled-components';
import { cardBase, cardBodyCss, cardMedia, cardOverline, cardText, cardTitle } from '../cardBase';

export const Article = styled.article`
  ${cardBase}
  ${cardMedia}
  position: relative;
  transition:
    border-color var(--dur-medium) var(--ease-standard),
    box-shadow var(--dur-medium) var(--ease-standard);

  &[data-in-bag='true'] {
    border-color: var(--brand);
    box-shadow:
      0 0 0 2px var(--brand-soft),
      var(--shadow-sm);
  }
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

export const Foot = styled.div`
  margin-top: auto;
  padding-top: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
`;

export const InBag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font: 800 14px/18px var(--font-body);
  color: var(--brand);
`;
