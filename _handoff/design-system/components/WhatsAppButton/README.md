# WhatsAppButton

O CTA do site: botão que abre o WhatsApp com mensagem pronta.

- **Molécula** · `molecules/WhatsAppButton`. Consumidor fornece `phone` (de `NEXT_PUBLIC_WHATSAPP`) e uma `message` **contextual** à página.
- Mensagens padrão: Home "Olá! Vim pelo site e quero um orçamento." · Restaurantes "Olá! Tenho um restaurante e quero recreação para as famílias." · Eventos "Olá! Quero recreação infantil para um evento corporativo." · Oficina "Olá! Quero saber mais sobre a Oficina."
- Rótulos: "Pedir orçamento no WhatsApp", "Chamar no WhatsApp", "Orçamento" (header). Nunca "Comprar", "Ver preços".
- Dispare um evento de analytics (`whatsapp_click` com `page` e `placement`) no clique.
