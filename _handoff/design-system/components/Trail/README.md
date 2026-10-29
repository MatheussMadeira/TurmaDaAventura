# Trail

“Como funciona” desenhado como uma trilha tracejada com marcos — horizontal no desktop, vertical no mobile.

- **Organismo** · `organisms/Trail`. Consumidor fornece `steps` (3–4) com `title`, `text`, `icon`.
- Use em `surface-sunken`. Primeiro passo é sempre o contato pelo WhatsApp.
- Movimento: quando 35% da trilha está visível, a linha tracejada se desenha em `dur-trail` e cada marcador carimba (`ease-stamp`) quando a linha chega nele.
