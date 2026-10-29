# CamoPattern

Padrão de camuflagem em SVG (tile de 200px que se repete sem emendas) com as cores `camo-1…4`.

- **Átomo** · `atoms/CamoPattern`. Consumidor fornece um `id` único por página e o `tone`.
- `full` = faixas decorativas e divisórias (no máximo uma por página) · `soft` = placeholders · `forest` = textura sobre `surface-forest`.
- Nunca coloque texto direto sobre `full`: use um card (`surface-raised`) por cima.
