import type { Metadata } from 'next';
import { PhotosScreen } from '@/admin/screens/PhotosScreen';
import { NoPermission } from '@/admin/ui/states';
import { listLibrary } from '@/server/admin/library';
import { requirePageUser } from '@/server/auth/session';

export const metadata: Metadata = { title: 'Fotos' };
export const dynamic = 'force-dynamic';

const FILTERS = [
  { key: 'todas', label: 'Todas', match: () => true },
  { key: 'sem-descricao', label: 'Sem descrição', match: (alt: string) => alt.trim().length < 5 },
  { key: 'usadas', label: 'Usadas no site', match: () => true },
  { key: 'nao-usadas', label: 'Não usadas', match: () => true },
] as const;

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { allowed } = await requirePageUser('photos');
  if (!allowed) return <NoPermission />;
  const { filtro } = await searchParams;
  const active = FILTERS.find((f) => f.key === filtro) ?? FILTERS[0];
  const all = await listLibrary();

  const matches = (key: string, p: (typeof all)[number]) =>
    key === 'sem-descricao'
      ? p.alt.trim().length < 5
      : key === 'usadas'
        ? p.usedIn.length > 0
        : key === 'nao-usadas'
          ? p.usedIn.length === 0
          : true;

  return (
    <PhotosScreen
      photos={all
        .filter((p) => matches(active.key, p))
        .map((p) => ({
          id: p.id,
          url: p.url,
          alt: p.alt,
          width: p.width,
          height: p.height,
          usedIn: p.usedIn,
        }))}
      tabs={FILTERS.map((f) => ({
        href: `/admin/fotos?filtro=${f.key}`,
        label: f.label,
        count: all.filter((p) => matches(f.key, p)).length,
        active: f.key === active.key,
      }))}
    />
  );
}
