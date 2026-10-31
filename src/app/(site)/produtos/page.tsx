import type { Metadata } from 'next';
import { getProducts, getPublishedPage } from '@/server/content';
import { produtosRenderers } from '@/site/pages/produtos';
import { findContent, metaDescription, renderSections } from '@/site/render';
import { pageMetadata, productsJsonLd } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPage('produtos');
  return pageMetadata({
    title: 'Produtos',
    description: metaDescription(findContent<'products-intro'>(page, 'intro')?.description ?? ''),
    path: '/produtos',
  });
}

export default async function ProdutosPage() {
  const [page, products] = await Promise.all([getPublishedPage('produtos'), getProducts()]);
  const jsonLd = JSON.stringify(productsJsonLd(products)).replace(/</g, '<');
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      {renderSections(page, produtosRenderers, { products })}
    </>
  );
}
