import { cookies } from 'next/headers';
import { unstable_rethrow } from 'next/navigation';
import type { ReactNode } from 'react';
import { AdminShell } from '@/admin/ui/AdminShell';
import { SchemaOutdated } from '@/admin/ui/states';
import { isSchemaOutdated } from '@/lib/dbErrors';
import { requirePageUser } from '@/server/auth/session';
import { db } from '@/server/db';

async function load() {
  try {
    const { user } = await requirePageUser();
    const [restaurants, activities, team, photos] = await Promise.all([
      db.restaurant.count({ where: { status: 'PUBLICADO' } }),
      db.activity.count({ where: { status: 'PUBLICADO' } }),
      db.teamMember.count({ where: { visible: true } }),
      db.media.count(),
    ]);
    return { user, counts: { restaurants, activities, team, photos } };
  } catch (e) {
    unstable_rethrow(e); // redirects do requirePageUser
    if (isSchemaOutdated(e)) return null;
    throw e;
  }
}

/** Casca autenticada do painel: sessão e papel conferidos no banco a cada requisição. */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const data = await load();
  if (!data) {
    return (
      <main style={{ padding: 'var(--space-6)', maxWidth: 720, margin: '0 auto' }}>
        <SchemaOutdated />
      </main>
    );
  }
  const theme = (await cookies()).get('tda-theme')?.value === 'noite' ? 'noite' : 'dia';
  return (
    <AdminShell
      user={{ name: data.user.name, role: data.user.role }}
      initialTheme={theme}
      counts={data.counts}
    >
      {children}
    </AdminShell>
  );
}
