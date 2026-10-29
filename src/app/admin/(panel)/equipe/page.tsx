import type { Metadata } from 'next';
import { TeamList } from '@/admin/screens/TeamScreens';
import { NoPermission } from '@/admin/ui/states';
import { listTeam } from '@/server/admin/team';
import { requirePageUser } from '@/server/auth/session';

export const metadata: Metadata = { title: 'Equipe' };
export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const { allowed } = await requirePageUser('team');
  if (!allowed) return <NoPermission />;
  const rows = await listTeam();
  return <TeamList rows={rows} />;
}
