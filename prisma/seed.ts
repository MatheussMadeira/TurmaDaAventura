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
  for (const [ri, g] of restaurantes.regioes.entries()) {
    const region = await db.region.upsert({
      where: { slug: g.id },
      update: force ? { name: g.nome, shortName: g.nomeCurto ?? g.nome, order: ri } : {},
      create: { slug: g.id, name: g.nome, shortName: g.nomeCurto ?? g.nome, order: ri },
    });
    for (const [i, r] of g.restaurantes.entries()) {
      const data = {
        name: r.name,
        neighborhood: r.neighborhood,
        schedule: r.schedule,
        address: r.address,
        ages: r.ages,
        mapsUrl: r.mapsUrl,
        regionId: region.id,
        order: i,
        status: r.publicado ? ('PUBLICADO' as const) : ('RASCUNHO' as const),
        destaqueHome: r.destaqueHome,
        imageAlt: r.imageAlt,
      };
      const exists = await db.restaurant.findUnique({ where: { slug: r.slug } });
      if (exists && !force) continue;
      await db.restaurant.upsert({
        where: { slug: r.slug },
        update: data,
        create: { slug: r.slug, ...data },
      });
      n++;
    }
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

async function main() {
  const sections = await seedPages();
  const rest = await seedRestaurants();
  const acts = await seedActivities();
  const team = await seedTeam();
  const settings = await seedSettings();
  await seedAdmin();
  await db.auditLog.create({
    data: {
      action: 'seed',
      entity: 'site',
      summary: `Seed${force ? ' (--force)' : ''}: ${sections} seções, ${rest} restaurantes, ${acts} atividades, ${team} pessoas${settings ? ', configurações' : ''}`,
      published: true,
    },
  });
  console.log(
    `Seed ok${force ? ' (--force)' : ''}: ${sections} seções · ${rest} restaurantes · ${acts} atividades · ${team} equipe · configurações ${settings ? 'criadas' : 'mantidas'}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
