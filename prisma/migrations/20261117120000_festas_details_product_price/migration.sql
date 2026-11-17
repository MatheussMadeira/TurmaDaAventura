-- Tema de festa: texto longo do modal "Ver detalhes" (vazio = card sem modal).
ALTER TABLE "PartyTheme" ADD COLUMN "details" TEXT NOT NULL DEFAULT '';

-- Produto: preço unitário opcional, em centavos (NULL = valor combinado no WhatsApp).
ALTER TABLE "Product" ADD COLUMN "priceCents" INTEGER;
