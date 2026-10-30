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
const pool = new Pool({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  idleTimeoutMillis: 2000, // vários specs dividem o processo: a conexão expira sozinha, sem pool.end()
});

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
}

/* ---- conteúdo das páginas (editor visual): foto do estado antes do teste, para devolver depois ---- */
interface SectionRow {
  id: string;
  key: string;
  order: number;
  visible: boolean;
  draft: unknown;
  published: unknown;
  publishedOrder: number | null;
  publishedVisible: boolean | null;
  updatedById: string | null;
}

export async function snapshotSections(slug: string): Promise<SectionRow[]> {
  const { rows } = await pool.query(
    `select s.id, s.key, s."order", s.visible, s.draft, s.published, s."publishedOrder",
            s."publishedVisible", s."updatedById"
       from "Section" s join "Page" p on p.id = s."pageId" where p.slug = $1`,
    [slug],
  );
  return rows as SectionRow[];
}

export async function restoreSections(rows: SectionRow[]) {
  for (const r of rows) {
    await pool.query(
      `update "Section" set "order" = $2, visible = $3, draft = $4::jsonb, published = $5::jsonb,
              "publishedOrder" = $6, "publishedVisible" = $7, "updatedById" = $8 where id = $1`,
      [
        r.id,
        r.order,
        r.visible,
        JSON.stringify(r.draft),
        r.published == null ? null : JSON.stringify(r.published),
        r.publishedOrder,
        r.publishedVisible,
        r.updatedById,
      ],
    );
  }
}

export async function sectionRow(slug: string, key: string) {
  const { rows } = await pool.query(
    `select s.draft, s.published, s."order", s.visible from "Section" s
       join "Page" p on p.id = s."pageId" where p.slug = $1 and s.key = $2`,
    [slug, key],
  );
  return rows[0] as { draft: any; published: any; order: number; visible: boolean }; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/* ---- reserva de edição das páginas ---- */
export async function clearLocks() {
  await pool.query(`delete from "PageLock"`);
}

/** Simula outra pessoa/aba assumindo a página (token e dono diferentes). */
export async function stealLock(slug: string) {
  await pool.query(
    `update "PageLock" set token = 'tomada-por-outra-aba-00000', "userId" = 'outra-pessoa',
            "userName" = 'Fulana de Tal' where slug = $1`,
    [slug],
  );
}

export async function lockRows() {
  const { rows } = await pool.query(`select slug, "userName" from "PageLock"`);
  return rows as { slug: string; userName: string }[];
}

/** Apaga as fotos criadas pelos testes (descrição começa com "E2E "): arquivos no Blob e linhas no banco. */
export async function deleteTestMedia() {
  const { del } = await import('@vercel/blob');
  const { rows } = await pool.query(
    `select id, pathname, variants from "Media" where alt like 'E2E %'`,
  );
  for (const r of rows as { id: string; pathname: string; variants: { pathname: string }[] }[]) {
    await del([r.pathname, ...r.variants.map((v) => v.pathname)]);
    await pool.query(`delete from "Media" where id = $1`, [r.id]);
  }
  return rows.length;
}

export async function mediaCount(prefix = 'E2E %') {
  const { rows } = await pool.query(`select count(*)::int n from "Media" where alt like $1`, [
    prefix,
  ]);
  return rows[0].n as number;
}

/** Remove os temas de festa criados pelos testes (título começa com "E2E "). */
export async function deleteTestThemes() {
  await pool.query(`delete from "PartyTheme" where title like 'E2E %'`);
}
