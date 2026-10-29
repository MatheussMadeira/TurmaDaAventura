/** Mensagem única para qualquer falha de login: nunca diz qual campo errou nem se a conta está bloqueada. */
export const LOGIN_ERROR = 'E-mail ou senha incorretos.';

/** Só caminhos internos do admin; nada de redirecionar para fora do site. */
export function safeNext(next: unknown): string | null {
  if (typeof next !== 'string') return null;
  if (!next.startsWith('/admin') || next.startsWith('//') || next.includes('\\')) return null;
  if (next.startsWith('/admin/login') || next.startsWith('/admin/trocar-senha')) return null;
  return next;
}
