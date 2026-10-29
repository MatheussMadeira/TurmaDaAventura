# Site público — especificação

Fonte da verdade visual: arquivos em `canvas/` (ver tabela). O texto exato de cada seção está dentro do `.dc.html` correspondente; os dados de listas estão em `content/*.json`.

## Rotas, telas e mensagens do WhatsApp

| Rota | Canvas desktop (1440) | Canvas mobile (390) | Mensagem do WhatsApp |
| --- | --- | --- | --- |
| `/` | `Main.dc.html` (+ `PrototipoInicio.dc.html` com animações) | `MobileInicio.dc.html` | Olá! Vim pelo site e quero um orçamento. |
| `/oficina` | `SiteOficina.dc.html` | `MobileOficina.dc.html` | Olá! Quero saber mais sobre a Oficina. |
| `/restaurantes` | `SiteRestaurantes.dc.html` | `MobileRestaurantes.dc.html` | Olá! Tenho um restaurante e quero recreação para as famílias. |
| `/eventos-corporativos` | `SiteEventos.dc.html` | `MobileEventos.dc.html` | Olá! Quero recreação infantil para um evento corporativo. |
| `/quem-somos` | `SiteQuemSomos.dc.html` | `MobileQuemSomos.dc.html` | Olá! Quero conversar com a Turma da Aventura. |

As versões mobile no canvas são as mesmas páginas renderizadas a 390px — o responsivo vem das regras de `canvas/styles/site.css` e das container queries do bundle.

Estados: `EstadosHeader.dc.html` (normal, com rolagem, menu mobile aberto), `EstadosInteracao.dc.html` (botões e cards: hover, foco, pressionado, desabilitado; chips; campo com foco), `EstadosFormulario.dc.html` + `QuoteFormBlock.dc.html` (QuoteForm vazio, com erro, preenchido).

## Seções por página (nomes = `data-section` no canvas)

**Início** — `Inicio/Hero` (Hero light; secundário “Conhecer a Oficina”; 3 destaques) · `Inicio/TresJeitos` (3 ServiceCard com link) · `Inicio/Pilares` (3 ValuePillar brand/olive/earth) · `Inicio/ComoFunciona` (Trail 3 etapas) · `Inicio/OndeEsta` (3 RestaurantCard com `destaqueHome` + link “Ver todos os restaurantes”) · `Inicio/Galeria` (6 fotos em grade irregular 4 col: 2×2, 1, 1×2, 1, 2×1, 2×1) · `Inicio/CTA` (CTABanner) · Footer · WhatsAppFloat.

**Oficina** — `Oficina/Hero` · `Oficina/Catalogo` (chips de filtro Todas/Brincadeiras/Oficinas manuais/Gincanas/Natureza com contagem + grade de ServiceCard com foto 16:10, overline = categoria, tags idade + duração) · `Oficina/ComoMontamos` (Trail 4 etapas sobre painel sunken) · `Oficina/SegurancaMateriais` (surface-earth, 6 itens ícone + título + texto) · `Oficina/PreOrcamento` (texto 5 col + QuoteForm 7 col, tipo “Oficina” pré-selecionado) · `Oficina/CTA`.

**Restaurantes** — `Restaurantes/Intro` (SectionHeader level 1 + chips âncora por região + pegadas decorativas) · `Restaurantes/Lista` (grupos por região com título h3 + linha tracejada + contagem; RestaurantCard com “Como chegar”) · `Restaurantes/TemUmRestaurante` (painel surface-earth: 4 benefícios + WhatsAppButton com mensagem de dono + foto 4:5) · `Restaurantes/CTA`.

**Eventos corporativos** (tom mais sóbrio) — Hero `variant="forest"` · `EventosCorporativos/Formatos` (4 ServiceCard em grade 4 → 2 → 1) · `EmpresasAtendidas` (6 placeholders neutros “Logo da empresa”, nota de autorização) · `ComoFunciona` (Trail 4: briefing, proposta, montagem, operação) · `Beneficios` (2 painéis: Para o RH / Para os pais) · `PreOrcamento` (QuoteForm tipo “Evento corporativo”, rótulo “Seu nome e empresa”, título “Pedir proposta”) · `CTA`.

**Quem somos** — `QuemSomos/Historia` (h1 + lead + parágrafo + tagline; foto 5:4 com moldura deslocada e pata) · `Pilares` · `Equipe` (6 TeamCard) · `Seguranca` (3 números: 1:6 monitor/criança até 5 anos, 100% com primeiros socorros, seguro por criança) · `CTA`.

## Regras que valem para todo o site

- Container 1200px, grid 12 colunas; seções 96px (desktop) / 64px (mobile); título de seção → conteúdo 48px; grades 3 → 2 → 1 (1024 / 768).
- Um H1 por página. Um CTA primário (verde) por dobra. Header com botão “Orçamento” e WhatsAppFloat em todas as páginas.
- Nenhum preço, pacote ou “a partir de R$” — nem no modelo de dados.
- Textos em pt-BR, “você” para o leitor, “a gente / a Turma” para a empresa; botões começam com verbo.
- Fotos: enquanto não houver foto, `Media` mostra o placeholder de camuflagem com ícone. Alt sempre descritivo (já escrito no canvas).
- Acessibilidade: AA, alvos ≥ 44px, foco visível (`focus` 3px; `focus-on-forest` no verde-floresta), `aria-current="page"`, chips com `aria-pressed`.

## Ajustes de componente que o design pede (não estão no bundle)

1. **QuoteForm**: props `defaultType` e `nameLabel`; alerta de topo “Revise N campos” no erro; check (stamp) depois das pegadas no envio.
2. **FilterChips** (molécula nova): chips `aria-pressed`, borda `line-strong`, ativo em `brand`, contagem; pílula ativa desliza (`layoutId`).
3. **Header**: sublinhado tracejado que acompanha o hover (`layoutId`).
4. **Hero**: foto 0.96 → 1 e moldura deslocada como pseudo-elemento que desliza (ver `canvas/styles/motion.css`).
5. **Galeria** (organismo novo): grade irregular de 6 `Media` com `Reveal stagger effect="scale"`.
6. **Benefícios / Segurança** (`FeatureList`): ícone em selo 52px (raio 16/16/16/4) + h4 + body-sm, variantes brand/olive/earth.
7. **Stat** (Quem somos): número em Fraunces 48px `brand`, rótulo, descrição.
8. **LogoStrip**: placeholders neutros tracejados.
