import type { Metadata } from 'next';
import { ThemesList } from '@/admin/screens/ThemesScreens';
import { NoPermission } from '@/admin/ui/states';
import { listThemes } from '@/server/admin/themes';
import { requirePageUser } from '@/server/auth/session';

export const metadata: Metadata = { title: 'Temas de festa' };
export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'ativos', label: 'Ativos', match: (s: string) => s === 'PUBLICADO' },
  { key: 'rascunhos', label: 'Rascunhos', match: (s: string) => s === 'RASCUNHO' },
  { key: 'pausados', label: 'Pausados', match: (s: string) => s === 'PAUSADO' },
  { key: 'todos', label: 'Todos', match: () => true },
] as const;

export default async function ThemesPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>;
}) {
  const { allowed } = await requirePageUser('activities');
  if (!allowed) return <NoPermission />;
  const { aba } = await searchParams;
  const active = TABS.find((t) => t.key === aba) ?? TABS[0];
  const all = await listThemes();
  return (
    <ThemesList
      total={all.length}
      rows={all.filter((r) => active.match(r.status))}
      tabs={TABS.map((t) => ({
        href: `/admin/temas?aba=${t.key}`,
        label: t.label,
        count: all.filter((r) => t.match(r.status)).length,
        active: t.key === active.key,
      }))}
    />
  );
}
