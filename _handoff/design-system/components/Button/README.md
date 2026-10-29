# Button

Botão com sombra sólida de "carimbo" que afunda ao clicar — a assinatura tátil do sistema.

- **Átomo** · `atoms/Button`. Consumidor fornece `children` (verbo no infinitivo, curto), `variant`, `size`, ícones opcionais e `href` quando navega.
- `primary` (verde `brand`) = a ação da página — quase sempre o WhatsApp. **Um por viewport.**
- `earth` (marrom) = secundária forte (ex.: "Conheça a Oficina" na Home). `outline`/`ghost` = terciárias.
- `inverse` e `ghost-inverse` existem **só** sobre `surface-forest` (faixa de CTA, rodapé, hero floresta).
- Altura mínima 44px (`tap-min`); `lg` (56px) no hero e na CTA. `fullWidth` no mobile em formulários.
- Não use o verde do WhatsApp (#25D366): o botão de WhatsApp é verde da marca + ícone.
- Movimento: sobe 1px no hover; afunda `move-xs` ao pressionar (60ms, sem sombra); volta com `ease-stamp` em `dur-fast`.
