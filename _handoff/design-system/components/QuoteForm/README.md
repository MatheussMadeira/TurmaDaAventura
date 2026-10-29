# QuoteForm

Pré-orçamento: o visitante preenche o básico e o formulário monta a mensagem e abre o WhatsApp — nada é salvo, nenhum preço aparece.

- **Organismo** · `organisms/QuoteForm`. Consumidor fornece `phone`, `eventTypes` (padrão: Restaurante, Evento corporativo, Oficina, Festa ou evento particular, Outro) e, opcionalmente, `onSubmit` para registrar analytics antes de redirecionar.
- Só nome e tipo são obrigatórios. Em Eventos corporativos, troque "Seu nome" por "Seu nome e empresa".
- Movimento: campos com erro chacoalham e a mensagem desce; ao enviar, o botão mostra pegadas pulsando e "Abrindo o WhatsApp…" por 700ms antes de redirecionar.
