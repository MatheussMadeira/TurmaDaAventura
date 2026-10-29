import { randomBytes, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { Pool } from 'pg';

config({ path: '.env.local' });

/**
 * Usuários descartáveis para os testes de navegador (no banco de DESENVOLVIMENTO), via SQL direto
 * (o client gerado do Prisma 7 é ESM; o Playwright carrega os testes como CJS).
 * E-mails @teste.invalid; removidos ao final. As senhas existem só durante o teste.
 */
const pool = new Pool({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });

export const TEST_DOMAIN = '@teste.invalid';
export const GOOD = 'Senha-Boa-2026';

type Role = 'ADMIN' | 'EQUIPE';

export interface TestUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

export async function makeUser(
  label: string,
  opts: { role?: Role; mustChangePassword?: boolean; password?: string } = {},
): Promise<TestUser> {
  const id = randomUUID();
  const name = `Teste ${label}`;
  const email = `e2e-${label}-${randomBytes(3).toString('hex')}${TEST_DOMAIN}`;
  const password = opts.password ?? GOOD;
  await pool.query(
    `insert into "User" (id, name, email, "passwordHash", role, "mustChangePassword", "updatedAt")
     values ($1, $2, $3, $4, $5::"Role", $6, now())`,
    [
      id,
      name,
      email,
      await bcrypt.hash(password, 4),
      opts.role ?? 'EQUIPE',
      opts.mustChangePassword ?? false,
    ],
  );
  return { id, name, email, password };
}

export async function getUser(id: string) {
  const { rows } = await pool.query(
    `select role, active, "mustChangePassword", "failedAttempts",
            ("lockedUntil" at time zone 'UTC') as "lockedUntil", "tokenVersion"
       from "User" where id = $1`,
    [id],
  );
  return rows[0] as {
    role: Role;
    active: boolean;
    mustChangePassword: boolean;
    failedAttempts: number;
    lockedUntil: Date | null;
    tokenVersion: number;
  };
}

export async function setUser(
  id: string,
  patch: Partial<{ role: Role; active: boolean; lockedUntil: Date | null }>,
) {
  if ('role' in patch)
    await pool.query(`update "User" set role = $2::"Role" where id = $1`, [id, patch.role]);
  if ('active' in patch)
    await pool.query(`update "User" set active = $2 where id = $1`, [id, patch.active]);
  if ('lockedUntil' in patch) {
    await pool.query(
      `update "User" set "lockedUntil" = ($2::timestamptz at time zone 'UTC') where id = $1`,
      [id, patch.lockedUntil?.toISOString() ?? null],
    );
  }
}

export async function cleanup() {
  await pool.query(
    `delete from "AuditLog" where "userId" in (select id from "User" where email like $1)`,
    [`%${TEST_DOMAIN}`],
  );
  await pool.query(`delete from "User" where email like $1`, [`%${TEST_DOMAIN}`]);
  await pool.end();
}
