import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';

/* A altura vem de --tda-logo-h (definida pelo pai, ex.: Header encolhendo) ou do prop `height`. */
export const LogoImage = styled(Image)<{ $height: number; $auto?: 'light' | 'dark' }>`
  display: block;
  max-width: 100%;
  width: auto;
  height: var(--tda-logo-h, ${({ $height }) => $height}px);
  transition: height var(--dur-medium) var(--ease-standard);
  ${({ $auto }) => $auto === 'dark' && `display: none; [data-theme='noite'] & { display: block; }`}
  ${({ $auto }) => $auto === 'light' && `[data-theme='noite'] & { display: none; }`}
`;

export const LogoLink = styled(Link)`
  display: inline-flex;
  border-radius: var(--radius-sm);
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 4px;
  }
`;
