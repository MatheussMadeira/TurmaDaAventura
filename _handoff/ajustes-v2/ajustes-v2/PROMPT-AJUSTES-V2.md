# Ajustes v2 — feedback do cliente

> Como usar: descompacte esta pasta em `_handoff/ajustes-v2/` no repositório, coloque os PNGs novos em `_handoff/ajustes-v2/screens/` e cole o texto abaixo no Claude Code.

---

O cliente aprovou o site com três pedidos. O design atualizado está em `_handoff/ajustes-v2/canvas/` (substitui os arquivos de mesmo nome em `_handoff/canvas/`; copie-os para lá) e os dados novos em `_handoff/ajustes-v2/content/`. Os PNGs das telas novas/alteradas estão em `_handoff/ajustes-v2/screens/`. Siga o `CLAUDE.md` como sempre. Trabalhe num branch `ajustes-v2` e pare para eu revisar no fim.

## 1. Nova página: Festas e aniversários
- Rota `/festas-e-aniversarios`. Referência: `SiteFestas.dc.html` (desktop) e `MobileFestas.dc.html` (390px).
- Seções (`data-section`): `Festas/Hero` (Hero light, secundário “Ver os temas” → `#temas`), `Festas/Formatos` (3 ServiceCard), `Festas/Temas` (6 ServiceCard com foto 16:10 e tags, dados em `content/temas-festa.json`), `Festas/OQueInclui` (FeatureList de 6 itens em surface-earth), `Festas/ComoFunciona` (Trail de 4 etapas), `Festas/PreOrcamento` (QuoteForm com `defaultType="Festa ou aniversário"`, título “Monte a festa”), `Festas/CTA`.
- Mensagem do WhatsApp: “Olá! Quero orçamento para uma festa de aniversário.”
- Todas as animações padrão (Reveal, Trail, stagger nos cards). Sem preço, sem “pacotes”.
- Banco: novo modelo `PartyTheme` (como Activity: título, descrição, tags, ícone, imagem, ordem, status) + seções da página com schema zod. Admin: item “Temas de festa” na barra lateral (grupo Conteúdo), com lista + editar com prévia do ServiceCard. A página entra no seletor do editor visual.
- SEO: metadata, Open Graph, entrada no sitemap.

## 2. Restaurantes sem regiões (o cliente é de Belo Horizonte)
- Remover o conceito de região de tudo: modelo `Region` e `regionId`, `nomeCurto`, agrupamento na página, chips de âncora, coluna e filtro no admin, campo no formulário de edição. Migration nova (não editar a antiga) que remove a tabela/coluna sem perder os restaurantes.
- Página Restaurantes (`SiteRestaurantes.dc.html`): intro sem chips + um único título “N restaurantes com a Turma” + grade 3 → 2 → 1 com todos os restaurantes, na ordem definida no admin.
- Cards: overline = só o bairro (na Início também). Endereço sem bairro.
- Cidade passa a ser **Belo Horizonte · MG** em todo lugar (rodapé, contato, JSON-LD `addressLocality`/`addressRegion`, metadata). Dados novos em `content/restaurantes.json` e `content/contato.json` (bairros de BH; ainda fictícios).
- Admin (`AdminRestaurantes`, `AdminRestauranteEditar`, `AdminPainel`): sem região; link do mapa opcional (vazio = busca pelo endereço); KPI “Em N bairros”.

## 3. “Oficina” → “Oficinas”
- Rota `/oficinas` com **redirect 301** de `/oficina`. Menu, títulos, overline do Hero, `data-section` (`Oficinas/...`), mensagem do WhatsApp (“Olá! Quero saber mais sobre as Oficinas.”), botão “Conhecer as Oficinas”, tipo do QuoteForm “Oficinas”, admin “Atividades das Oficinas”, sitemap e metadata.
- Lista de tipos do QuoteForm: `Festa ou aniversário`, `Restaurante (recreação fixa)`, `Evento corporativo`, `Oficinas`, `Outro`.

## 4. Consequências na navegação e na Início
- Menu (Header): `Início · Oficinas · Festas · Restaurantes · Eventos corporativos · Quem somos` + Orçamento. No menu o rótulo é **“Festas”**; no rodapé, **“Festas e aniversários”**.
- Com 6 itens o menu completo não cabe em 1024px: faça o Header virar menu sanfona abaixo de ~1180px de container (meça com os textos reais e ajuste para não quebrar linha nem encostar no botão). O sublinhado animado continua funcionando. Teste em 1024, 1180, 1280 e 1440.
- Início (`Main.dc.html`): a seção vira **“Quatro jeitos de viver a aventura”** (`Inicio/QuatroJeitos`) com 4 ServiceCard em grade 4 → 2 → 1, Festas primeiro. Lead do Hero: “…para festas, restaurantes, empresas e escolas…”. Rodapé com o texto “sobre” novo (ver `about` nos canvases).
- Quem somos: “…para festas, restaurantes, empresas e escolas de Belo Horizonte.”
- Seed: atualizar textos das seções existentes **sem apagar o que o cliente já editou no admin** — só altere campos que ainda têm o texto original do seed; liste para mim o que não foi atualizado por já ter sido editado.

## Critérios de aceite
- Testes atualizados (rotas, um H1, zero preço, axe, alt, redirect 301, Playwright do menu com 6 itens e do filtro das Oficinas).
- Lighthouse da página nova no mesmo nível das outras.
- Nada de região em código, banco, admin ou texto (`grep -ri "regi[aã]o\|zona "` sem resultados no `src/`).
- Pare e me mostre: lista de commits, o que mudou no banco e como testar.
