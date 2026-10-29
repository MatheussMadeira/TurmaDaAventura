import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

type U = {
  id: string;
  email: string;
  passwordHash: string;
  active: boolean;
  failedAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  tokenVersion: number;
};

/** "Banco" em memória: o contador de tentativas precisa viver no registro, não no processo. */
let row: U | null;
const db = {
  user: {
    findUnique: vi.fn(async ({ where }: { where: { email: string } }) =>
      row && row.email === where.email ? row : null,
    ),
    update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      const d = data as {
        failedAttempts?: number | { increment: number };
        lockedUntil?: Date | null;
        lastLoginAt?: Date;
      };
      if (!row) throw new Error('sem usuário');
      if (d.failedAttempts !== undefined) {
        row.failedAttempts =
          typeof d.failedAttempts === 'number'
            ? d.failedAttempts
            : row.failedAttempts + d.failedAttempts.increment;
      }
      if ('lockedUntil' in d) row.lockedUntil = d.lockedUntil ?? null;
      if (d.lastLoginAt) row.lastLoginAt = d.lastLoginAt;
      return { ...row };
    }),
  },
};
vi.mock('../db', () => ({ db }));

const { attemptLogin, MAX_ATTEMPTS, LOCK_MS } = await import('./login');

const GOOD = 'Senha-Boa-123';
const hash = bcrypt.hashSync(GOOD, 4);
const NOW = new Date('2026-10-29T12:00:00Z');

beforeEach(() => {
  vi.clearAllMocks();
  row = {
    id: 'u1',
    email: 'ana@exemplo.com',
    passwordHash: hash,
    active: true,
    failedAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
    tokenVersion: 0,
  };
});

describe('attemptLogin', () => {
  it('senha certa entra, zera o contador e registra o último acesso', async () => {
    row!.failedAttempts = 3;
    const r = await attemptLogin('  ANA@exemplo.com ', GOOD, NOW);
    expect(r.ok).toBe(true);
    expect(row!.failedAttempts).toBe(0);
    expect(row!.lastLoginAt).toEqual(NOW);
  });

  it('senha errada soma tentativa no banco e devolve só { ok: false }', async () => {
    const r = await attemptLogin('ana@exemplo.com', 'errada', NOW);
    expect(r).toEqual({ ok: false });
    expect(row!.failedAttempts).toBe(1);
  });

  it(`a ${MAX_ATTEMPTS}ª falha bloqueia por 15 minutos (lockedUntil no banco)`, async () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) await attemptLogin('ana@exemplo.com', 'errada', NOW);
    expect(row!.lockedUntil).toEqual(new Date(NOW.getTime() + 15 * 60_000));
    expect(LOCK_MS).toBe(15 * 60_000);
    expect(row!.failedAttempts).toBe(0);
  });

  it('bloqueada: nem a senha CERTA entra, e o bloqueio não é prolongado', async () => {
    const until = new Date(NOW.getTime() + 10 * 60_000);
    row!.lockedUntil = until;
    expect(await attemptLogin('ana@exemplo.com', GOOD, NOW)).toEqual({ ok: false });
    expect(await attemptLogin('ana@exemplo.com', 'errada', NOW)).toEqual({ ok: false });
    expect(row!.lockedUntil).toEqual(until);
    expect(row!.failedAttempts).toBe(0);
  });

  it('passados os 15 minutos a senha certa volta a funcionar', async () => {
    row!.lockedUntil = new Date(NOW.getTime() + 60_000);
    const later = new Date(NOW.getTime() + 61_000);
    expect((await attemptLogin('ana@exemplo.com', GOOD, later)).ok).toBe(true);
    expect(row!.lockedUntil).toBeNull();
  });

  it('e-mail inexistente e conta desativada falham do mesmo jeito (sem pistas)', async () => {
    const unknown = await attemptLogin('ninguem@exemplo.com', GOOD, NOW);
    row!.active = false;
    const inactive = await attemptLogin('ana@exemplo.com', GOOD, NOW);
    expect(unknown).toEqual({ ok: false });
    expect(inactive).toEqual({ ok: false });
    expect(row!.failedAttempts).toBe(0); // conta desativada não acumula bloqueio
  });
});
