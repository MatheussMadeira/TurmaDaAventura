import type { Metadata } from 'next';
import { safeNext } from '@/lib/adminAuth';
import { LoginScreen } from '@/admin/screens/LoginScreen';

export const metadata: Metadata = { title: 'Entrar' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <LoginScreen next={safeNext(next) ?? undefined} />;
}
