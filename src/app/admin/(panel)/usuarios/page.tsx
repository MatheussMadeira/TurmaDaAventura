import type { Metadata } from 'next';
import { UsersScreen } from '@/admin/screens/UsersScreen';
import { NoPermission } from '@/admin/ui/states';
import { requirePageUser } from '@/server/auth/session';
import { listUsers } from '@/server/users';

export const metadata: Metadata = { title: 'Usuários' };
export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const { user, allowed } = await requirePageUser('users');
  if (!allowed) return <NoPermission />; // checado no servidor: o menu escondido não é a proteção
  const users = await listUsers();
  return (
    <UsersScreen
      meId={user.id}
      users={users.map((u) => ({ ...u, lastLoginAt: u.lastLoginAt?.toISOString() ?? null }))}
    />
  );
}
