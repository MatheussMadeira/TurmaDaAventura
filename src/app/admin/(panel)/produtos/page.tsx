import type { Metadata } from 'next';
import { ProductsScreen } from '@/admin/screens/ProductsScreens';
import { NoPermission } from '@/admin/ui/states';
import { listProducts } from '@/server/admin/products';
import { requirePageUser } from '@/server/auth/session';

export const metadata: Metadata = { title: 'Produtos' };
export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'no-site', label: 'No site', match: (s: string) => s === 'PUBLICADO' },
  { key: 'rascunhos', label: 'Rascunhos', match: (s: string) => s === 'RASCUNHO' },
  { key: 'esgotados', label: 'Esgotados', match: (s: string) => s === 'ESGOTADO' },
  { key: 'todos', label: 'Todos', match: () => true },
] as const;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>;
}) {
  const { allowed } = await requirePageUser('activities');
  if (!allowed) return <NoPermission />;
  const { aba } = await searchParams;
  const active = TABS.find((t) => t.key === aba) ?? TABS[0];
  const all = await listProducts();
  return (
    <ProductsScreen
      total={all.length}
      rows={all.filter((r) => active.match(r.status))}
      editing={null}
      tabs={TABS.map((t) => ({
        href: `/admin/produtos?aba=${t.key}`,
        label: t.label,
        count: all.filter((r) => t.match(r.status)).length,
        active: t.key === active.key,
      }))}
    />
  );
}
