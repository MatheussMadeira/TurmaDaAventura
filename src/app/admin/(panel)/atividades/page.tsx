import type { Metadata } from 'next';
import { ActivitiesList } from '@/admin/screens/ActivitiesScreens';
import { NoPermission } from '@/admin/ui/states';
import { listActivities } from '@/server/admin/activities';
import { requirePageUser } from '@/server/auth/session';

export const metadata: Metadata = { title: 'Atividades' };
export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'ativas', label: 'Ativas', match: (s: string) => s === 'PUBLICADO' },
  { key: 'rascunhos', label: 'Rascunhos', match: (s: string) => s === 'RASCUNHO' },
  { key: 'pausadas', label: 'Pausadas', match: (s: string) => s === 'PAUSADO' },
  { key: 'todas', label: 'Todas', match: () => true },
] as const;

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>;
}) {
  const { allowed } = await requirePageUser('activities');
  if (!allowed) return <NoPermission />;
  const { aba } = await searchParams;
  const active = TABS.find((t) => t.key === aba) ?? TABS[0];
  const all = await listActivities();
  return (
    <ActivitiesList
      total={all.length}
      rows={all.filter((r) => active.match(r.status))}
      tabs={TABS.map((t) => ({
        href: `/admin/atividades?aba=${t.key}`,
        label: t.label,
        count: all.filter((r) => t.match(r.status)).length,
        active: t.key === active.key,
      }))}
    />
  );
}
