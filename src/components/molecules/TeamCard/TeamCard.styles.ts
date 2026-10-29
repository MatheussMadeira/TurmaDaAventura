import Image from 'next/image';
import styled from 'styled-components';
import { cardBase, cardText, cardTitle } from '../cardBase';

export const Article = styled.article`
  ${cardBase}
  align-items: center;
  text-align: center;
  padding: var(--space-6) var(--space-5);
  gap: var(--space-2);
`;

export const Photo = styled.div`
  position: relative;
  width: 128px;
  height: 128px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--brand-soft);
  border: 4px solid var(--surface-raised);
  box-shadow: 0 0 0 2px var(--brand);
  margin-bottom: var(--space-2);
  display: grid;
  place-items: center;
`;

export const PhotoImg = styled(Image)`
  object-fit: cover;
`;

export const Initials = styled.span`
  font: 800 40px/1 var(--font-display);
  font-variation-settings:
    'opsz' 36,
    'SOFT' 100,
    'WONK' 0;
  color: var(--brand);
`;

export const Nick = styled.p`
  margin: 0;
  color: var(--earth-strong);
  font-family: var(--font-display);
`;

export const Title = styled.h3`
  ${cardTitle}
`;

export const Role = styled.p`
  margin: 0;
  color: var(--olive);
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

export const Bio = styled.p`
  ${cardText}
`;
