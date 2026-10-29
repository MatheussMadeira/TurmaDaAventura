import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EMPTY_RESTAURANT, RestaurantForm } from '@/admin/screens/RestaurantForm';
import { NoPermission } from '@/admin/ui/states';
import { getRestaurant, listRegions } from '@/server/admin/restaurants';
import { listLibrary } from '@/server/admin/library';
import { requirePageUser } from '@/server/auth/session';

export const metadata: Metadata = { title: 'Restaurante' };
export const dynamic = 'force-dynamic';

export default async function RestaurantEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { allowed } = await requirePageUser('restaurants');
  if (!allowed) return <NoPermission />;

  const { id } = await params;
  const [regions, library] = await Promise.all([listRegions(), listLibrary()]);
  const photos = library.map((p) => ({
    id: p.id,
    url: p.url,
    alt: p.alt,
    width: p.width,
    height: p.height,
  }));

  if (id === 'novo') {
    return (
      <RestaurantForm
        id={null}
        initial={{ ...EMPTY_RESTAURANT, regionId: regions[0]?.id ?? '' }}
        regions={regions}
        library={photos}
      />
    );
  }

  const r = await getRestaurant(id);
  if (!r) notFound();
  return (
    <RestaurantForm
      id={r.id}
      status={r.status}
      initial={{
        name: r.name,
        neighborhood: r.neighborhood,
        regionId: r.regionId,
        address: r.address,
        mapsUrl: r.mapsUrl,
        schedule: r.schedule,
        ages: r.ages,
        destaqueHome: r.destaqueHome,
        visible: r.status !== 'PAUSADO',
        imageId: r.imageId,
        imageAlt: r.imageAlt,
      }}
      regions={regions}
      library={photos}
    />
  );
}
