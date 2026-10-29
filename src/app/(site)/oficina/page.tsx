import type { Metadata } from 'next';
import { getActivities, getActivityCategories, getPublishedPage } from '@/server/content';
import { oficinaRenderers } from '@/site/pages/oficina';
import { findContent, metaDescription, renderSections } from '@/site/render';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPage('oficina');
  return pageMetadata({
    title: 'Oficina',
    description: metaDescription(findContent<'hero'>(page, 'hero')?.lead ?? ''),
    path: '/oficina',
  });
}

export default async function OficinaPage() {
  const [page, activities, categories] = await Promise.all([
    getPublishedPage('oficina'),
    getActivities(),
    getActivityCategories(),
  ]);
  return <>{renderSections(page, oficinaRenderers, { activities, categories })}</>;
}
