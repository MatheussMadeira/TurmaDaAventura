/**
 * Recorte com proporção fixa do slot + zoom. Tudo em pixels da foto ORIGINAL; o centro (cx, cy)
 * vai de 0 a 1 e o zoom de 1 (a maior área possível) em diante.
 */
export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;

/** "5 / 4" → 1.25 */
export function parseRatio(ratio: string): number {
  const [a, b] = ratio.split('/').map((n) => Number(n.trim()));
  return a && b ? a / b : 1;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function cropRect(
  natW: number,
  natH: number,
  ratio: number,
  zoom: number,
  cx: number,
  cy: number,
): CropRect {
  const z = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
  // maior retângulo com a proporção que cabe na foto
  let baseW = natW;
  let baseH = natW / ratio;
  if (baseH > natH) {
    baseH = natH;
    baseW = natH * ratio;
  }
  const w = baseW / z;
  const h = baseH / z;
  return {
    w,
    h,
    x: clamp(cx * natW - w / 2, 0, natW - w),
    y: clamp(cy * natH - h / 2, 0, natH - h),
  };
}

/** Novo centro depois de arrastar `dxPx/dyPx` num visor de `viewW` pixels de largura. */
export function panCenter(
  rect: CropRect,
  natW: number,
  natH: number,
  viewW: number,
  dxPx: number,
  dyPx: number,
): { cx: number; cy: number } {
  const scale = rect.w / viewW; // pixels da foto por pixel da tela
  const cx = (rect.x + rect.w / 2 - dxPx * scale) / natW;
  const cy = (rect.y + rect.h / 2 - dyPx * scale) / natH;
  return { cx: clamp(cx, 0, 1), cy: clamp(cy, 0, 1) };
}

/** Estilo (em %) para posicionar a foto dentro do visor, sem medir nada na tela. */
export function viewStyle(rect: CropRect, natW: number, natH: number) {
  return {
    width: `${(natW / rect.w) * 100}%`,
    left: `${(-rect.x / rect.w) * 100}%`,
    top: `${(-rect.y / rect.h) * 100}%`,
    aspectRatio: `${natW} / ${natH}`,
  };
}

/** Fotos pequenas ainda funcionam, mas ficam borradas em telas grandes: aviso, nunca bloqueio. */
export const isSmallPhoto = (rect: CropRect) => rect.w < 900;

/** Recorta no navegador (canvas → WebP). O EXIF/GPS não sobrevive ao canvas; o servidor limpa de novo. */
export async function renderCrop(file: File, rect: CropRect, maxSide = 2000): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const scale = Math.min(1, maxSide / Math.max(rect.w, rect.h));
    const w = Math.max(1, Math.round(rect.w * scale));
    const h = Math.max(1, Math.round(rect.h * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    ctx.drawImage(bitmap, rect.x, rect.y, rect.w, rect.h, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.88));
    if (!blob) throw new Error('blob');
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' });
  } finally {
    bitmap.close();
  }
}
