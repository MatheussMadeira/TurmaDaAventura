import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ActivityForm, EMPTY_ACTIVITY } from '@/admin/screens/ActivitiesScreens';
import { NoPermission } from '@/admin/ui/states';
import type { IconName } from '@/lib/iconNames';
import { getActivity, listCategories } from '@/server/admin/activities';
import { listLibrary } from '@/server/admin/library';
import { requirePageUser } from '@/server/auth/session';

export const metadata: Metadata = { title: 'Atividade' };
export const dynamic = 'force-dynamic';

export default async function ActivityEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await requirePageUser('activities');
  if (!allowed) return <NoPermission />;
  const { id } = await params;
  const [categories, library] = await Promise.all([listCategories(), listLibrary()]);
  const photos = library.map((p) => ({
    id: p.id,
    url: p.url,
    alt: p.alt,
    width: p.width,
    height: p.height,
  }));

  if (id === 'novo') {
    return (
      <ActivityForm id={null} initial={EMPTY_ACTIVITY} categories={categories} library={photos} />
    );
  }
  const a = await getActivity(id);
  if (!a) notFound();
  return (
    <ActivityForm
      id={a.id}
      status={a.status}
      categories={categories}
      library={photos}
      initial={{
        category: a.category,
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
