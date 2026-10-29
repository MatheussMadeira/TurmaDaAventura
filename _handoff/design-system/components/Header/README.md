# Header

Header fixo com logo, navegação principal e CTA de orçamento; vira menu sanfona abaixo de 1024px (container query).

- **Organismo** · `organisms/Header`. Consumidor fornece `current` (pathname), `items` (padrão: Início, Oficina, Restaurantes, Eventos corporativos, Quem somos), `phone` e `message`.
- No Next.js use `usePathname()` para `current` e `next/link` nos itens.
- Ganha `shadow-md` depois de rolar 8px (adicione a classe via `IntersectionObserver`).
- Movimento: depois de 8px de rolagem encolhe (76 → 64px) e ganha sombra; ao descer além de 240px se esconde e volta ao subir (`dur-medium`, `ease-standard`). O hambúrguer vira X e os links do menu mobile entram escalonados. Passe `static` para desligar.
