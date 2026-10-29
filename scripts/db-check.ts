import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

config({ path: '.env.local' });

async function main() {
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const [r] = await db.$queryRaw<{ ok: number }[]>`select 1 as ok`;
  const tables = await db.$queryRaw<
    { table_name: string }[]
  >`select table_name from information_schema.tables where table_schema='public' order by 1`;
  console.log('pooled ok:', r?.ok === 1, '| tabelas:', tables.map((t) => t.table_name).join(', '));
  await db.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
