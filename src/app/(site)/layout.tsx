import type { ReactNode } from 'react';
import { SiteSettingsProvider } from '@/components/SiteSettings';
import { SkipLink } from '@/components/atoms/SkipLink';
import { Footer } from '@/components/organisms/Footer';
import { Header } from '@/components/organisms/Header';
import { BagProvider, SiteFloat } from '@/components/organisms/Bag';
import { localBusinessJsonLd } from '@/lib/seo';
import { getSettings } from '@/server/content';

/* Header, rodapé e o botão flutuante (sacola ou WhatsApp) ficam fixos; só o <main> (template.tsx) anima entre páginas. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();
  const jsonLd = JSON.stringify(localBusinessJsonLd(settings)).replace(/</g, '\u003c');

  return (
    <SiteSettingsProvider value={{ phone: settings.whatsapp, messages: settings.messages }}>
      <BagProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
        <SkipLink />
        <Header />
        {children}
        <Footer
          instagram={settings.instagram}
          email={settings.email || undefined}
          city={settings.city}
        />
        <SiteFloat />
      </BagProvider>
    </SiteSettingsProvider>
  );
}
