import type { Metadata } from 'next';
import { getPartyThemes, getPublishedPage } from '@/server/content';
import { festasRenderers } from '@/site/pages/festas';
import { findContent, metaDescription, renderSections } from '@/site/render';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPage('festas-e-aniversarios');
  return pageMetadata({
    title: 'Festas e aniversários',
    description: metaDescription(findContent<'hero'>(page, 'hero')?.lead ?? ''),
    path: '/festas-e-aniversarios',
  });
}

export default async function FestasPage() {
  const [page, themes] = await Promise.all([
    getPublishedPage('festas-e-aniversarios'),
    getPartyThemes(),
  ]);
  return <>{renderSections(page, festasRenderers, { themes })}</>;
}
