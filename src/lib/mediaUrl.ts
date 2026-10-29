/**
 * Como as fotos do Vercel Blob chegam ao navegador.
 *  - private (padrão): o store é privado; o site serve as fotos por /api/media/<pathname>
 *    (rota com cache longo/imutável). Os arquivos nunca ficam expostos fora do site.
 *  - public: o store é público; usa a URL direta do Blob (CDN do Vercel).
 * Defina BLOB_ACCESS conforme o tipo do store criado.
 */
export const BLOB_ACCESS: 'public' | 'private' =
  process.env.BLOB_ACCESS === 'public' ? 'public' : 'private';

export const MEDIA_ROUTE = '/api/media/';

export const mediaUrl = (pathname: string, blobUrl: string) =>
  BLOB_ACCESS === 'private' ? `${MEDIA_ROUTE}${pathname}` : blobUrl;
