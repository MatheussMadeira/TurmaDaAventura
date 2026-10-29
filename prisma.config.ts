import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// A CLI do Prisma só lê .env; o projeto usa .env.local (Next). Carrega os dois.
config({ path: '.env.local' });
config();

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'tsx prisma/seed.ts' },
  // migrate/db push usam a conexão DIRETA (sem pooler)
  datasource: { url },
});
