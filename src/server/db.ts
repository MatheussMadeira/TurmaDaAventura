import 'server-only';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

/* App (serverless): conexão POOLED (DATABASE_URL). Migrações usam DIRECT_URL (prisma.config.ts). */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function create() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL não definida (veja .env.example)');
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export const db = globalForPrisma.prisma ?? create();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
