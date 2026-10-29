import 'server-only';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { attemptLogin } from './login';

const credentialsSchema = z.object({
  email: z.string().trim().min(3).max(200),
  password: z.string().min(1).max(200),
  remember: z.string().optional(),
});

/**
 * Auth.js: credenciais + sessão JWT. O JWT só carrega o id; papel, "ativo" e a versão do token
 * são conferidos NO BANCO a cada requisição (session.ts) — desativar ou rebaixar vale na hora.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/admin/login' },
  providers: [
    Credentials({
      credentials: { email: {}, password: {}, remember: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const r = await attemptLogin(parsed.data.email, parsed.data.password);
        if (!r.ok) return null;
        return {
          id: r.user.id,
          name: r.user.name,
          email: r.user.email,
          tv: r.user.tokenVersion,
          remember: parsed.data.remember === 'on' || parsed.data.remember === 'true',
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.tv = user.tv ?? 0;
        token.remember = !!user.remember;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.uid ?? '';
      session.user.tv = token.tv ?? 0;
      session.user.remember = !!token.remember;
      session.user.iat = typeof token.iat === 'number' ? token.iat : 0;
      return session;
    },
  },
});
