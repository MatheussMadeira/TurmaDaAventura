import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EMPTY_MEMBER, TeamForm } from '@/admin/screens/TeamScreens';
import { NoPermission } from '@/admin/ui/states';
import { listLibrary } from '@/server/admin/library';
import { getMember } from '@/server/admin/team';
import { requirePageUser } from '@/server/auth/session';

export const metadata: Metadata = { title: 'Pessoa da equipe' };
export const dynamic = 'force-dynamic';

export default async function MemberEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await requirePageUser('team');
  if (!allowed) return <NoPermission />;
  const { id } = await params;
  const library = (await listLibrary()).map((p) => ({
    id: p.id,
    url: p.url,
    alt: p.alt,
    width: p.width,
    height: p.height,
  }));
  if (id === 'novo') return <TeamForm id={null} initial={EMPTY_MEMBER} library={library} />;
  const m = await getMember(id);
  if (!m) notFound();
  return (
    <TeamForm
      id={m.id}
      library={library}
      initial={{
        nickname: m.nickname,
        name: m.name,
        role: m.role,
        bio: m.bio,
        badges: m.badges.join(', '),
        photoId: m.photoId,
        visible: m.visible,
      }}
    />
  );
}
