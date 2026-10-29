import 'server-only';
import { del, put } from '@vercel/blob';
import { BLOB_ACCESS, mediaUrl } from '@/lib/mediaUrl';
import type { Media, Prisma } from '@/generated/prisma/client';
import { db } from './db';
import { processImage, type ImageSet } from './image';

export class MediaError extends Error {
  constructor(
    message: string,
    readonly code: 'alt-required' | 'authorization-required' | 'in-use' | 'not-found',
  ) {
    super(message);
    this.name = 'MediaError';
  }
}

export interface UploadInput {
  file: Buffer | Uint8Array;
  /** descrição da imagem — obrigatória (acessibilidade) */
  alt: string;
  /** a pessoa confirmou que tem autorização dos responsáveis pelas crianças da foto */
  authorizationConfirmed: boolean;
  userId?: string | null;
}

export interface MediaVariant {
  width: number;
  height: number;
  url: string;
  pathname: string;
}

const blobOptions = (contentType: string) =>
  ({
    access: BLOB_ACCESS,
    contentType,
    addRandomSuffix: false,
    allowOverwrite: false,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  }) as const;

/**
 * Valida, limpa (EXIF/GPS) e envia a foto ao Vercel Blob em vários tamanhos WebP; grava Media.
 * Chamar SÓ de código autenticado (Server Action / rota do admin).
 */
export async function uploadImage(input: UploadInput): Promise<Media> {
  const alt = input.alt.trim();
  if (alt.length < 5) {
    throw new MediaError(
      'Descreva a foto (mínimo de 5 caracteres) para quem usa leitor de tela.',
      'alt-required',
    );
  }
  if (!input.authorizationConfirmed) {
    throw new MediaError(
      'Confirme que tem autorização dos responsáveis pelas crianças da foto.',
      'authorization-required',
    );
  }

  const set: ImageSet = await processImage(input.file); // lança ImageError se inválida

  const id = crypto.randomUUID();
  const base = `media/${id}`;
  const masterPath = `${base}/master.webp`;
  const uploaded: string[] = [];
  try {
    const master = await put(masterPath, set.master.buffer, blobOptions('image/webp'));
    uploaded.push(master.pathname);
    const variants: MediaVariant[] = [];
    for (const v of set.variants) {
      const r = await put(`${base}/${v.width}.webp`, v.buffer, blobOptions('image/webp'));
      uploaded.push(r.pathname);
      variants.push({
        width: v.width,
        height: v.height,
        url: mediaUrl(r.pathname, r.url),
        pathname: r.pathname,
      });
    }
    return await db.media.create({
      data: {
        pathname: master.pathname,
        url: mediaUrl(master.pathname, master.url),
        width: set.master.width,
        height: set.master.height,
        variants: variants as unknown as Prisma.InputJsonValue,
        alt,
        authorizationConfirmed: true,
        createdById: input.userId ?? null,
      },
    });
  } catch (e) {
    // não deixa arquivos órfãos se algo falhar no meio
    if (uploaded.length) await del(uploaded).catch(() => undefined);
    throw e;
  }
}

/** Onde a foto é usada (para "Usada em…" e para bloquear a exclusão). */
export async function mediaUsage(id: string) {
  const [restaurants, activities, team, sections] = await Promise.all([
    db.restaurant.findMany({ where: { imageId: id }, select: { name: true } }),
    db.activity.findMany({ where: { imageId: id }, select: { title: true } }),
    db.teamMember.findMany({ where: { photoId: id }, select: { name: true } }),
    db.$queryRaw<{ key: string; slug: string }[]>`
      select s."key", p."slug" from "Section" s join "Page" p on p."id" = s."pageId"
      where s."draft"::text like ${`%"${id}"%`} or coalesce(s."published"::text, '') like ${`%"${id}"%`}`,
  ]);
  return {
    restaurants: restaurants.map((r) => r.name),
    activities: activities.map((a) => a.title),
    team: team.map((t) => t.name),
    sections: sections.map((s) => `${s.slug}/${s.key}`),
  };
}

/** Atualiza a descrição (obrigatória). */
export async function updateMediaAlt(id: string, alt: string) {
  const text = alt.trim();
  if (text.length < 5)
    throw new MediaError('A descrição precisa ter ao menos 5 caracteres.', 'alt-required');
  return db.media.update({ where: { id }, data: { alt: text } });
}

/** Remove a foto e os arquivos do Blob — recusa se ainda estiver em uso. */
export async function deleteMedia(id: string) {
  const media = await db.media.findUnique({ where: { id } });
  if (!media) throw new MediaError('Foto não encontrada.', 'not-found');
  const usage = await mediaUsage(id);
  if (Object.values(usage).some((l) => l.length)) {
    throw new MediaError(
      'Essa foto está em uso. Troque-a nos locais indicados antes de remover.',
      'in-use',
    );
  }
  const variants = (media.variants as unknown as MediaVariant[]).map((v) => v.pathname);
  await del([media.pathname, ...variants]);
  await db.media.delete({ where: { id } });
}
