/**
 * Fumaça real do upload: gera uma foto com EXIF/GPS, envia ao Vercel Blob, confere os arquivos e remove.
 *   NODE_OPTIONS=--conditions=react-server npx tsx scripts/smoke-media.ts
 */
import { config } from 'dotenv';
import sharp from 'sharp';

config({ path: '.env.local' });

async function main() {
  const { uploadImage, deleteMedia, mediaUsage } = await import('../src/server/media');
  const { db } = await import('../src/server/db');

  const photo = await sharp({
    create: { width: 1800, height: 1200, channels: 3, background: { r: 31, g: 99, b: 42 } },
  })
    .jpeg()
    .withExif({ IFD0: { Copyright: 'Teste' }, IFD3: { GPSLatitudeRef: 'S', GPSLongitudeRef: 'W' } })
    .toBuffer();

  const media = await uploadImage({
    file: photo,
    alt: 'Foto de teste do upload (será removida)',
    authorizationConfirmed: true,
  });
  console.log('Media criada:', media.id, `${media.width}x${media.height}`);
  console.log('variantes:', (media.variants as { width: number }[]).map((v) => v.width).join(', '));

  const blobGet = (await import('@vercel/blob')).get;
  const got = await blobGet(media.pathname, {
    access: (await import('../src/lib/mediaUrl')).BLOB_ACCESS,
  });
  const res = new Response(got!.stream, {
    headers: { 'content-type': got!.blob.contentType ?? 'image/webp' },
  });
  const bytes = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(bytes).metadata();
  console.log(
    'GET master:',
    res.status,
    res.headers.get('content-type'),
    `${bytes.length} bytes`,
    '| formato',
    meta.format,
    '| exif',
    meta.exif ? 'PRESENTE' : 'ausente',
  );
  console.log('uso:', JSON.stringify(await mediaUsage(media.id)));

  await deleteMedia(media.id);
  const after = {
    status: (await blobGet(media.pathname, {
      access: (await import('../src/lib/mediaUrl')).BLOB_ACCESS,
    }))
      ? 200
      : 404,
  };
  console.log(
    'após remover: GET',
    after.status,
    '| registro',
    (await db.media.findUnique({ where: { id: media.id } })) ? 'ainda existe' : 'removido',
  );
  await db.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
