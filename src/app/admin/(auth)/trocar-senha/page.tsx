import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ChangePasswordScreen } from '@/admin/screens/ChangePasswordScreen';
import { getCurrentUser } from '@/server/auth/session';

export const metadata: Metadata = { title: 'Crie a sua senha' };

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');
  if (!user.mustChangePassword) redirect('/admin');
  return <ChangePasswordScreen name={user.name.split(' ')[0] ?? user.name} />;
}
