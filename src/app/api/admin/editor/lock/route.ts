import { NextResponse } from 'next/server';
import { pageBySlug } from '@/content/sections/schemas';
import { acquireLock, releaseLock } from '@/server/admin/editLock';
import { AuthzError, authorize } from '@/server/auth/session';

/**
 * Reserva de edição da página (pegar/renovar/soltar). Rota de API — e não Server Action — porque
 * soltar ao fechar a aba usa navigator.sendBeacon.
 * Corpo: { slug, token, op: 'acquire' | 'release' }
 */
export const runtime = 'nodejs';

export async function POST(req: Request) {
  let user;
  try {
    user = await authorize({ permission: 'site' });
  } catch (e) {
    if (e instanceof AuthzError) {
      return NextResponse.json(
        { error: e.message },
        { status: e.code === 'forbidden' ? 403 : 401 },
      );
    }
    throw e;
  }

  const body = (await req.json().catch(() => null)) as {
    slug?: unknown;
    token?: unknown;
    op?: unknown;
  } | null;
  const { slug, token, op } = body ?? {};
  if (
    typeof slug !== 'string' ||
    !pageBySlug(slug) ||
    typeof token !== 'string' ||
    token.length < 16 ||
    token.length > 64 ||
    (op !== 'acquire' && op !== 'release')
  ) {
    return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 });
  }

  if (op === 'release') {
    await releaseLock(slug, token);
    return NextResponse.json({ ok: true });
  }
  const r = await acquireLock(slug, user, token);
  return r.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json(
        { ok: false, holder: { name: r.holder.name, since: r.holder.since.toISOString() } },
        { status: 409 },
      );
}
