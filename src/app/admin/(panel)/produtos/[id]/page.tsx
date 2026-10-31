import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EMPTY_PRODUCT, ProductsScreen } from '@/admin/screens/ProductsScreens';
import { NoPermission } from '@/admin/ui/states';
import type { IconName } from '@/lib/iconNames';
import { listLibrary } from '@/server/admin/library';
import { getProduct, listProducts } from '@/server/admin/products';
import { requirePageUser } from '@/server/auth/session';

export const metadata: Metadata = { title: 'Produto' };
export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'todos', label: 'Todos' },
  { key: 'no-site', label: 'No site', status: 'PUBLICADO' },
  { key: 'rascunhos', label: 'Rascunhos', status: 'RASCUNHO' },
  { key: 'esgotados', label: 'Esgotados', status: 'ESGOTADO' },
] as const;

/** Lista + formulário lado a lado (editar ou novo), como no canvas AdminProdutos. */
export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await requirePageUser('activities');
  if (!allowed) return <NoPermission />;
  const { id } = await params;
  const [all, library] = await Promise.all([listProducts(), listLibrary()]);
  const photos = library.map((p) => ({
    id: p.id,
    url: p.url,
    alt: p.alt,
    width: p.width,
    height: p.height,
  }));

  const tabs = [TABS[1], TABS[2], TABS[3], TABS[0]].map((t) => ({
    href: `/admin/produtos?aba=${t.key}`,
    label: t.label,
    count: 'status' in t ? all.filter((r) => r.status === t.status).length : all.length,
    active: false,
  }));

  if (id === 'novo') {
    return (
      <ProductsScreen
        total={all.length}
        rows={all}
        tabs={tabs}
        editing={{ id: null, initial: EMPTY_PRODUCT, library: photos }}
      />
    );
  }
  const p = await getProduct(id);
  if (!p) notFound();
  return (
    <ProductsScreen
      total={all.length}
      rows={all}
      tabs={tabs}
      editing={{
        id: p.id,
        status: p.status,
        library: photos,
        initial: {
          name: p.name,
          category: p.category,
          icon: p.icon as IconName,
          description: p.description,
          minQty: String(p.minQty),
          personalizavel: p.personalizavel,
          nosRestaurantes: p.nosRestaurantes,
          imageId: p.imageId,
          imageAlt: p.imageAlt,
          visible: p.status !== 'RASCUNHO',
          soldOut: p.status === 'ESGOTADO',
        },
      }}
    />
  );
}
