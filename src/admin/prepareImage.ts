/**
 * Prepara a foto antes de subir: o servidor (Vercel) aceita corpo de até ~4,5 MB por requisição,
 * então fotos grandes são reduzidas aqui (máx. 2000 px, WebP). Também descarta o EXIF/GPS
 * (o canvas não o preserva) — o servidor ainda valida e limpa tudo de novo.
 */
const MAX_DIRECT_BYTES = 3.5 * 1024 * 1024;
const MAX_SIDE = 2000;

export async function prepareImage(file: File): Promise<File> {
  if (file.size <= MAX_DIRECT_BYTES) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.86));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' });
  } catch {
    return file; // o servidor decide (e recusa com mensagem se for grande/ilegível)
  }
}
