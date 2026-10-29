import type { ReactNode } from 'react';
import { SkipLink } from '@/components/atoms/SkipLink';
import { Footer } from '@/components/organisms/Footer';
import { Header } from '@/components/organisms/Header';
import { WhatsAppFloat } from '@/components/organisms/WhatsAppFloat';
import { getContact } from '@/lib/content';
import { localBusinessJsonLd } from '@/lib/seo';

/* Header, rodapé e WhatsAppFloat ficam fixos; só o <main> (template.tsx) anima entre páginas. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  const contact = getContact();
  const jsonLd = JSON.stringify(localBusinessJsonLd(contact)).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <SkipLink />
      <Header />
      {children}
      <Footer
        instagram={contact.instagram}
        email={contact.email || undefined}
        city={contact.cidade}
      />
      <WhatsAppFloat label="Fale com a gente" />
    </>
  );
}
