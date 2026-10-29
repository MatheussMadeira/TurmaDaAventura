# Turma da Aventura — regras do projeto

Site institucional de recreação infantil (restaurantes, eventos corporativos, oficinas) + painel /admin para editar conteúdo. Next.js (App Router) + TypeScript + styled-components + Framer Motion, organizado em Atomic Design.

## Fontes da verdade (pasta `_handoff/`)

- `design-system/` — tokens (`tokens.json`), referência viva dos componentes (`components/bundle.js`, `bundle.css`, `index.d.ts`, `*/README.md`), guia `implementacao.md`, fontes e logos (`brand/`).
- `canvas/` — telas do Claude Design (`.dc.html`). São a referência visual e de texto: leia o HTML para copiar estrutura, classes, copy e alt. Não rodam fora do Claude Design.
- `docs/site.md`, `docs/admin.md`, `docs/motion.md` — especificações. `content/*.json` — dados iniciais.

## Regras inegociáveis

1. **Só o design system.** Nada de cor, fonte, raio, sombra ou duração fora de `tokens.json`. Componentes novos usam os mesmos tokens e padrões (carimbo, trilha tracejada, camuflagem pontual).
2. **Logos**: usar os arquivos de `design-system/brand/` sem alterar (cor, proporção, sombra).
3. **Nenhum preço** no site nem no modelo de dados. Todo orçamento vai para o WhatsApp (`lib/whatsapp.ts`, mensagem contextual por página, evento `whatsapp_click`).
4. **Um CTA primário (verde) por dobra.** Header com “Orçamento” e WhatsAppFloat em todas as páginas.
5. **pt-BR**, “você” / “a gente, a Turma”, botões começam com verbo, caixa de frase (caixa alta só em overline). Sem emoji na interface.
6. **Acessibilidade AA**: alvos ≥ 44px, foco visível, um H1 por página, status sempre ícone + palavra, `prefers-reduced-motion` respeitado.
7. **Movimento**: só tokens `dur-*`, `ease-*`, `move-*`, `stagger`; animar só transform/opacity; conteúdo legível em ≤ 600ms; entradas uma vez com 20% visível.
8. Layout: container 1200px, grid 12 col, seções 96/64px, grades 3 → 2 → 1 em 1024/768.

## Convenções de código

- `src/components/{atoms,molecules,organisms,templates}/Nome/{Nome.tsx,Nome.styles.ts,index.ts}`; átomos não importam moléculas etc.
- Transient props (`$variant`). Tema do styled-components só com `var(--token)`; temas Dia/Noite via `data-theme`.
- Tokens gerados por `scripts/build-tokens.ts` (prebuild) → `cssVars.ts`, `theme.ts`, `motion/tokens.ts`.
- Seções com `data-section="Pagina/Secao"` iguais ao canvas.
- Commits pequenos por etapa; rodar `lint`, `typecheck` e `test` antes de cada commit.
