import type { MetadataRoute } from 'next';
import { NAV_ITEMS } from '@/lib/nav';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return NAV_ITEMS.map((it) => ({
    url: `${SITE_URL}${it.href === '/' ? '' : it.href}`,
    changeFrequency: 'monthly',
    priority: it.href === '/' ? 1 : 0.8,
  }));
}
