import type { Metadata } from 'next';
import type { SiteSettings } from '@/content/types';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
);
export const SITE_NAME = 'Turma da Aventura';

/** Open Graph com o logo completo (arquivo de public/brand, sem alteração: 1600×659). */
const OG_IMAGE = {
  url: '/brand/turma-da-aventura-logo.png',
  width: 1600,
  height: 659,
  alt: 'Turma da Aventura — Brincar / Aprender / Ensinar',
};

interface PageMeta {
  /** título curto da página (o layout acrescenta "· Turma da Aventura") */
  title: string;
  description: string;
  path: string;
  /** título completo, sem o sufixo (Início) */
  absoluteTitle?: string;
}

export function pageMetadata({ title, description, path, absoluteTitle }: PageMeta): Metadata {
  const fullTitle = absoluteTitle ?? `${title} · ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url: path,
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [OG_IMAGE.url] },
  };
}

/** JSON-LD LocalBusiness. Telefone só entra quando o número real estiver configurado (não o placeholder). */
export function localBusinessJsonLd(contact: SiteSettings) {
  const [city, region] = contact.city.split('·').map((s) => s.trim());
  const realPhone = contact.whatsapp !== '5500000000000';
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_NAME,
    description:
      'Recreação infantil para festas, restaurantes, eventos corporativos e oficinas em Belo Horizonte, com monitores treinados e atividades por faixa etária.',
    url: SITE_URL,
    image: `${SITE_URL}${OG_IMAGE.url}`,
    logo: `${SITE_URL}${OG_IMAGE.url}`,
    ...(realPhone ? { telephone: `+${contact.whatsapp}` } : {}),
    ...(contact.email ? { email: contact.email } : {}),
    sameAs: [`https://instagram.com/${contact.instagram.replace('@', '')}`],
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      ...(region ? { addressRegion: region } : {}),
      addressCountry: 'BR',
    },
    areaServed: { '@type': 'City', name: city },
    knowsAbout: [
      'Recreação infantil',
      'Festas e aniversários infantis',
      'Oficinas infantis',
      'Eventos corporativos com espaço kids',
    ],
  };
}

/**
 * JSON-LD da lista de produtos (ItemList → Product). SEM `offers`/preço: o pedido é combinado
 * pelo WhatsApp e o site não vende nada.
 */
export function productsJsonLd(
  products: {
    name: string;
    description: string;
    categoryLabel: string;
    image: { src: string } | null;
  }[],
) {
  const abs = (src: string) => (/^https?:\/\//.test(src) ? src : `${SITE_URL}${src}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Produtos da Turma da Aventura',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        description: p.description,
        category: p.categoryLabel,
        url: `${SITE_URL}/produtos`,
        ...(p.image ? { image: abs(p.image.src) } : {}),
        brand: { '@type': 'Brand', name: SITE_NAME },
      },
    })),
  };
}
