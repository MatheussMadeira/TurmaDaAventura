# Ajustes v3 — página de Produtos (pedido pelo WhatsApp, sem checkout)

> Como usar: descompacte em `_handoff/ajustes-v3-produtos/`, coloque os PNGs em `_handoff/ajustes-v3-produtos/screens/` e cole o texto abaixo no Claude Code.

---

Nova página de Produtos. O design está em `_handoff/ajustes-v3-produtos/canvas/` (copie para `_handoff/canvas/`, substituindo os de mesmo nome) e os dados em `content/produtos.json`. PNGs em `screens/`. Siga o `CLAUDE.md`. Branch `produtos`; pare no fim para eu revisar.

## Regras de negócio
- **Sem preço, total, frete, pagamento ou checkout.** Nenhum campo de preço no banco. A sacola só monta a lista e abre o WhatsApp com a mensagem pronta.
- Produtos: lembrancinhas de festa (vendidas a partir de uma quantidade mínima, personalizáveis) e itens vendidos também nos restaurantes parceiros (kits, brinquedos e livros).

## Site — `/produtos` (`SiteProdutos.dc.html`, `MobileProdutos.dc.html`, `EstadosSacola.dc.html`)
- Seções: `Produtos/Intro` (h1 + aviso “Nenhum pagamento é feito no site”), `Produtos/Catalogo` (FilterChips: Todos, Lembrancinhas de festa, Kits de atividade, Brinquedos e livros + grade 3 → 2 → 1 de ProductCard), `Produtos/ComoFunciona` (Trail de 3 etapas), `Produtos/CTA` (personalização para festa).
- **ProductCard** (molécula nova; estilos em `canvas/styles/site.css`, bloco “Produtos”): foto 4:3, overline da categoria, nome h4, descrição, tags (“Mín. N un.” olive, “Personalizável” brand, “Nos restaurantes” earth), botão outline “Adicionar à sacola”. Na sacola, o card ganha borda brand + “Na sacola” + **Stepper** (− qtd +, alvos de 44px).
- Quantidade começa no mínimo do produto; diminuir abaixo do mínimo tira da sacola.
- **Sacola** (organismo novo `BagDrawer` + `BagButton`):
  - Botão flutuante “Ver sacola” com contador **substitui o WhatsAppFloat** sempre que a sacola tem itens, em qualquer página do site (a sacola persiste entre páginas). Sacola vazia: volta o WhatsAppFloat. Some quando um QuoteForm está visível, como o WhatsAppFloat.
  - Gaveta lateral de 440px no desktop, folha inferior no celular. Esc fecha, foco preso, foco volta ao botão, `aria-modal`.
  - Conteúdo: itens com stepper e “Remover”, campos opcionais “Seu nome”, “Para quando? (se for festa)”, “Personalização e observações”, aviso “Sem pagamento no site”, botão primário “Enviar pedido no WhatsApp” (desabilitado se vazia) e “Continuar escolhendo”. Estado vazio com o símbolo das pegadas.
  - Mensagem (início editável no admin, em Contato e WhatsApp):
    ```
    Olá, Turma da Aventura! Quero fazer um pedido pelo site:

    • 20 × Kit mini horta
    • 2 × Massinha natural

    Nome: …
    Para quando: …
    Observações: …
    ```
    Linhas vazias não entram. Use o mesmo `openWhatsapp` do QuoteForm (aba aberta no clique no desktop; mesma aba no mobile).
  - Persistência: localStorage por 7 dias (com try/catch). Depois do envio, esvaziar a sacola com toast “Pedido enviado. Desfazer”.
  - Analytics: `whatsapp_click` com `placement: "bag"`, `items` e `units`.
- Animações: Reveal/stagger nos cards, `layout` no filtro (como nas Oficinas), número do botão carimba (`ease-stamp`) ao adicionar, gaveta entra com `dur-medium`/`ease-enter` (deslocando 24px; no celular de baixo para cima). Reduced-motion: só fade.

## Navegação
- Menu: `Início · Oficinas · Festas · Restaurantes · Eventos · Produtos · Quem somos` + Orçamento. Rótulos curtos no menu (“Festas”, “Eventos”); completos no rodapé (“Festas e aniversários”, “Eventos corporativos”). Confira de novo o ponto de quebra do Header (≈1180px) com 7 itens.
- Rodapé, sitemap, metadata e Open Graph com Produtos.

## Admin (`AdminProdutos.dc.html`, `AdminSidebar`, `AdminContato`)
- Modelo `Product`: nome, slug, categoria, descrição curta (≤120), imagem + alt obrigatório, `minQty` (≥1), `personalizavel`, `nosRestaurantes`, ordem, status (RASCUNHO | PUBLICADO | ESGOTADO). **Sem preço.** Categorias fixas (enum) por enquanto.
- Tela Produtos: abas (No site, Rascunhos, Esgotados, Todos), tabela com subir/descer, editar, excluir; formulário ao lado; tabela vira cartões no celular. Item “Produtos” na barra lateral (grupo Conteúdo). Esgotado aparece no site com tag “Esgotado” e sem botão de adicionar.
- Contato e WhatsApp: campo “Produtos · início da mensagem da sacola”.
- Seed a partir de `content/produtos.json`, sem sobrescrever o que já foi editado.

## Critérios de aceite
- Testes: zero preço (inclusive no JSON-LD — use `ItemList`/`Product` sem `offers`), um H1, axe, alt, fluxo Playwright “adicionar 2 produtos → ajustar quantidade → abrir sacola → enviar” conferindo o texto do link wa.me, sacola sobrevive a recarregar a página, Esc fecha a gaveta.
- Lighthouse da página no nível das outras.
- Pare e me mostre os commits, a migration nova e como testar.
