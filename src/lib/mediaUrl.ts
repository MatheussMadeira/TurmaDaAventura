/**
 * Como as fotos do Vercel Blob chegam ao navegador.
 *  - public (padrão): o store é público; usa a URL direta do Blob (CDN do Vercel).
 *  - private: alternativa para store privado; o site serve as fotos por /api/media/<pathname>
 *    (rota com cache longo/imutável) e os arquivos nunca ficam expostos fora do site.
 * Defina BLOB_ACCESS conforme o tipo do store criado.
 */
export const BLOB_ACCESS: 'public' | 'private' =
  process.env.BLOB_ACCESS === 'private' ? 'private' : 'public';

export const MEDIA_ROUTE = '/api/media/';

export const mediaUrl = (pathname: string, blobUrl: string) =>
  BLOB_ACCESS === 'private' ? `${MEDIA_ROUTE}${pathname}` : blobUrl;
