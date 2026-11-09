# CreatorCredit — assinatura do criador no rodapé

> Como usar: copie a pasta `creator-credit/` e o `CreditoCriador.dc.html` para `_handoff/creator-credit/` e cole o texto abaixo no Claude Code.

---

Adicione o organismo **CreatorCredit** ao site. Referência visual: `_handoff/creator-credit/CreditoCriador.dc.html` (+ PNG, se houver). Já existe um rascunho pronto em `_handoff/creator-credit/creator-credit/` (`CreatorCredit.tsx`, `CreatorCredit.styles.ts`, `index.ts`): use como ponto de partida e adapte aos padrões do projeto.

1. Mova para `src/components/organisms/CreatorCredit/` e corrija os imports (`Icon`, `CamoPattern`) para os caminhos reais. Se o átomo `Button` já aceitar ícone customizado ou `as="a"`, use-o nos dois links em vez das classes locais.
2. Renderize **uma vez**, no layout do grupo `(site)`, logo abaixo do `Footer` (última faixa verde-floresta). Não aparece no `/admin`.
3. Links via variáveis de ambiente: `NEXT_PUBLIC_CREATOR_LINKEDIN` e `NEXT_PUBLIC_CREATOR_GITHUB` (adicione ao `.env.example`). Se algum estiver vazio, esconda o botão correspondente; se os dois estiverem vazios, o gatilho continua, mas o diálogo mostra só o texto.
4. Comportamento:
   - Gatilho: “Trilha aberta por **Matheus Madeira**”, com as 4 pegadas acendendo em sequência no hover/foco.
   - Clique: abre a “Ficha do guia” num `<dialog>` nativo (`showModal`). Esc e clique fora fecham, o foco volta ao gatilho e `aria-expanded` acompanha.
   - Animações: cartão entra com `ease-stamp`, o selo carimba, o anel de texto gira devagar, a mini-trilha se desenha e os pontos carimbam. Tudo com tokens; com reduced-motion, só fade.
   - No celular, o diálogo vira folha inferior.
5. Dispare o evento de analytics `creator_credit_open` ao abrir e `creator_credit_click` com `{ network: 'linkedin' | 'github' }` nos links.
6. Garanta que o teste de “sem cor literal” continua passando, além do axe (diálogo com `aria-labelledby` e botão de fechar com rótulo) e de um Playwright simples (abre, Esc fecha, foco volta).

Pare e me mostre.
