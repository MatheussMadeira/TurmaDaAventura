# WhatsAppFloat

Botão flutuante de WhatsApp, fixo no canto inferior direito em todas as páginas.

- **Organismo** · `organisms/WhatsAppFloat`. Consumidor fornece `phone`, `message` e `label` opcional (some abaixo de 640px).
- Esconda-o enquanto o `QuoteForm` estiver visível na tela para não competir.
- Movimento: surge 1,5s após carregar (ou com 30% de rolagem), pulsa um anel a cada 20s e some enquanto um `QuoteForm` está na tela.
