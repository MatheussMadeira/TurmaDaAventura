import type { Metadata } from 'next';
import { ContactScreen } from '@/admin/screens/ContactScreen';
import { NoPermission } from '@/admin/ui/states';
import { getSettingsForm } from '@/server/admin/settings';
import { requirePageUser } from '@/server/auth/session';

export const metadata: Metadata = { title: 'Contato e WhatsApp' };
export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const { allowed } = await requirePageUser('contact');
  if (!allowed) return <NoPermission />;
  return <ContactScreen initial={await getSettingsForm()} />;
}
