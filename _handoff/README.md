# Turma da Aventura — pacote de handoff

Tudo o que o Claude Code precisa para implementar o site e o painel /admin.

| Pasta / arquivo | O que é |
| --- | --- |
| `PROMPT-CLAUDE-CODE.md` | O prompt para colar no Claude Code (6 etapas, com paradas para revisão). |
| `CLAUDE.md` | Regras do projeto — copie para a raiz do repositório. |
| `docs/site.md` | Rotas, seções por página, regras gerais e ajustes de componentes. |
| `docs/motion.md` | Tokens de movimento, 12 animações de assinatura, especificação por componente e reduced-motion. |
| `docs/admin.md` | Telas do /admin, editor visual, modelo de dados e segurança. |
| `content/` | Dados iniciais: restaurantes, atividades, equipe, contato e mensagens do WhatsApp. |
| `design-system/` | Design system “Turma da Aventura”: `tokens.json`, componentes de referência (`components/bundle.js`, `bundle.css`, `index.d.ts`, README por componente), `implementacao.md`, `paginas.md`, fontes (OFL) e logos (`brand/`). |
| `canvas/` | O canvas completo do Claude Design: 38 telas `.dc.html` (site desktop e mobile, estados, admin, protótipo animado, Motion), `canvas.json` (layout) e `styles/` (tokens.css, site.css, admin.css, motion.css). Os arquivos `ds/tda/*` do canvas são os mesmos de `design-system/`. |
| `brief/admin-brief-design.md` | Brief original do painel. |

## Como usar

1. Coloque esta pasta na raiz do repositório como `_handoff/` e copie `CLAUDE.md` para a raiz.
2. (Recomendado) Exporte do Claude Design as telas em PNG (menu Compartilhar › Exportar) e salve em `_handoff/canvas/screens/` — o Claude Code consegue olhar imagens e comparar o resultado.
3. Abra o Claude Code na raiz e cole o conteúdo de `PROMPT-CLAUDE-CODE.md`.

## Mapa do canvas

- **Site:** `Main` (Início), `SiteOficina`, `SiteRestaurantes`, `SiteEventos`, `SiteQuemSomos` · mobile: `Mobile*` · estados: `EstadosHeader`, `EstadosInteracao`, `EstadosFormulario`, `QuoteFormBlock`.
- **Motion:** `PrototipoInicio` (+ `Mobile`), `Motion`, `MotionSpec`.
- **Admin:** `AdminLogin` (+ Erro, Mobile), `AdminEditor` (+ Foto, Publicado, Mobile), `AdminPainel` (+ Noite), `AdminRestaurantes` (+ Noite, Mobile), `AdminRestauranteEditar`, `AdminMidia`, `AdminUsuarios` (+ Mobile), `AdminContato`, `AdminEstados`, `AdminExcluir`, `AdminSidebar`.

Dados de exemplo (restaurantes, equipe, endereços “000”, WhatsApp “(00) 00000-0000”) são fictícios — troque pelos reais antes de publicar.
