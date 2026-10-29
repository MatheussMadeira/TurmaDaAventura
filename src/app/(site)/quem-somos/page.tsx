import type { Metadata } from 'next';
import { getPublishedPage, getTeam } from '@/server/content';
import { quemSomosRenderers } from '@/site/pages/quemSomos';
import { findContent, metaDescription, renderSections } from '@/site/render';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPage('quem-somos');
  return pageMetadata({
    title: 'Quem somos',
    description: metaDescription(findContent<'history'>(page, 'historia')?.lead ?? ''),
    path: '/quem-somos',
  });
}

export default async function QuemSomosPage() {
  const [page, team] = await Promise.all([getPublishedPage('quem-somos'), getTeam()]);
  return <>{renderSections(page, quemSomosRenderers, { team })}</>;
}
