import styled from 'styled-components';

export const Root = styled.section`
  container: tda-cta / inline-size;
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-xl);
  background: var(--surface-forest);
  color: var(--ink-on-forest);
`;

export const Inner = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-7) var(--space-8);

  @container tda-cta (max-width: 899px) {
    flex-direction: column;
    align-items: flex-start;
    padding: var(--space-6) var(--space-5);
    gap: var(--space-4);

    & > a {
      width: 100%;
    }
  }
`;

export const Symbol = styled.span`
  flex: none;
  display: block;
  transform: rotate(-12deg);
  opacity: 0.95;
  --tda-logo-h: auto;

  img {
    width: 112px;
    height: auto;
  }
  @container tda-cta (max-width: 899px) {
    img {
      width: 72px;
    }
  }
`;

export const Copy = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

export const Title = styled.h2`
  margin: 0;
  font-family: var(--font-display);
  color: var(--ink-on-forest);
`;

export const Text = styled.p`
  margin: 0;
  color: var(--ink-on-forest-muted);
`;
