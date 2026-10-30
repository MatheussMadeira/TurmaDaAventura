'use client';

import Link from 'next/link';
import { trackWhatsappClick } from '@/lib/analytics';
import { FOOTER_ITEMS, type NavItem } from '@/lib/nav';
import { whatsappUrl } from '@/lib/whatsapp';
import { Icon } from '../../atoms/Icon';
import { Logo } from '../../atoms/Logo';
import { useSiteSettings } from '../../SiteSettings';
import { About, Bottom, Brand, Heading, Inner, LinkList, Root } from './Footer.styles';

export interface FooterProps {
  items?: NavItem[];
  about?: string;
  phone?: string;
  phoneLabel?: string;
  instagram?: string;
  email?: string;
  city?: string;
  year?: number;
  className?: string;
}

const DEFAULT_ABOUT =
  'Recreação infantil para festas, restaurantes, eventos corporativos e oficinas em Belo Horizonte. Monitores treinados, brincadeiras ao ar livre e muita imaginação.';

export function Footer({
  items = FOOTER_ITEMS,
  about = DEFAULT_ABOUT,
  phone,
  phoneLabel = 'WhatsApp',
  instagram,
  email,
  city,
  year = new Date().getFullYear(),
  className,
}: FooterProps) {
  const settings = useSiteSettings();
  return (
    <Root className={className}>
      <Inner>
        <Brand>
          <Logo variant="full" tone="white" height={120} />
          <About className="body-sm">{about}</About>
        </Brand>
        <nav aria-label="Rodapé">
          <Heading className="overline">Navegue</Heading>
          <LinkList>
            {items.map((it) => (
              <li key={it.href}>
                <Link href={it.href}>{it.label}</Link>
              </li>
            ))}
          </LinkList>
        </nav>
        <div>
          <Heading className="overline">Fale com a gente</Heading>
          <LinkList>
            <li>
              <a
                href={whatsappUrl('Olá! Vim pelo site.', phone ?? settings.phone)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackWhatsappClick({ page: window.location.pathname, placement: 'footer' })
                }
              >
                <Icon name="whatsapp" size={18} />
                {phoneLabel}
              </a>
            </li>
            {instagram ? (
              <li>
                <a
                  href={`https://instagram.com/${instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="instagram" size={18} />
                  {instagram}
                </a>
              </li>
            ) : null}
            {email ? (
              <li>
                <a href={`mailto:${email}`}>
                  <Icon name="mail" size={18} />
                  {email}
                </a>
              </li>
            ) : null}
            {city ? (
              <li>
                <span>
                  <Icon name="map-pin" size={18} />
                  {city}
                </span>
              </li>
            ) : null}
          </LinkList>
        </div>
      </Inner>
      <Bottom>
        <p className="tagline">Brincar / Aprender / Ensinar</p>
        <p className="caption">© {year} Turma da Aventura</p>
      </Bottom>
    </Root>
  );
}
