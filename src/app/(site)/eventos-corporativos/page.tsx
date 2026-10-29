import type { Metadata } from 'next';
import { getPublishedPage } from '@/server/content';
import { eventosRenderers } from '@/site/pages/eventos';
import { findContent, metaDescription, renderSections } from '@/site/render';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPage('eventos-corporativos');
  return pageMetadata({
    title: 'Eventos corporativos',
    description: metaDescription(findContent<'hero'>(page, 'hero')?.lead ?? ''),
    path: '/eventos-corporativos',
  });
}

export default async function EventosCorporativosPage() {
  const page = await getPublishedPage('eventos-corporativos');
  return <>{renderSections(page, eventosRenderers, {})}</>;
}
