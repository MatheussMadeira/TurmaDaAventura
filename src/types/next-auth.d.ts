import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    /** User.tokenVersion no login — trocar/redefinir a senha invalida sessões antigas */
    tv?: number;
    remember?: boolean;
  }
  interface Session {
    user: { id: string; tv: number; remember: boolean; iat: number } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid?: string;
    tv?: number;
    remember?: boolean;
  }
}
