/**
 * Seed da Turma da Aventura.
 *   npx prisma db seed            cria o que falta (não sobrescreve edições)
 *   npx prisma db seed -- --force recria o conteúdo das seções a partir dos textos do canvas
 *
 * Fontes: src/content/defaults (textos das seções) e src/content/*.json (restaurantes, atividades,
 * equipe, contato). O conteúdo nasce PUBLICADO (draft = published). O usuário ADMIN vem de
 * ADMIN_EMAIL; a senha temporária é gerada aqui, impressa UMA vez e troca é obrigatória no 1º acesso.
 */
import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { config } from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Prisma } from '../src/generated/prisma/client';
import { DEFAULT_PAGES } from '../src/content/defaults/pages';
import { PAGES, parseSection } from '../src/content/sections/schemas';
import restaurantes from '../src/content/restaurantes.json';
import atividades from '../src/content/atividades.json';
import equipe from '../src/content/equipe.json';
import contato from '../src/content/contato.json';
import temasFesta from '../src/content/temas-festa.json';
import { decideForce } from '../src/server/seedGuard';
import { upgradeV2 } from './upgradeV2';

config({ path: '.env.local' });
config();

const force = process.argv.includes('--force');
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL }),
});

const json = (v: unknown) => v as Prisma.InputJsonValue;

async function seedPages() {
  let created = 0;
  for (const def of PAGES) {
    const page = await db.page.upsert({
      where: { slug: def.slug },
      update: { title: def.title },
      create: { slug: def.slug, title: def.title },
    });
    for (const [order, s] of def.sections.entries()) {
      const seed = DEFAULT_PAGES[def.slug]?.[s.key];
      if (!seed) throw new Error(`Sem texto padrão para ${def.slug}/${s.key}`);
      const parsed = parseSection(s.type, seed.content);
      if (!parsed.success) {
        throw new Error(`${def.slug}/${s.key} inválida: ${parsed.error.issues[0]?.message}`);
      }
      const data = {
        type: s.type,
        order,
        visible: true,
        draft: json(parsed.data),
        published: json(parsed.data),
        publishedOrder: order,
        publishedVisible: true,
      };
      const where = { pageId_key: { pageId: page.id, key: s.key } };
      const exists = await db.section.findUnique({ where });
      if (exists && !force) continue;
      await db.section.upsert({
        where,
        update: data,
        create: { pageId: page.id, key: s.key, ...data },
      });
      created++;
    }
  }
  return created;
}

async function seedRestaurants() {
  let n = 0;
  for (const [i, r] of restaurantes.restaurantes.entries()) {
    const data = {
      name: r.name,
      neighborhood: r.neighborhood,
      schedule: r.schedule,
      address: r.address,
      ages: r.ages,
      mapsUrl: r.mapsUrl,
      order: i,
      status: r.publicado ? ('PUBLICADO' as const) : ('RASCUNHO' as const),
      destaqueHome: r.destaqueHome,
      imageAlt: r.imageAlt,
    };
    const exists = await db.restaurant.findUnique({ where: { slug: r.slug } });
    if (exists && !force) continue;
    // o que falta entra no FIM da lista (não bate com a ordem que o cliente já definiu)
    if (!force) data.order = await db.restaurant.count();
    await db.restaurant.upsert({
      where: { slug: r.slug },
      update: data,
      create: { slug: r.slug, ...data },
    });
    n++;
  }
  return n;
}

async function seedActivities() {
  let n = 0;
  for (const [i, a] of atividades.atividades.entries()) {
    const data = {
      category: a.categoria,
      icon: a.icon,
      title: a.title,
      description: a.description,
      tags: a.tags,
      imageAlt: a.imageAlt,
      order: i,
      status: a.publicado ? ('PUBLICADO' as const) : ('RASCUNHO' as const),
    };
    const exists = await db.activity.findUnique({ where: { slug: a.slug } });
    if (exists && !force) continue;
    await db.activity.upsert({
      where: { slug: a.slug },
      update: data,
      create: { slug: a.slug, ...data },
    });
    n++;
  }
  return n;
}

async function seedThemes() {
  let n = 0;
  for (const [i, t] of temasFesta.temas.entries()) {
    const data = {
      icon: t.icon,
      title: t.title,
      description: t.description,
      tags: t.tags,
      imageAlt: t.imageAlt,
      order: i,
      status: t.publicado ? ('PUBLICADO' as const) : ('RASCUNHO' as const),
    };
    const exists = await db.partyTheme.findUnique({ where: { slug: t.slug } });
    if (exists && !force) continue;
    if (!force) data.order = await db.partyTheme.count();
    await db.partyTheme.upsert({
      where: { slug: t.slug },
      update: data,
      create: { slug: t.slug, ...data },
    });
    n++;
  }
  return n;
}

async function seedTeam() {
  if (!force && (await db.teamMember.count()) > 0) return 0;
  if (force) await db.teamMember.deleteMany();
  await db.teamMember.createMany({
    data: equipe.equipe.map((m, i) => ({
      nickname: m.nickname,
      name: m.name,
      role: m.role,
      bio: m.bio,
      badges: m.badges,
      visible: m.visivel,
      order: i,
    })),
  });
  return equipe.equipe.length;
}

async function seedSettings() {
  const data = {
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP?.replace(/\D/g, '') || contato.whatsapp,
    instagram: contato.instagram,
    email: contato.email,
    city: contato.cidade,
    hours: contato.horario,
    messages: json(contato.mensagens),
  };
  const exists = await db.siteSettings.findUnique({ where: { id: 'site' } });
  if (exists && !force) return false;
  await db.siteSettings.upsert({
    where: { id: 'site' },
    update: data,
    create: { id: 'site', ...data },
  });
  return true;
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    console.log('• ADMIN_EMAIL não definido: usuário Administração não criado.');
    return;
  }
  if (await db.user.findUnique({ where: { email } })) {
    console.log(`• Administração já existe (${email}); senha mantida.`);
    return;
  }
  const temp = randomBytes(12).toString('base64url'); // 16 caracteres
  await db.user.create({
    data: {
      name: 'Administração',
      email,
      role: 'ADMIN',
      passwordHash: await bcrypt.hash(temp, 12),
      mustChangePassword: true,
    },
  });
  console.log('\n┌─ SENHA TEMPORÁRIA DA ADMINISTRAÇÃO (aparece só desta vez) ─────────────');
  console.log(`│  e-mail: ${email}`);
  console.log(`│  senha : ${temp}`);
  console.log('└─ a troca é obrigatória no primeiro acesso ───────────────────────────────\n');
}

/** `--force` em banco de produção: recusa sem ALLOW_DESTRUCTIVE_SEED=1 e, mesmo com ele, pede o host digitado. */
async function guardForce() {
  if (!force) return;
  const d = decideForce(process.env);
  if (!d.allowed) {
    console.error(`\n✖ ${d.reason}\n`);
    process.exit(1);
  }
  if (!d.needsTypedConfirmation) return;
  if (!process.stdin.isTTY) {
    console.error('\n✖ Confirmação digitada exige um terminal interativo. Abortado.\n');
    process.exit(1);
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(
    `ATENÇÃO: --force vai sobrescrever conteúdo no banco de PRODUÇÃO.\nDigite o host do banco (${d.expected}) para confirmar: `,
  );
  rl.close();
  if (answer.trim().toLowerCase() !== d.expected) {
    console.error('\n✖ Host não confere. Abortado, nada foi alterado.\n');
    process.exit(1);
  }
}

async function main() {
  await guardForce();
  const sections = await seedPages();
  const rest = await seedRestaurants();
  // ajustes v2: atualiza textos antigos que o cliente ainda não editou (com --force já vem tudo novo)
  const upgrade = force ? { updated: [], notUpdated: [] } : await upgradeV2(db);
  const acts = await seedActivities();
  const themes = await seedThemes();
  const team = await seedTeam();
  const settings = await seedSettings();
  await seedAdmin();
  await db.auditLog.create({
    data: {
      action: 'seed',
      entity: 'site',
      summary: `Seed${force ? ' (--force)' : ''}: ${sections} seções, ${rest} restaurantes, ${acts} atividades, ${themes} temas de festa, ${team} pessoas${settings ? ', configurações' : ''}`,
      published: true,
    },
  });
  if (upgrade.updated.length) {
    console.log(`
Atualizados para a versão 2 (${upgrade.updated.length}):`);
    for (const l of upgrade.updated) console.log(`  ✓ ${l}`);
  }
  if (upgrade.notUpdated.length) {
    console.log(`
NÃO atualizados, porque já foram editados no painel (${upgrade.notUpdated.length}):`);
    for (const l of upgrade.notUpdated) console.log(`  • ${l}`);
    console.log('  (confira se o texto atual ainda faz sentido; nada foi sobrescrito)');
  }
  console.log(
    `Seed ok${force ? ' (--force)' : ''}: ${sections} seções · ${rest} restaurantes · ${acts} atividades · ${themes} temas de festa · ${team} equipe · configurações ${settings ? 'criadas' : 'mantidas'}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
