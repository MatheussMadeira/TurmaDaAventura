import 'server-only';
import type { MediaVariant } from '../media';
import { db } from '../db';

export interface LibraryItem {
  id: string;
  url: string;
  width: number;
  height: number;
  alt: string;
  createdAt: Date;
  /** onde a foto é usada: "Restaurante Cantina do Bosque", "Início › galeria"… */
  usedIn: string[];
  variants: MediaVariant[];
}

/** Biblioteca de fotos com o cálculo de uso (restaurantes, atividades, equipe e seções das páginas). */
export async function listLibrary(): Promise<LibraryItem[]> {
  const [media, restaurants, activities, themes, team, sections] = await Promise.all([
    db.media.findMany({ orderBy: { createdAt: 'desc' } }),
    db.restaurant.findMany({
      where: { imageId: { not: null } },
      select: { name: true, imageId: true },
    }),
    db.activity.findMany({
      where: { imageId: { not: null } },
      select: { title: true, imageId: true },
    }),
    db.partyTheme.findMany({
      where: { imageId: { not: null } },
      select: { title: true, imageId: true },
    }),
    db.teamMember.findMany({
      where: { photoId: { not: null } },
      select: { name: true, photoId: true },
    }),
    db.section.findMany({
      select: { key: true, draft: true, published: true, page: { select: { title: true } } },
    }),
  ]);

  const sectionText = sections.map((s) => ({
    where: `${s.page.title} › ${s.key}`,
    text: JSON.stringify(s.draft) + JSON.stringify(s.published ?? ''),
  }));

  return media.map((m) => {
    const usedIn: string[] = [];
    for (const r of restaurants) if (r.imageId === m.id) usedIn.push(`Restaurante ${r.name}`);
    for (const a of activities) if (a.imageId === m.id) usedIn.push(`Atividade ${a.title}`);
    for (const t of themes) if (t.imageId === m.id) usedIn.push(`Tema de festa ${t.title}`);
    for (const t of team) if (t.photoId === m.id) usedIn.push(`Equipe ${t.name}`);
    for (const s of sectionText) if (s.text.includes(`"${m.id}"`)) usedIn.push(s.where);
    return {
      id: m.id,
      url: m.url,
      width: m.width,
      height: m.height,
      alt: m.alt,
      createdAt: m.createdAt,
      usedIn,
      variants: m.variants as unknown as MediaVariant[],
    };
  });
}
