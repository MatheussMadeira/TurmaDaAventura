import { get } from '@vercel/blob';
import { BLOB_ACCESS } from '@/lib/mediaUrl';

/**
 * Serve as fotos de um store PRIVADO do Vercel Blob (BLOB_ACCESS=private).
 * Só expõe o prefixo media/ (fotos cadastradas); qualquer outro caminho é 404.
 * As fotos são imutáveis (um id por upload), então o cache é longo.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const pathname = path.join('/');
  if (!/^media\/[A-Za-z0-9-]+\/(master|\d+)\.webp$/.test(pathname)) {
    return new Response('Não encontrado', { status: 404 });
  }

  const result = await get(pathname, { access: BLOB_ACCESS });
  if (!result || result.statusCode !== 200 || !result.stream) {
    return new Response('Não encontrado', { status: 404 });
  }
  return new Response(result.stream, {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
