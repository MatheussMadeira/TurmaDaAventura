'use client';

import styled from 'styled-components';
import type tokensJson from '@/design-system/tokens/tokens.json';

type Tokens = typeof tokensJson;

const Page = styled.main`
  max-width: ${({ theme }) => theme.size.container};
  margin: 0 auto;
  padding: ${({ theme }) => theme.space['space-7']} ${({ theme }) => theme.space['space-4']};
  display: grid;
  gap: ${({ theme }) => theme.space['space-8']};
`;

const Block = styled.section`
  display: grid;
  gap: ${({ theme }) => theme.space['space-5']};
`;

const Muted = styled.p`
  margin: 0;
  color: var(--ink-muted);
`;

const ThemePanel = styled.div`
  background: var(--surface);
  color: var(--ink);
  border: ${({ theme }) => theme.border['border-thin']} solid var(--line);
  border-radius: ${({ theme }) => theme.radius['radius-lg']};
  padding: ${({ theme }) => theme.space['space-5']};
  display: grid;
  gap: ${({ theme }) => theme.space['space-4']};
`;

const Grid = styled.div<{ $min?: string }>`
  display: grid;
  gap: ${({ theme }) => theme.space['space-3']};
  grid-template-columns: repeat(auto-fill, minmax(${({ $min }) => $min ?? '200px'}, 1fr));
`;

const Swatch = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space['space-1']};
  min-width: 0;

  & > i {
    display: block;
    height: 48px;
    border-radius: ${({ theme }) => theme.radius['radius-sm']};
    border: ${({ theme }) => theme.border['border-thin']} solid var(--line);
    background: var(--c);
  }
  & > b {
    font: 800 13px/16px var(--font-body);
  }
  & > span {
    font: 600 13px/18px var(--font-body);
    color: var(--ink-subtle);
    overflow-wrap: anywhere;
  }
`;

const Row = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space['space-1']};
  padding: ${({ theme }) => theme.space['space-3']} 0;
  border-top: ${({ theme }) => theme.border['border-thin']} solid var(--line);
`;

const Box = styled.div<{ $bg: string; $radius?: string; $shadow?: string; $size?: string }>`
  width: ${({ $size }) => $size ?? '96px'};
  height: 64px;
  background: ${({ $bg }) => $bg};
  border-radius: ${({ $radius }) => $radius ?? '0'};
  box-shadow: ${({ $shadow }) => $shadow ?? 'none'};
  border: ${({ theme }) => theme.border['border-thin']} solid var(--line);
`;

const Inline = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space['space-5']};
  align-items: flex-end;
`;

/* Demo de movimento só com CSS: passe o mouse (ou foque) na trilha e o marcador anda. */
const Track = styled.button<{ $dur: string; $ease: string }>`
  all: unset;
  box-sizing: border-box;
  width: 100%;
  min-height: ${({ theme }) => theme.size['tap-min']};
  display: flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radius['radius-pill']};
  background: var(--surface-sunken);
  padding: 0 ${({ theme }) => theme.space['space-2']};
  cursor: pointer;

  & > i {
    width: 24px;
    height: 24px;
    border-radius: ${({ theme }) => theme.radius['radius-pill']};
    background: var(--brand);
    transition: transform ${({ $dur }) => $dur} ${({ $ease }) => $ease};
  }
  &:hover > i,
  &:focus-visible > i {
    transform: translateX(min(60vw, 520px));
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }
  @media (prefers-reduced-motion: reduce) {
    & > i {
      transition: none;
    }
  }
`;

const colorGroups: { title: string; match: (n: string) => boolean }[] = [
  { title: 'Semânticos', match: (n) => !/-(\d{2,3})$/.test(n) && n !== 'branco' },
  { title: 'Paleta crua (ilustração)', match: (n) => /-(\d{2,3})$/.test(n) || n === 'branco' },
];

function ColorSwatches({ tokens, theme }: { tokens: Tokens; theme: 'dia' | 'noite' }) {
  return (
    <ThemePanel data-theme={theme}>
      <h3 className="h3" style={{ margin: 0 }}>
        {theme === 'dia' ? 'Dia' : 'Noite'}
      </h3>
      {colorGroups.map((group) => (
        <div key={group.title} style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <span className="overline" style={{ color: 'var(--earth-strong)' }}>
            {group.title}
          </span>
          <Grid $min="150px">
            {tokens.color.tokens
              .filter((t) => group.match(t.name))
              .map((t) => (
                <Swatch key={t.name} style={{ ['--c' as string]: `var(--${t.name})` }}>
                  <i />
                  <b>{t.name}</b>
                  <span>
                    {typeof t.value === 'string' ? t.value : (t.value[theme] ?? t.value.dia)}
                  </span>
                </Swatch>
              ))}
          </Grid>
        </div>
      ))}
    </ThemePanel>
  );
}

export function TokensView({ tokens }: { tokens: Tokens }) {
  const textStyles = tokens.type.groups.flatMap((g) => g.styles);
  return (
    <Page>
      <header>
        <p className="overline" style={{ color: 'var(--earth-strong)', margin: 0 }}>
          Desenvolvimento
        </p>
        <h1 className="h1" style={{ margin: '8px 0' }}>
          Tokens
        </h1>
        <Muted className="lead">
          Gerado de tokens.json por scripts/build-tokens.ts. Esta página não existe em produção.
        </Muted>
      </header>

      <Block>
        <h2 className="h2" style={{ margin: 0 }}>
          Cores — Dia e Noite
        </h2>
        <ColorSwatches tokens={tokens} theme="dia" />
        <ColorSwatches tokens={tokens} theme="noite" />
      </Block>

      <Block>
        <h2 className="h2" style={{ margin: 0 }}>
          Tipografia
        </h2>
        <div>
          {textStyles.map((s) => (
            <Row key={s.name}>
              <span className="caption" style={{ color: 'var(--ink-subtle)' }}>
                {s.name} · {s.fontSize}/{s.lineHeight} · {s.fontWeight}
              </span>
              <span className={s.name}>{s.sample}</span>
            </Row>
          ))}
        </div>
      </Block>

      <Block>
        <h2 className="h2" style={{ margin: 0 }}>
          Espaço, forma e sombras
        </h2>
        <Inline>
          {tokens.spacing.tokens.map((t) => (
            <Swatch key={t.name}>
              <Box $bg="var(--brand)" $size={t.value} style={{ height: 24 }} />
              <b>{t.name}</b>
              <span>{t.value}</span>
            </Swatch>
          ))}
        </Inline>
        <Inline>
          {tokens.radius.tokens.map((t) => (
            <Swatch key={t.name}>
              <Box $bg="var(--surface-raised)" $radius={`var(--${t.name})`} />
              <b>{t.name}</b>
              <span>{t.value}</span>
            </Swatch>
          ))}
        </Inline>
        <Inline>
          {tokens.shadow.tokens.map((t) => (
            <Swatch key={t.name}>
              <Box
                $bg="var(--surface-raised)"
                $radius="var(--radius-md)"
                $shadow={`var(--${t.name})`}
              />
              <b>{t.name}</b>
            </Swatch>
          ))}
        </Inline>
      </Block>

      <Block>
        <h2 className="h2" style={{ margin: 0 }}>
          Movimento
        </h2>
        <Muted>
          Passe o mouse ou foque (Tab) em cada trilha. Com reduced-motion o marcador não anda.
        </Muted>
        <h3 className="h4" style={{ margin: 0 }}>
          Durações (ease-standard)
        </h3>
        {tokens.duration.tokens
          .filter((t) => t.name !== 'dur-ambient')
          .map((t) => (
            <div key={t.name} style={{ display: 'grid', gap: 'var(--space-1)' }}>
              <span className="caption">
                {t.name} · {t.value} — {t.usage}
              </span>
              <Track
                $dur={t.name === 'stagger' ? 'var(--dur-slow)' : `var(--${t.name})`}
                $ease="var(--ease-standard)"
                aria-label={`Demonstrar ${t.name}`}
              >
                <i />
              </Track>
            </div>
          ))}
        <h3 className="h4" style={{ margin: 0 }}>
          Curvas (dur-slow)
        </h3>
        {tokens.easing.tokens.map((t) => (
          <div key={t.name} style={{ display: 'grid', gap: 'var(--space-1)' }}>
            <span className="caption">
              {t.name} · {t.value}
            </span>
            <Track
              $dur="var(--dur-slow)"
              $ease={`var(--${t.name})`}
              aria-label={`Demonstrar ${t.name}`}
            >
              <i />
            </Track>
          </div>
        ))}
        <h3 className="h4" style={{ margin: 0 }}>
          Distâncias
        </h3>
        <Inline>
          {tokens.distance.tokens.map((t) => (
            <Swatch key={t.name}>
              <Box $bg="var(--earth)" $size={t.value} style={{ height: 12 }} />
              <b>{t.name}</b>
              <span>{t.value}</span>
            </Swatch>
          ))}
        </Inline>
      </Block>
    </Page>
  );
}
