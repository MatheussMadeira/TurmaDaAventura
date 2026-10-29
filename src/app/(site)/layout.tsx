import type { ReactNode } from 'react';
import { SiteSettingsProvider } from '@/components/SiteSettings';
import { SkipLink } from '@/components/atoms/SkipLink';
import { Footer } from '@/components/organisms/Footer';
import { Header } from '@/components/organisms/Header';
import { WhatsAppFloat } from '@/components/organisms/WhatsAppFloat';
import { localBusinessJsonLd } from '@/lib/seo';
import { getSettings } from '@/server/content';

/* Header, rodapé e WhatsAppFloat ficam fixos; só o <main> (template.tsx) anima entre páginas. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();
  const jsonLd = JSON.stringify(localBusinessJsonLd(settings)).replace(/</g, '\u003c');

  return (
    <SiteSettingsProvider value={{ phone: settings.whatsapp, messages: settings.messages }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <SkipLink />
      <Header />
      {children}
      <Footer
        instagram={settings.instagram}
        email={settings.email || undefined}
        city={settings.city}
      />
      <WhatsAppFloat label="Fale com a gente" />
    </SiteSettingsProvider>
  );
}
