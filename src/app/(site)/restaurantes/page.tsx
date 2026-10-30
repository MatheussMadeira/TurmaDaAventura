import type { Metadata } from 'next';
import { getPublishedPage, getRestaurants } from '@/server/content';
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
  const [page, restaurants] = await Promise.all([
    getPublishedPage('restaurantes'),
    getRestaurants(),
  ]);
  return <>{renderSections(page, restaurantesRenderers, { restaurants })}</>;
}
