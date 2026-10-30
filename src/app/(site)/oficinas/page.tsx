import type { Metadata } from 'next';
import { getActivities, getActivityCategories, getPublishedPage } from '@/server/content';
import { oficinasRenderers } from '@/site/pages/oficinas';
import { findContent, metaDescription, renderSections } from '@/site/render';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPage('oficinas');
  return pageMetadata({
    title: 'Oficinas',
    description: metaDescription(findContent<'hero'>(page, 'hero')?.lead ?? ''),
    path: '/oficinas',
  });
}

export default async function OficinasPage() {
  const [page, activities, categories] = await Promise.all([
    getPublishedPage('oficinas'),
    getActivities(),
    getActivityCategories(),
  ]);
  return <>{renderSections(page, oficinasRenderers, { activities, categories })}</>;
}
