-- Ajustes v2 · só dados (sem mudança de estrutura): "Oficina" vira "Oficinas" e a seção
-- "Três jeitos" da Início vira "Quatro jeitos". Nada é apagado; o conteúdo editado fica.

-- Página: /oficina → /oficinas (as seções vão junto, pois apontam para o id da página)
UPDATE "Page" SET slug = 'oficinas', title = 'Oficinas' WHERE slug = 'oficina';
UPDATE "PageLock" SET slug = 'oficinas' WHERE slug = 'oficina';

-- Seção da Início: chave nova (o texto é atualizado pelo seed, só onde ainda é o original)
UPDATE "Section" s SET key = 'quatro-jeitos'
  FROM "Page" p
 WHERE s."pageId" = p.id AND p.slug = 'inicio' AND s.key = 'tres-jeitos';

-- Mensagens do WhatsApp por página: a chave "oficina" vira "oficinas". O texto só muda se
-- ainda for o original; se alguém já editou em "Contato e WhatsApp", a edição é mantida.
UPDATE "SiteSettings"
   SET messages = (messages - 'oficina') || jsonb_build_object(
         'oficinas',
         CASE WHEN messages->>'oficina' = 'Olá! Quero saber mais sobre a Oficina.'
              THEN to_jsonb('Olá! Quero saber mais sobre as Oficinas.'::text)
              ELSE messages->'oficina' END)
 WHERE messages ? 'oficina';

-- Mensagem da nova página de festas (só se ainda não existir)
UPDATE "SiteSettings"
   SET messages = messages || jsonb_build_object(
         'festas-e-aniversarios', 'Olá! Quero orçamento para uma festa de aniversário.')
 WHERE NOT (messages ? 'festas-e-aniversarios');
