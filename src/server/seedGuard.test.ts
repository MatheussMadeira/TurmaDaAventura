import { describe, expect, it } from 'vitest';
import { decideForce, isProductionDatabase } from './seedGuard';

const DEV = 'postgresql://u:p@ep-dev-123.c-2.sa-east-1.aws.neon.tech/neondb';
const PROD = 'postgresql://u:p@ep-main-999.c-2.sa-east-1.aws.neon.tech/neondb';

describe('guarda do seed --force', () => {
  it('banco de desenvolvimento: segue sem confirmação', () => {
    expect(decideForce({ DIRECT_URL: DEV, PRODUCTION_DB_HOSTS: 'ep-main-999' })).toEqual({
      allowed: true,
      needsTypedConfirmation: false,
    });
  });

  it('VERCEL_ENV=production recusa', () => {
    const d = decideForce({ VERCEL_ENV: 'production', DIRECT_URL: DEV });
    expect(d.allowed).toBe(false);
  });

  it('host da lista de produção recusa (inclusive o host pooled)', () => {
    expect(decideForce({ DIRECT_URL: PROD, PRODUCTION_DB_HOSTS: 'ep-main-999' }).allowed).toBe(
      false,
    );
    expect(
      isProductionDatabase({
        DATABASE_URL: 'postgresql://u:p@ep-main-999-pooler.c-2.aws.neon.tech/neondb',
        PRODUCTION_DB_HOSTS: 'ep-main-999',
      }),
    ).toBe(true);
  });

  it('com ALLOW_DESTRUCTIVE_SEED=1 ainda exige digitar o host', () => {
    const d = decideForce({
      DIRECT_URL: PROD,
      PRODUCTION_DB_HOSTS: 'ep-main-999',
      ALLOW_DESTRUCTIVE_SEED: '1',
    });
    expect(d).toEqual({
      allowed: true,
      needsTypedConfirmation: true,
      expected: 'ep-main-999.c-2.sa-east-1.aws.neon.tech',
    });
  });

  it('só ALLOW_DESTRUCTIVE_SEED=1 (valor exato) libera', () => {
    expect(
      decideForce({
        DIRECT_URL: PROD,
        PRODUCTION_DB_HOSTS: 'ep-main-999',
        ALLOW_DESTRUCTIVE_SEED: 'true',
      }).allowed,
    ).toBe(false);
  });
});
