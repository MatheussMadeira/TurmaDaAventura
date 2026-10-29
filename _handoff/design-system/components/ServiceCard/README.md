# ServiceCard

Card de serviço/atividade — usado na Home (três frentes), na Oficina (catálogo) e em Eventos (formatos).

- **Molécula** · `molecules/ServiceCard`. Consumidor fornece `title`, `description` (≤ 2 linhas), `icon` **ou** `image`, `tags` e `href` quando leva a outra página.
- `tone="earth"` para destacar um card em cada grupo (no máximo um).
- Grids: 3 colunas ≥ 1024px, 2 ≥ 768px, 1 abaixo; gap `space-6`/`space-5`.
- Sem preço, sem "a partir de R$". Duração e faixa etária vão em `tags`.
- Movimento: com `href`, sobe 4px no hover, a foto dá zoom de 1.04 e a seta anda `move-xs`. Entre em grade com `Reveal stagger`.
