'use client';

import { LogoImage, LogoLink } from './Logo.styles';

export type LogoVariant = 'full' | 'compact' | 'symbol' | 'paw';
export type LogoTone = 'green' | 'white' | 'auto';

export interface LogoProps {
  /** full = com slogan (rodapé, páginas institucionais) · compact = sem slogan (header) · symbol = só pegadas (favicon, avatar) · paw = só a pata (decoração) */
  variant?: LogoVariant;
  /** auto = verde no tema Dia e branco no tema Noite */
  tone?: LogoTone;
  /** altura em px; largura segue a proporção */
  height?: number;
  href?: string;
  /** URLs próprias por chave "<variant>-<tone>" */
  sources?: Partial<Record<string, string>>;
  className?: string;
}

/* Arquivos de public/brand (design-system/brand), sem alteração. */
export const LOGO_SOURCES: Record<`${LogoVariant}-${'green' | 'white'}`, string> = {
  'full-green': '/brand/turma-da-aventura-logo.svg',
  'full-white': '/brand/turma-da-aventura-logo-branco.svg',
  'compact-green': '/brand/logo-sem-tagline.svg',
  'compact-white': '/brand/logo-sem-tagline-branco.svg',
  'symbol-green': '/brand/simbolo-pegadas.svg',
  'symbol-white': '/brand/simbolo-pegadas-branco.svg',
  'paw-green': '/brand/pata.svg',
  'paw-white': '/brand/pata-branco.svg',
};

const RATIO: Record<LogoVariant, number> = {
  full: 1600 / 659,
  compact: 1600 / 548,
  symbol: 480 / 476,
  paw: 234 / 290,
};

export function Logo({
  variant = 'compact',
  tone = 'green',
  height = 48,
  href,
  sources,
  className,
}: LogoProps) {
  const alt = variant === 'paw' ? '' : 'Turma da Aventura';
  const width = Math.round(height * RATIO[variant]);

  const one = (t: 'green' | 'white', decorative = false) => (
    <LogoImage
      key={t}
      src={sources?.[`${variant}-${t}`] ?? LOGO_SOURCES[`${variant}-${t}`]}
      alt={decorative ? '' : alt}
      aria-hidden={decorative || undefined}
      width={width}
      height={height}
      $height={height}
      $auto={tone === 'auto' ? (t === 'green' ? 'light' : 'dark') : undefined}
      className={className}
      priority={variant === 'compact' && !decorative}
    />
  );

  /* tone 'auto': verde no tema Dia, branco no Noite — a troca é por CSS, sem JS. */
  const img = tone === 'auto' ? [one('green'), one('white', true)] : one(tone);

  return href ? (
    <LogoLink href={href} aria-label="Turma da Aventura — início">
      {img}
    </LogoLink>
  ) : (
    <>{img}</>
  );
}
