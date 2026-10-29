import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { ImageError, MAX_UPLOAD_BYTES, MASTER_MAX_WIDTH, processImage } from './image';

const solid = (w: number, h: number) =>
  sharp({ create: { width: w, height: h, channels: 3, background: { r: 31, g: 99, b: 42 } } });

describe('processImage', () => {
  it('converte para WebP, gera tamanhos menores que o original e nunca amplia', async () => {
    const jpeg = await solid(1800, 1200).jpeg().toBuffer();
    const out = await processImage(jpeg);

    expect((await sharp(out.master.buffer).metadata()).format).toBe('webp');
    expect(out.master.width).toBe(1800);
    expect(out.variants.map((v) => v.width)).toEqual([480, 960, 1600]);
    expect(out.variants.every((v) => v.width < out.master.width)).toBe(true);
    // mantém a proporção
    expect(out.variants[0]!.height).toBe(320);
  });

  it('limita o master a 2000px e foto pequena não gera variantes maiores que ela', async () => {
    const big = await processImage(await solid(3000, 1000).png().toBuffer());
    expect(big.master.width).toBe(MASTER_MAX_WIDTH);

    const small = await processImage(await solid(400, 300).png().toBuffer());
    expect(small.master.width).toBe(400);
    expect(small.variants).toEqual([]);
  });

  it('remove EXIF/GPS e aplica a orientação', async () => {
    const withExif = await solid(200, 100)
      .jpeg()
      .withExif({
        IFD0: { Copyright: 'Fulano', Make: 'CameraCo' },
        IFD3: { GPSLatitudeRef: 'S', GPSLongitudeRef: 'W' },
      })
      .withMetadata({ orientation: 6 })
      .toBuffer();

    // sanidade: a entrada realmente tem EXIF e orientação
    const before = await sharp(withExif).metadata();
    expect(before.exif).toBeDefined();
    expect(before.orientation).toBe(6);

    const out = await processImage(withExif);
    for (const img of [out.master, ...out.variants]) {
      const meta = await sharp(img.buffer).metadata();
      expect(meta.exif).toBeUndefined();
      expect(meta.icc).toBeUndefined();
      expect(meta.orientation).toBeUndefined();
    }
    // orientação 6 = girar 90°: 200×100 vira 100×200
    expect(out.master.width).toBe(100);
    expect(out.master.height).toBe(200);
  });

  it('rejeita formatos que não são foto (SVG, GIF, texto)', async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>');
    const gif = await solid(10, 10).gif().toBuffer();
    for (const bad of [svg, gif, Buffer.from('não sou imagem')]) {
      await expect(processImage(bad)).rejects.toBeInstanceOf(ImageError);
    }
    await expect(processImage(gif)).rejects.toMatchObject({ code: 'unsupported' });
  });

  it('rejeita arquivo acima de 10 MB', async () => {
    await expect(processImage(Buffer.alloc(MAX_UPLOAD_BYTES + 1))).rejects.toMatchObject({
      code: 'too-large',
    });
  });

  it('usa o conteúdo, não a extensão: um PNG "disfarçado" de JPG passa como PNG real', async () => {
    const png = await solid(300, 200).png().toBuffer();
    const out = await processImage(png);
    expect(out.master.width).toBe(300);
  });
});
