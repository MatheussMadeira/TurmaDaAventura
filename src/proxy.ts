import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isSchemaOutdated } from '@/lib/dbErrors';
import { validateClaims } from '@/server/auth/session';

/**
 * Porteiro do /admin e de /api/admin: roda a cada requisição (inclusive as de navegação do App Router)
 * e consulta o usuário no BANCO — conta desativada ou rebaixada perde o acesso na hora.
 * Páginas e Server Actions conferem de novo (authorize / requirePageUser): defesa em camadas.
 */
export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };

const LOGIN = '/admin/login';
const CHANGE = '/admin/trocar-senha';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith('/api/');

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: req.nextUrl.protocol === 'https:',
  });
  let user = null;
  if (token) {
    try {
      user = await validateClaims({
        uid: token.uid,
        tv: token.tv,
        remember: token.remember,
        iat: typeof token.iat === 'number' ? token.iat : undefined,
      });
    } catch (e) {
      // banco sem a migração: deixa passar para a página mostrar "O banco precisa ser atualizado"
      if (isSchemaOutdated(e) && !isApi) return NextResponse.next();
      throw e;
    }
  }

  if (pathname === LOGIN) {
    return user ? NextResponse.redirect(new URL('/admin', req.url)) : NextResponse.next();
  }

  if (!user) {
    if (isApi) return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    const url = new URL(LOGIN, req.url);
    if (pathname !== '/admin') url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (user.mustChangePassword && pathname !== CHANGE) {
    if (isApi) {
      return NextResponse.json({ error: 'Troque a senha antes de continuar' }, { status: 403 });
    }
    return NextResponse.redirect(new URL(CHANGE, req.url));
  }
  return NextResponse.next();
}
