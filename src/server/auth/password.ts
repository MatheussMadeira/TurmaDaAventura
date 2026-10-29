import { randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';

const COST = 12;
export const hashPassword = (plain: string) => bcrypt.hash(plain, COST);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

let dummy: Promise<string> | undefined;
/** Hash real (gerado uma vez) para igualar o tempo de resposta quando o e-mail não existe. */
export const dummyHash = () => (dummy ??= bcrypt.hash('turma-da-aventura-dummy', COST));
/** Compara contra o hash falso: gasta o mesmo tempo de um login de verdade. */
export const burnPasswordCheck = async (plain: string) => verifyPassword(plain, await dummyHash());

// sem 0/O, 1/I/l: a senha temporária é lida e digitada por uma pessoa
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Senha temporária no formato do painel: XXXX-XXXX-XXXX (12 caracteres, ~60 bits). */
export function generateTempPassword() {
  const pick = () => ALPHABET[randomInt(ALPHABET.length)]!;
  const group = () => Array.from({ length: 4 }, pick).join('');
  return `${group()}-${group()}-${group()}`;
}

export { MIN_PASSWORD } from '@/lib/passwordPolicy';
import { MIN_PASSWORD } from '@/lib/passwordPolicy';

/** Política da senha definitiva. Devolve a mensagem de erro (pt-BR) ou null se estiver ok. */
export function validateNewPassword(
  next: string,
  ctx: { email?: string; current?: string } = {},
): string | null {
  if (next.length < MIN_PASSWORD) return `Use pelo menos ${MIN_PASSWORD} caracteres.`;
  if (next.length > 72) return 'Use no máximo 72 caracteres.';
  if (!/[A-Za-zÀ-ÿ]/.test(next) || !/\d/.test(next)) return 'Misture letras e números.';
  if (ctx.current && next === ctx.current)
    return 'A nova senha precisa ser diferente da temporária.';
  const local = ctx.email?.split('@')[0]?.toLowerCase();
  if (local && local.length >= 4 && next.toLowerCase().includes(local)) {
    return 'Não use seu e-mail na senha.';
  }
  return null;
}
