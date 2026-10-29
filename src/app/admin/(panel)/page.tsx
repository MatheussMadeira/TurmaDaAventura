import type { Metadata } from 'next';
import { Dashboard } from '@/admin/screens/Dashboard';
import { requirePageUser } from '@/server/auth/session';
import { getDashboard } from '@/server/admin/dashboard';

export const metadata: Metadata = { title: 'Painel' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { user } = await requirePageUser();
  const d = await getDashboard();
  return (
    <Dashboard
      data={{
        firstName: user.name.split(' ')[0] ?? user.name,
        role: user.role,
        pages: d.pages,
        lastPublishAt: d.lastPublishAt?.toISOString() ?? null,
        restaurantsActive: d.restaurantsActive,
        regions: d.regions,
        activitiesPublished: d.activitiesPublished,
        categories: d.categories,
        pending: d.pending,
        recent: d.recent.map((r) => ({ ...r, at: r.at.toISOString() })),
      }}
    />
  );
}
