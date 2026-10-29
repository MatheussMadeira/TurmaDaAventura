# Turma da Aventura — site e painel /admin

Next.js 16 (App Router, Turbopack) · TypeScript estrito · styled-components · Framer Motion · Prisma 7 + Postgres (Neon) · Auth.js · Vercel Blob.

Fontes da verdade de design e regras: `CLAUDE.md` e `_handoff/`.

## Começando

```bash
npm install              # roda `prisma generate` (postinstall)
cp .env.example .env.local   # preencha — veja a tabela abaixo
npm run db:migrate       # aplica as migrações (usa DIRECT_URL)
npm run db:seed          # cria o conteúdo inicial e a conta de Administração
npm run dev
```

O `db:seed` imprime a **senha temporária** da conta `ADMIN_EMAIL` **uma única vez**; a troca é obrigatória no primeiro acesso.

## Variáveis de ambiente

| Variável | Para quê |
| --- | --- |
| `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_SITE_URL` | número (DDI+DDD) e domínio públicos |
| `DATABASE_URL` | conexão **pooled** do Neon (app em runtime) |
| `DIRECT_URL` | conexão **direta** (migrações e seed) |
| `PRODUCTION_DB_HOSTS` | hosts do banco de produção; o `seed --force` se recusa a rodar contra eles |
| `AUTH_SECRET` | segredo das sessões (`npx auth secret`) |
| `ADMIN_EMAIL` | e-mail da primeira conta de Administração |
| `BLOB_READ_WRITE_TOKEN` | token do Vercel Blob |
| `BLOB_ACCESS` | `public` (padrão) ou `private` — veja abaixo |

### Fotos (Vercel Blob)

- **Padrão: store público.** `BLOB_ACCESS=public`. As fotos usam a URL direta do CDN do Blob.
- **Alternativa: store privado.** `BLOB_ACCESS=private`. O site passa a servir as fotos por `/api/media/<caminho>` (cache longo e imutável); os arquivos não ficam expostos fora do site.
- O tipo é definido na criação do store, e o token precisa ser do mesmo tipo escolhido em `BLOB_ACCESS`.
- Todo upload: valida o tipo pelo conteúdo, recusa > 10 MB, remove EXIF/GPS, aplica a orientação e gera WebP em 480/960/1600 px (+ master de até 2000 px).

## Banco e seed

```bash
npm run db:migrate            # prisma migrate dev
npm run db:deploy             # prisma migrate deploy (produção/CI)
npm run db:seed               # cria o que falta; NÃO sobrescreve edições
npm run db:seed -- --force    # recria o conteúdo das seções (textos do canvas)
```

`--force` **recusa rodar** em banco de produção (`VERCEL_ENV=production` ou host em `PRODUCTION_DB_HOSTS`). Só com `ALLOW_DESTRUCTIVE_SEED=1` ele prossegue — e mesmo assim exige digitar o host do banco no terminal.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` / `build` / `start` | Next (gera os tokens antes) |
| `npm run lint` · `typecheck` · `test` | ESLint · tsc · Vitest |
| `npm run e2e` | Playwright (usa o Chrome instalado) |
| `npm run tokens` · `tokens:check` | gera / compara os tokens com `_handoff` |
| `npm run smoke:media` | sobe uma foto de teste ao Blob, confere e remove |

## Estrutura

```
src/app/(site)/      páginas públicas (Início, Oficina, Restaurantes, Eventos, Quem somos)
src/app/admin/       painel (login, painel, restaurantes, atividades, equipe, fotos, usuários, contato)
src/components/      Atomic Design (atoms · molecules · organisms · templates)
src/content/         schemas zod das seções, textos padrão e dados do seed
src/server/          leitura do publicado, publicação, mídia, usuários (server-only)
prisma/              schema, migrações e seed
```

O site público só lê o conteúdo **publicado**; rascunhos vivem em `Section.draft` até “Publicar alterações”.
