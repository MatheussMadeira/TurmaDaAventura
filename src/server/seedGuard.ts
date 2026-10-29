/**
 * Guarda do `seed --force` (apaga e recria conteúdo). Puro, sem Prisma — usado por prisma/seed.ts.
 * Banco de PRODUÇÃO = VERCEL_ENV=production OU host do banco listado em PRODUCTION_DB_HOSTS.
 */
export interface SeedEnv {
  VERCEL_ENV?: string;
  PRODUCTION_DB_HOSTS?: string;
  ALLOW_DESTRUCTIVE_SEED?: string;
  DIRECT_URL?: string;
  DATABASE_URL?: string;
}

export const databaseHost = (env: SeedEnv) => {
  try {
    return new URL(env.DIRECT_URL ?? env.DATABASE_URL ?? '').hostname.toLowerCase();
  } catch {
    return '';
  }
};

export function isProductionDatabase(env: SeedEnv) {
  if (env.VERCEL_ENV === 'production') return true;
  const host = databaseHost(env);
  const list = (env.PRODUCTION_DB_HOSTS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return !!host && list.some((h) => host.includes(h));
}

export type ForceDecision =
  | { allowed: true; needsTypedConfirmation: false }
  | { allowed: true; needsTypedConfirmation: true; expected: string }
  | { allowed: false; reason: string };

/** Decide se `--force` pode seguir e se exige confirmação digitada (host do banco). */
export function decideForce(env: SeedEnv): ForceDecision {
  if (!isProductionDatabase(env)) return { allowed: true, needsTypedConfirmation: false };
  if (env.ALLOW_DESTRUCTIVE_SEED !== '1') {
    return {
      allowed: false,
      reason:
        'Este parece ser o banco de PRODUÇÃO (VERCEL_ENV=production ou host em PRODUCTION_DB_HOSTS). ' +
        '`--force` apagaria o conteúdo editado. Se for isso mesmo, rode com ALLOW_DESTRUCTIVE_SEED=1.',
    };
  }
  return { allowed: true, needsTypedConfirmation: true, expected: databaseHost(env) };
}
