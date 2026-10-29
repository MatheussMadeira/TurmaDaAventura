import { NextResponse } from 'next/server';
import { AuthzError, authorize } from '@/server/auth/session';
import { ImageError } from '@/server/image';
import { MediaError, uploadImage } from '@/server/media';
import { audit } from '@/server/admin/shared';

/**
 * Upload de fotos (admin autenticado, permissão "photos"). multipart/form-data:
 *   files[] + alts[] (mesma ordem) + authorization=on
 * Responde por arquivo, para a tela mostrar o que subiu e o que falhou.
 */
export const runtime = 'nodejs';
const MAX_FILES = 12;

export async function POST(req: Request) {
  let user;
  try {
    user = await authorize({ permission: 'photos' });
  } catch (e) {
    if (e instanceof AuthzError) {
      const status = e.code === 'forbidden' ? 403 : 401;
      return NextResponse.json({ error: e.message }, { status });
    }
    throw e;
  }

  const form = await req.formData();
  const files = form.getAll('files').filter((f): f is File => f instanceof File);
  const alts = form.getAll('alts').map(String);
  const authorization = form.get('authorization') === 'on' || form.get('authorization') === 'true';

  if (!files.length)
    return NextResponse.json({ error: 'Escolha ao menos uma foto.' }, { status: 400 });
  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Envie no máximo ${MAX_FILES} fotos por vez.` },
      { status: 400 },
    );
  }

  const results = [];
  for (const [i, file] of files.entries()) {
    try {
      const media = await uploadImage({
        file: Buffer.from(await file.arrayBuffer()),
        alt: alts[i] ?? '',
        authorizationConfirmed: authorization,
        userId: user.id,
      });
      await audit(
        user,
        'media',
        'media.upload',
        media.id,
        `Enviou a foto “${media.alt.slice(0, 40)}”`,
        false,
      );
      results.push({
        name: file.name,
        ok: true as const,
        id: media.id,
        url: media.url,
        alt: media.alt,
      });
    } catch (e) {
      const message =
        e instanceof ImageError || e instanceof MediaError
          ? e.message
          : 'Não foi possível enviar essa foto. Tente de novo.';
      if (!(e instanceof ImageError || e instanceof MediaError)) console.error('[upload]', e);
      results.push({ name: file.name, ok: false as const, error: message });
    }
  }
  return NextResponse.json({ results }, { status: results.some((r) => r.ok) ? 200 : 422 });
}
