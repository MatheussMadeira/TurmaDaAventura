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

| Variável                                       | Para quê                                                                   |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_SITE_URL` | número (DDI+DDD) e domínio públicos                                        |
| `DATABASE_URL`                                 | conexão **pooled** do Neon (app em runtime)                                |
| `DIRECT_URL`                                   | conexão **direta** (migrações e seed)                                      |
| `PRODUCTION_DB_HOSTS`                          | hosts do banco de produção; o `seed --force` se recusa a rodar contra eles |
| `AUTH_SECRET`                                  | segredo das sessões (`npx auth secret`)                                    |
| `ADMIN_EMAIL`                                  | e-mail da primeira conta de Administração                                  |
| `BLOB_READ_WRITE_TOKEN`                        | token do Vercel Blob                                                       |
| `BLOB_ACCESS`                                  | `public` (padrão) ou `private` — veja abaixo                               |

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

| Comando                               | O que faz                                                            |
| ------------------------------------- | -------------------------------------------------------------------- |
| `npm run dev` / `build` / `start`     | Next (gera os tokens antes)                                          |
| `npm run lint` · `typecheck` · `test` | ESLint · tsc · Vitest                                                |
| `npm run e2e`                         | Playwright (usa o Chrome instalado) — veja “Testes de ponta a ponta” |
| `npm run tokens` · `tokens:check`     | gera / compara os tokens com `_handoff`                              |
| `npm run smoke:media`                 | sobe uma foto de teste ao Blob, confere e remove                     |

## Estrutura

```
src/app/(site)/      páginas públicas (Início, Oficina, Restaurantes, Eventos, Quem somos)
src/app/admin/       painel (login, painel, restaurantes, atividades, equipe, fotos, usuários, contato)
src/app/admin/(editor)/  editor visual (/admin/editor) e a prévia em iframe (/admin/preview/[slug])
src/admin/editor/    editor: painel gerado do schema, prévia, recorte de foto, desfazer/refazer
src/components/      Atomic Design (atoms · molecules · organisms · templates)
src/content/         schemas zod das seções, textos padrão e dados do seed
src/server/          leitura do publicado, publicação, mídia, usuários (server-only)
prisma/              schema, migrações e seed
```

O site público só lê o conteúdo **publicado**; rascunhos vivem em `Section.draft` até “Publicar alterações”.

## Editor visual

`/admin/editor?pagina=inicio` (permissão “site”: Administração e Equipe).

- A prévia é a página real num iframe, lendo o **rascunho**. O painel da direita é gerado do schema zod de cada seção (limites de caracteres, proporção das fotos) — um campo novo no schema aparece no editor sozinho.
- Texto: um clique seleciona, o segundo edita no lugar. Foto: clique para trocar (biblioteca ou envio com recorte na proporção do slot, descrição obrigatória e autorização dos responsáveis).
- O rascunho salva sozinho (~1 s) e **não vai ao ar** até “Publicar alterações”. Ordem e visibilidade das seções também são rascunho.
- **Uma pessoa por vez em cada página:** a reserva fica no banco (`PageLock`, 90 s, renovada a cada ~25 s e solta ao sair). Quem chega depois não entra; gravar, publicar e descartar exigem a reserva **no servidor**. Se a aba some, a reserva expira sozinha.

## Perfis e segurança

- **Administração:** tudo. **Equipe:** site, fotos, restaurantes, atividades e equipe — sem Usuários e Contato. Checado no servidor (proxy, páginas e Server Actions), não só no menu.
- Login: 5 erros bloqueiam a conta por 15 min (no banco); mensagem sempre genérica; troca de senha obrigatória no primeiro acesso; sempre existe ≥ 1 Administração ativa.
- Papel, “ativo” e a versão do token são lidos do banco a cada requisição: desativar ou rebaixar vale na hora.

## Testes de ponta a ponta

```bash
npm run build && npx next start -p 3200   # um servidor de produção
PLAYWRIGHT_BASE_URL=http://localhost:3200 npx playwright test --workers=1
```

Cobrem: orçamento (erro → corrige → abre o wa.me), login e bloqueio, troca de senha, permissões, criar usuário da Equipe, editor (editar, desfazer, publicar, esconder/reordenar), troca de foto com descrição e a reserva de edição.

- Rodam contra o banco e o Blob **de desenvolvimento** (`.env.local`). **Nunca aponte para a produção.**
- Os testes criam usuários `@teste.invalid` e uma foto `E2E …`; ao final apagam tudo e devolvem o conteúdo do Início ao estado de antes.
- O teste de foto envia um arquivo de verdade ao Blob e o remove; precisa de `BLOB_READ_WRITE_TOKEN` válido.

## Publicar na Vercel

1. Variáveis de ambiente (Production **e** Preview): todas da tabela acima. `NEXT_PUBLIC_SITE_URL` = domínio real (alimenta canonical, Open Graph, sitemap e o JSON-LD). `AUTH_SECRET` próprio de produção.
2. Migrações: `npm run db:deploy` contra o banco de produção (**antes** do deploy, sempre que houver migração nova).
3. Primeira vez: `npm run db:seed` (cria o conteúdo e a conta de `ADMIN_EMAIL`; anote a senha temporária).
4. O Blob de produção precisa ser do mesmo tipo de `BLOB_ACCESS`.

## Checklist de qualidade

- **Lighthouse (build local, mobile):** Acessibilidade 100 e Performance 99–100 nas cinco páginas. O número que vale é o do **PageSpeed Insights no preview da Vercel** (pagespeed.web.dev, aba Celular): rode nas cinco URLs e confira Performance ≥ 90 e Acessibilidade ≥ 95.
- **SEO local:** `LocalBusiness` em JSON-LD, `metadata` por página, Open Graph com o logo completo, `sitemap.xml` e `robots.txt` (`/admin` fora do índice).
- **LGPD:** o formulário de orçamento **não armazena** dados (só monta a mensagem e abre o WhatsApp); nenhuma ferramenta de analytics é carregada por padrão.
