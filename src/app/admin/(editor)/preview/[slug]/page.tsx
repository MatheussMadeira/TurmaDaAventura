import { notFound } from 'next/navigation';
import { SiteSettingsProvider } from '@/components/SiteSettings';
import { Footer } from '@/components/organisms/Footer';
import { Header } from '@/components/organisms/Header';
import { PreviewClient } from '@/admin/editor/PreviewClient';
import { requirePageUser } from '@/server/auth/session';
import { getSettings } from '@/server/content';
import { loadEditorPage, loadPreviewData } from '@/server/admin/editor';

export const dynamic = 'force-dynamic';

/**
 * A página real em modo edição, para o <iframe> do editor. Lê o RASCUNHO (nunca o publicado),
 * só para quem tem sessão válida e a permissão "site" — conferidas no banco a cada abertura.
 * (Em vez de draftMode(), o próprio login do painel é o portão: não há cookie de rascunho para vazar.)
 */
export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { allowed } = await requirePageUser('site');
  if (!allowed) notFound();
  const { slug } = await params;
  const page = await loadEditorPage(slug);
  if (!page) notFound();

  const [data, settings] = await Promise.all([loadPreviewData(slug), getSettings()]);
  return (
    <SiteSettingsProvider value={{ phone: settings.whatsapp, messages: settings.messages }}>
      <Header />
      <main id="conteudo">
        <PreviewClient slug={slug} sections={page.sections} media={page.media} data={data} />
      </main>
      <Footer
        instagram={settings.instagram}
        email={settings.email || undefined}
        city={settings.city}
      />
    </SiteSettingsProvider>
  );
}
