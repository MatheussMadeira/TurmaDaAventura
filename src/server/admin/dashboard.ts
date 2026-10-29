import 'server-only';
import { db } from '../db';

export interface Pending {
  text: string;
  href: string;
}

/** Números do painel, itens a conferir e últimas alterações. */
export async function getDashboard() {
  const [pages, restaurants, activities, team, photos, regions, categories, recent, lastPublish] =
    await Promise.all([
      db.page.count(),
      db.restaurant.groupBy({ by: ['status'], _count: true }),
      db.activity.groupBy({ by: ['status'], _count: true }),
      db.teamMember.count({ where: { visible: true } }),
      db.media.count(),
      db.region.count(),
      db.activity.findMany({
        where: { status: 'PUBLICADO' },
        distinct: ['category'],
        select: { category: true },
      }),
      db.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: { user: { select: { name: true } } },
      }),
      db.auditLog.findFirst({ where: { action: 'publish' }, orderBy: { createdAt: 'desc' } }),
    ]);

  const count = (rows: { status: string; _count: number }[], s: string) =>
    rows.find((r) => r.status === s)?._count ?? 0;

  // itens a conferir
  const [noPhotoRestaurants, noSchedule, noPhotoActivities] = await Promise.all([
    db.restaurant.count({ where: { status: 'PUBLICADO', imageId: null } }),
    db.restaurant.count({ where: { status: 'PUBLICADO', schedule: '' } }),
    db.activity.count({ where: { status: 'PUBLICADO', imageId: null } }),
  ]);

  const pending: Pending[] = [];
  if (noSchedule) {
    pending.push({
      text: `${noSchedule} ${noSchedule === 1 ? 'restaurante está' : 'restaurantes estão'} sem horário de recreação`,
      href: '/admin/restaurantes',
    });
  }
  if (noPhotoRestaurants) {
    pending.push({
      text: `${noPhotoRestaurants} ${noPhotoRestaurants === 1 ? 'restaurante está' : 'restaurantes estão'} sem foto (aparece o placeholder)`,
      href: '/admin/restaurantes',
    });
  }
  if (noPhotoActivities) {
    pending.push({
      text: `${noPhotoActivities} ${noPhotoActivities === 1 ? 'atividade está' : 'atividades estão'} sem foto`,
      href: '/admin/atividades',
    });
  }
  const restDrafts = count(restaurants, 'RASCUNHO');
  if (restDrafts) {
    pending.push({
      text: `${restDrafts} ${restDrafts === 1 ? 'restaurante em rascunho' : 'restaurantes em rascunho'} (fora do site)`,
      href: '/admin/restaurantes?aba=rascunhos',
    });
  }

  return {
    pages,
    lastPublishAt: lastPublish?.createdAt ?? null,
    restaurantsActive: count(restaurants, 'PUBLICADO'),
    regions,
    activitiesPublished: count(activities, 'PUBLICADO'),
    categories: categories.length,
    team,
    photos,
    pending,
    recent: recent.map((r) => ({
      id: r.id,
      summary: r.summary,
      entity: r.entity,
      who: r.user?.name ?? 'Sistema',
      at: r.createdAt,
      published: r.published,
    })),
  };
}
