import styled from 'styled-components';

export const Root = styled.footer`
  container: tda-footer / inline-size;
  background: var(--surface-forest);
  color: var(--ink-on-forest);
`;

export const Inner = styled.div`
  max-width: var(--container);
  margin: 0 auto;
  padding: var(--space-8) var(--space-5) var(--space-7);
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: var(--space-7);

  @container tda-footer (max-width: 899px) {
    grid-template-columns: 1fr;
    gap: var(--space-6);
    padding: var(--space-7) var(--space-4) var(--space-6);
  }
`;

export const Brand = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  --tda-logo-h: auto;

  img {
    width: 280px;
    height: auto;
  }
  @container tda-footer (max-width: 899px) {
    img {
      width: 220px;
    }
  }
`;

export const About = styled.p`
  margin: 0;
  color: var(--ink-on-forest-muted);
  max-width: 30em;
`;

export const Heading = styled.p`
  margin: 0 0 var(--space-3);
  color: var(--caqui-200);
`;

export const LinkList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);

  a,
  span {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-height: 36px;
    color: var(--ink-on-forest);
    text-decoration: none;
    font: 600 16px/22px var(--font-body);
    border-radius: 6px;
  }
  a:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  a:focus-visible {
    outline: 3px solid var(--focus-on-forest);
    outline-offset: 2px;
  }
`;

export const Bottom = styled.div`
  max-width: var(--container);
  margin: 0 auto;
  padding: var(--space-4) var(--space-5) var(--space-5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  border-top: 1px solid color-mix(in srgb, var(--caqui-200) 25%, transparent);
  flex-wrap: wrap;

  p {
    margin: 0;
    color: var(--ink-on-forest-muted);
  }
  .tagline {
    color: var(--caqui-200);
    font-family: var(--font-display);
  }
`;
