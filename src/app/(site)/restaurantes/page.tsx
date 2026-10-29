import type { Metadata } from 'next';
import { getPublishedPage, getRestaurantGroups } from '@/server/content';
import { restaurantesRenderers } from '@/site/pages/restaurantes';
import { findContent, metaDescription, renderSections } from '@/site/render';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPage('restaurantes');
  return pageMetadata({
    title: 'Restaurantes',
    description: metaDescription(findContent<'intro'>(page, 'intro')?.description ?? ''),
    path: '/restaurantes',
  });
}

export default async function RestaurantesPage() {
  const [page, groups] = await Promise.all([
    getPublishedPage('restaurantes'),
    getRestaurantGroups(),
  ]);
  return <>{renderSections(page, restaurantesRenderers, { groups })}</>;
}
