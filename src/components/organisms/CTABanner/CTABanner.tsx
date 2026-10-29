'use client';

import { Reveal } from '@/motion/Reveal';
import { CamoBackdrop } from '../../atoms/CamoPattern';
import { Logo } from '../../atoms/Logo';
import { WhatsAppButton } from '../../molecules/WhatsAppButton';
import { Copy, Inner, Root, Symbol, Text, Title } from './CTABanner.styles';

export interface CTABannerProps {
  title?: string;
  text?: string;
  ctaLabel?: string;
  phone?: string;
  message?: string;
  className?: string;
}

export function CTABanner({ title, text, ctaLabel, phone, message, className }: CTABannerProps) {
  return (
    <Reveal effect="scale" className={className}>
      <Root>
        <CamoBackdrop tone="forest" id="cta" />
        <Inner>
          <Symbol aria-hidden>
            <Logo variant="symbol" tone="white" height={112} />
          </Symbol>
          <Copy>
            <Title className="h2">{title ?? 'Bora planejar a próxima aventura?'}</Title>
            {text ? <Text className="lead">{text}</Text> : null}
          </Copy>
          <WhatsAppButton
            size="lg"
            variant="inverse"
            phone={phone}
            message={message}
            placement="cta"
          >
            {ctaLabel ?? 'Chamar no WhatsApp'}
          </WhatsAppButton>
        </Inner>
      </Root>
    </Reveal>
  );
}
