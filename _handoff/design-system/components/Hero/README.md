# Hero

Abertura de página: overline, título display, lead, CTA de WhatsApp, link secundário e destaques com check.

- **Organismo** · `organisms/Hero`. Consumidor fornece `title`, `lead`, `image` (foto de crianças em ação), `secondary`, `highlights` (até 3) e `variant`.
- `light` na Home; `forest` em Eventos corporativos (tom mais sóbrio para RH/empresas).
- Título até ~5 palavras. A pata decorativa só aparece no desktop grande.
- Movimento: ao carregar, os textos sobem escalonados (`dur-slow`, `stagger`), a foto aparece e a pata "pisa" no canto com `ease-stamp`. Não envolva em `Reveal`.
