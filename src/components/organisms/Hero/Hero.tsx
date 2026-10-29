'use client';

import type { ReactNode } from 'react';
import { CamoBackdrop } from '../../atoms/CamoPattern';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Logo } from '../../atoms/Logo';
import { Media } from '../../atoms/Media';
import { WhatsAppButton } from '../../molecules/WhatsAppButton';
import {
  Actions,
  Copy,
  Highlights,
  Inner,
  Lead,
  Overline,
  Paw,
  Root,
  Title,
  Visual,
} from './Hero.styles';

export interface HeroProps {
  title: ReactNode;
  overline?: string;
  lead?: ReactNode;
  image?: string;
  imageAlt?: string;
  variant?: 'light' | 'forest';
  ctaLabel?: string;
  phone?: string;
  message?: string;
  secondary?: { label: string; href: string };
  highlights?: string[];
  className?: string;
}

export function Hero({
  title,
  overline,
  lead,
  image,
  imageAlt,
  variant = 'light',
  ctaLabel,
  phone,
  message,
  secondary,
  highlights,
  className,
}: HeroProps) {
  const forest = variant === 'forest';
  let step = 0;
  const idx = () => ({ ['--i' as string]: step++ });

  return (
    <Root $forest={forest} className={className}>
      {forest ? <CamoBackdrop tone="forest" id="hero" /> : null}
      <Inner>
        <Copy>
          {overline ? (
            <Overline className="overline" $forest={forest} style={idx()}>
              {overline}
            </Overline>
          ) : null}
          <Title className="display" $forest={forest} style={idx()}>
            {title}
          </Title>
          {lead ? (
            <Lead className="lead" $forest={forest} style={idx()}>
              {lead}
            </Lead>
          ) : null}
          <Actions style={idx()}>
            <WhatsAppButton
              size="lg"
              phone={phone}
              message={message}
              variant={forest ? 'inverse' : 'primary'}
              placement="hero"
            >
              {ctaLabel ?? 'Pedir orçamento no WhatsApp'}
            </WhatsAppButton>
            {secondary ? (
              <Button
                size="lg"
                variant={forest ? 'ghost-inverse' : 'outline'}
                href={secondary.href}
                iconRight="arrow-right"
              >
                {secondary.label}
              </Button>
            ) : null}
          </Actions>
          {highlights?.length ? (
            <Highlights $forest={forest} style={idx()}>
              {highlights.map((t) => (
                <li key={t}>
                  <Icon name="check" size={18} />
                  {t}
                </li>
              ))}
            </Highlights>
          ) : null}
        </Copy>
        <Visual $forest={forest}>
          <Media
            src={image}
            alt={imageAlt}
            icon="tent"
            ratio="5 / 4"
            placeholderId="hero-m"
            priority
            sizes="(min-width: 1200px) 560px, 100vw"
          />
          <Paw $forest={forest} aria-hidden>
            <Logo variant="paw" tone={forest ? 'white' : 'auto'} height={100} />
          </Paw>
        </Visual>
      </Inner>
    </Root>
  );
}
