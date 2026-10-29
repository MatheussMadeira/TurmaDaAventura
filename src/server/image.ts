import sharp, { type Metadata, type Sharp } from 'sharp';

/**
 * Processamento de imagens enviadas (puro: sem banco nem rede).
 *  - valida tipo REAL pelo conteúdo (não pelo nome/MIME informado) e tamanho;
 *  - aplica a orientação do EXIF e REMOVE todos os metadados (EXIF/GPS/ICC de câmera);
 *  - gera uma versão "master" (até 2000px) e tamanhos menores, todos em WebP.
 */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_INPUT_PIXELS = 60_000_000; // ~60 MP: barra "bombas" de descompressão
export const MASTER_MAX_WIDTH = 2000;
export const VARIANT_WIDTHS = [480, 960, 1600] as const;
export const ALLOWED_FORMATS = ['jpeg', 'png', 'webp', 'avif'] as const;

export class ImageError extends Error {
  constructor(
    message: string,
    readonly code: 'too-large' | 'unsupported' | 'corrupt' | 'too-small',
  ) {
    super(message);
    this.name = 'ImageError';
  }
}

export interface ProcessedImage {
  width: number;
  height: number;
  buffer: Buffer;
}

export interface ImageSet {
  master: ProcessedImage;
  /** do menor para o maior; nunca maiores que o original (sem upscaling) */
  variants: ProcessedImage[];
}

const webp = (img: Sharp) => img.webp({ quality: 82, effort: 4 });

async function render(pipeline: Sharp, width: number): Promise<ProcessedImage> {
  const { data, info } = await webp(
    pipeline.clone().resize({ width, withoutEnlargement: true }),
  ).toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, buffer: data };
}

export async function processImage(input: Buffer | Uint8Array): Promise<ImageSet> {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  if (buf.byteLength > MAX_UPLOAD_BYTES) {
    throw new ImageError('A foto passa de 10 MB. Reduza o tamanho e tente de novo.', 'too-large');
  }

  let meta: Metadata;
  try {
    meta = await sharp(buf, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
  } catch {
    throw new ImageError(
      'Não foi possível ler essa imagem. O arquivo parece corrompido.',
      'corrupt',
    );
  }
  if (!meta.format || !(ALLOWED_FORMATS as readonly string[]).includes(meta.format)) {
    throw new ImageError('Formato não aceito. Envie JPG, PNG, WebP ou AVIF.', 'unsupported');
  }
  if (!meta.width || !meta.height) {
    throw new ImageError('Não foi possível ler as dimensões da imagem.', 'corrupt');
  }

  // rotate() sem argumento aplica a orientação do EXIF; o sharp não copia metadados para a saída
  // (sem withMetadata/keepMetadata), então EXIF, GPS e perfis de câmera ficam de fora.
  const base = sharp(buf, { limitInputPixels: MAX_INPUT_PIXELS }).rotate();

  let master: ProcessedImage;
  try {
    master = await render(base, MASTER_MAX_WIDTH);
  } catch {
    throw new ImageError('Não foi possível processar essa imagem.', 'corrupt');
  }

  const variants: ProcessedImage[] = [];
  for (const w of VARIANT_WIDTHS) {
    if (w < master.width) variants.push(await render(base, w));
  }
  return { master, variants };
}
