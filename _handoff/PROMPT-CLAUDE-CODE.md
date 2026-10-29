# Prompt para o Claude Code

> Como usar: descompacte este pacote dentro da raiz do repositório como `_handoff/`, copie `_handoff/CLAUDE.md` para a raiz e cole o texto abaixo no Claude Code. Ele foi escrito para rodar em etapas — o Claude Code deve parar ao fim de cada etapa para você revisar.

---

Você vai implementar o site e o painel administrativo da **Turma da Aventura** a partir do pacote de handoff em `_handoff/`. Leia primeiro, nesta ordem: `CLAUDE.md`, `_handoff/README.md`, `_handoff/design-system/README.md`, `_handoff/design-system/implementacao.md`, `_handoff/docs/site.md`, `_handoff/docs/motion.md`, `_handoff/docs/admin.md`. Use os arquivos de `_handoff/canvas/*.dc.html` como referência visual e de texto (estrutura, copy, alt, nomes de seção) e `_handoff/design-system/components/bundle.js` + `bundle.css` como implementação de referência de cada componente (comportamento, classes, estados e animações) — reescreva em TypeScript + styled-components, não importe o bundle.

**Stack:** Next.js 15 (App Router) + TypeScript estrito + styled-components (SSR com registry) + Framer Motion (`LazyMotion`/`domAnimation`) + Prisma/PostgreSQL + Auth.js (credenciais) + armazenamento de imagens S3-compatível (ou Vercel Blob) + sharp. Testes: Vitest + Testing Library; Playwright para fluxos críticos. Lint/format: ESLint + Prettier.

**Antes de começar**, me pergunte e espere a resposta sobre: (a) hospedagem (Vercel?) e banco (Neon/Supabase?); (b) onde guardar imagens; (c) número de WhatsApp real (`NEXT_PUBLIC_WHATSAPP`) e domínio. Se eu não souber, siga com Vercel + Neon + Vercel Blob e variáveis de ambiente de exemplo em `.env.example`.

## Etapa 1 — Fundação
1. Criar o projeto (App Router, `src/`), configurar styled-components (compiler + registry), ESLint/Prettier, Vitest.
2. Copiar fontes para `public/fonts` e logos para `public/brand` (sem alterar arquivos). `next/font/local` conforme `implementacao.md`.
3. `scripts/build-tokens.ts` (prebuild) lendo `_handoff/design-system/tokens.json` → `src/design-system/tokens/cssVars.ts`, `theme.ts` e `src/motion/tokens.ts` (incluindo `duration`, `easing`, `distance`). `GlobalStyle` com as classes de texto (display, h1…caption) e breakpoints mobile.
4. Página `/_dev/tokens` simples para conferir cores (Dia/Noite), tipografia e movimento.
**Pare e me mostre.**

## Etapa 2 — Design system em React
Implementar todos os componentes de `index.d.ts` (átomos → moléculas → organismos) com a mesma API, estados e animações do bundle, mais os ajustes de `docs/site.md` (“Ajustes de componente”): QuoteForm com `defaultType`/`nameLabel`/alerta de topo/check no envio, FilterChips, sublinhado do Header com `layoutId`, Hero com foto 0.96 → 1 e moldura deslizando, Gallery, FeatureList, Stat, LogoStrip. Motion: `Reveal`, `variants.ts`, `useScrollDirection`, `useInView`, `PageTransition` (`app/template.tsx`), `MotionConfig reducedMotion="user"`. Storybook opcional; no mínimo uma página `/_dev/componentes` com todos os estados (espelhando `EstadosHeader`, `EstadosInteracao`, `EstadosFormulario`). Testes de acessibilidade básicos (axe) nos componentes.
**Pare e me mostre.**

## Etapa 3 — Páginas do site
Montar `/`, `/oficina`, `/restaurantes`, `/eventos-corporativos`, `/quem-somos` exatamente como no canvas (desktop 1440 e mobile 390), com `data-section` iguais, textos e alt do canvas, dados de `content/*.json` (temporariamente lidos de arquivo). Todas as animações de `docs/motion.md` (as 12 assinaturas), conferindo com `canvas/PrototipoInicio.dc.html` e `canvas/Motion.dc.html`. WhatsApp: mensagens por página, `whatsapp_click` com `page` e `placement`. SEO: `metadata` por página, Open Graph com o logo completo, JSON-LD `LocalBusiness`. Filtro da Oficina com layout animado.
Critérios: Lighthouse Performance ≥ 90 e Acessibilidade ≥ 95 no mobile; zero preço; um H1 por página; foco visível; reduced-motion sem deslocamentos.
**Pare e me mostre.**

## Etapa 4 — Backend de conteúdo
Prisma com o modelo de `docs/admin.md` (Page/Section com `draft` e `published`, Restaurant, Region, Activity, TeamMember, Media, SiteSettings, User, AuditLog). Seed a partir de `content/*.json` e dos textos do canvas (cada seção vira um registro com schema zod e limites de caracteres). O site passa a ler só o conteúdo **publicado** (cache + `revalidatePath`). Upload de imagem com validação, remoção de EXIF e geração de tamanhos.
**Pare e me mostre.**

## Etapa 5 — Painel /admin
Auth.js com credenciais, papéis ADMIN/EQUIPE, middleware em `/admin/**`, bloqueio após 5 tentativas (15 min), senha temporária exibida uma vez + troca obrigatória, invariante de ≥ 1 ADMIN ativo. Telas conforme `docs/admin.md` e o canvas (`Admin*.dc.html`): login, painel (Dia e Noite), editor visual, restaurantes (lista + editar com prévia ao vivo), atividades, equipe, fotos, usuários, contato/WhatsApp, estados (skeleton, vazio, erro, salvo, banco desatualizado, sem permissão) e diálogos de confirmação (Esc fecha, foco preso).
**Editor visual:** iframe de `/admin/preview/[slug]` em `draftMode()` com os mesmos componentes do site envoltos em `EditableText`/`EditableImage`; seleção e edição por `postMessage`; painel da direita gerado pelo schema da seção; seções reordenáveis/ocultáveis; desfazer/refazer; rascunho automático; “Publicar alterações” copia rascunho → publicado em transação e revalida as rotas; diálogo de trocar foto com biblioteca, upload, recorte com proporção fixa e descrição obrigatória. Tabelas viram cartões abaixo de 768px.
**Pare e me mostre.**

## Etapa 6 — Qualidade e entrega
Testes E2E (Playwright): pedir orçamento pelo QuoteForm (erro → corrige → abre wa.me), editar o título da Início no admin e publicar (aparece no site), trocar foto com descrição, criar usuário Equipe e verificar permissões. Checklist final de `implementacao.md` (LGPD, SEO local, Lighthouse). README com setup, variáveis de ambiente e como rodar o seed.

Regras gerais: siga `CLAUDE.md` à risca; quando o canvas e os docs divergirem, o canvas manda no visual e os docs mandam no comportamento — e me avise da divergência. Não invente cores, fontes, textos de marketing ou preços. Se faltar uma decisão, pergunte.
