import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ThemeForm, EMPTY_THEME } from '@/admin/screens/ThemesScreens';
import { NoPermission } from '@/admin/ui/states';
import type { IconName } from '@/lib/iconNames';
import { getTheme } from '@/server/admin/themes';
import { listLibrary } from '@/server/admin/library';
import { requirePageUser } from '@/server/auth/session';

export const metadata: Metadata = { title: 'Tema de festa' };
export const dynamic = 'force-dynamic';

export default async function ThemeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await requirePageUser('activities');
  if (!allowed) return <NoPermission />;
  const { id } = await params;
  const library = await listLibrary();
  const photos = library.map((p) => ({
    id: p.id,
    url: p.url,
    alt: p.alt,
    width: p.width,
    height: p.height,
  }));

  if (id === 'novo') {
    return <ThemeForm id={null} initial={EMPTY_THEME} library={photos} />;
  }
  const a = await getTheme(id);
  if (!a) notFound();
  return (
    <ThemeForm
      id={a.id}
      status={a.status}
      library={photos}
      initial={{
        icon: a.icon as IconName,
        title: a.title,
        description: a.description,
        tags: a.tags.join(', '),
        imageId: a.imageId,
        imageAlt: a.imageAlt,
        visible: a.status !== 'PAUSADO',
      }}
    />
  );
}
