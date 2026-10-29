import type { Metadata } from 'next';
import type { SectionContent } from '@/content/sections/schemas';
import { getHomeRestaurants, getPublishedPage } from '@/server/content';
import { inicioRenderers } from '@/site/pages/inicio';
import { findContent, metaDescription, renderSections } from '@/site/render';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPage('inicio');
  const hero = findContent<'hero'>(page, 'hero') as SectionContent<'hero'> | undefined;
  return pageMetadata({
    title: 'Início',
    absoluteTitle: 'Turma da Aventura · Recreação infantil',
    description: metaDescription(hero?.lead ?? ''),
    path: '/',
  });
}

export default async function HomePage() {
  const [page, restaurants] = await Promise.all([getPublishedPage('inicio'), getHomeRestaurants()]);
  return <>{renderSections(page, inicioRenderers, { restaurants })}</>;
}
