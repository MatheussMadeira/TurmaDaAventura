import type { Metadata } from 'next';
import { NoPermission } from '@/admin/ui/states';
import { RestaurantsList } from '@/admin/screens/RestaurantsList';
import { listRestaurants } from '@/server/admin/restaurants';
import { requirePageUser } from '@/server/auth/session';

export const metadata: Metadata = { title: 'Restaurantes' };
export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'ativos', label: 'Ativos', match: (s: string) => s === 'PUBLICADO' },
  { key: 'rascunhos', label: 'Rascunhos', match: (s: string) => s === 'RASCUNHO' },
  { key: 'pausados', label: 'Pausados', match: (s: string) => s === 'PAUSADO' },
  { key: 'todos', label: 'Todos', match: () => true },
] as const;

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>;
}) {
  const { allowed } = await requirePageUser('restaurants');
  if (!allowed) return <NoPermission />;

  const { aba } = await searchParams;
  const active = TABS.find((t) => t.key === aba) ?? TABS[0];
  const all = await listRestaurants();

  return (
    <RestaurantsList
      total={all.length}
      rows={all.filter((r) => active.match(r.status))}
      tabs={TABS.map((t) => ({
        href: `/admin/restaurantes?aba=${t.key}`,
        label: t.label,
        count: all.filter((r) => t.match(r.status)).length,
        active: t.key === active.key,
      }))}
    />
  );
}
