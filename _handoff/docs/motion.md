# Motion — animações e microinterações

Referência visual: `canvas/Motion.dc.html` (escala + 12 demos), `canvas/MotionSpec.dc.html` (tabela por componente), `canvas/PrototipoInicio.dc.html` (Home com tudo funcionando). Implementação de referência já existente: `design-system/components/bundle.css` (seção “Motion”) e `bundle.js` (`useInView`, `Reveal`, Header, Trail, ValuePillar, QuoteForm, WhatsAppFloat). Extras que ainda não estão no bundle: `canvas/styles/motion.css` (parte 1).

## Princípios

- As coisas **chegam caminhando**: de baixo para cima e da esquerda para a direita. Ações **carimbam** (leve overshoot).
- Animar **só `transform` e `opacity`** (60fps em celular simples). Exceções toleradas: `box-shadow` em hover de card e no anel dos pilares (curtos, poucos elementos).
- Nada de bounce exagerado, parallax pesado, autoplay de carrossel ou animação que atrase leitura/clique.
- Todo conteúdo legível em **até 600ms** depois de entrar na tela (maior caso: 5 × 80ms de stagger + 500ms de entrada ≈ 820ms para o último card — o primeiro já está legível em 500ms; mantenha o máximo de 6 itens escalonados).
- Entradas ao rolar: disparam com **20% visível**, **uma vez** (não reanimam ao subir).
- `prefers-reduced-motion: reduce`: sem deslocamento/escala/loops; só fade de 150ms ou nada.

## Tokens (já estão em `design-system/tokens.json` → grupos `duration`, `easing`, `distance`)

| Token | Valor | Uso |
| --- | --- | --- |
| `dur-instant` | 100ms | troca de cor de ícone, check |
| `dur-fast` | 160ms | hover, press |
| `dur-medium` | 280ms | menus, foco, troca de estado, página |
| `dur-slow` | 500ms | entradas de seção, hero, cards |
| `dur-trail` | 1200ms | desenho de linhas/pegadas |
| `dur-ambient` | 20s | camuflagem viva |
| `stagger` | 80ms | entre itens de um grupo (máx. 6) |
| `ease-enter` | cubic-bezier(0.22, 1, 0.36, 1) | entradas |
| `ease-exit` | cubic-bezier(0.4, 0, 1, 1) | saídas |
| `ease-standard` | cubic-bezier(0.4, 0, 0.2, 1) | mudança no lugar |
| `ease-stamp` | cubic-bezier(0.34, 1.56, 0.64, 1) | carimbo: botões, marcos, pata, selos — nunca texto |
| `move-xs` | 4px | seta, afundar botão, chacoalho |
| `move-sm` | 12px | troca de página, links do menu |
| `move-md` | 24px | entrada padrão |

```ts
// src/motion/tokens.ts — gerar do tokens.json no prebuild
export const dur = { instant: .10, fast: .16, medium: .28, slow: .50, trail: 1.2, ambient: 20, stagger: .08 };
export const ease = {
  enter: [0.22, 1, 0.36, 1], exit: [0.4, 0, 1, 1],
  standard: [0.4, 0, 0.2, 1], stamp: [0.34, 1.56, 0.64, 1],
} as const;
export const move = { xs: 4, sm: 12, md: 24 };
export const reveal = { amount: 0.2, once: true, maxStagger: 6 };
```

## Divisão CSS × Framer Motion

- **CSS (styled-components):** hover/press/foco, Hero (acima da dobra — não esperar hidratação), Header (classes via hook), menu mobile, loops (camuflagem, pulso), chacoalho do form.
- **Framer Motion:** `Reveal` (entradas ao rolar + stagger), Trail (`pathLength`), filtro da Oficina (`LayoutGroup`, `layout`, `AnimatePresence mode="popLayout"`, `layoutId`), sublinhado do menu (`layoutId="nav-underline"`), transição de página (`app/template.tsx`).
- Use `LazyMotion` + `domAnimation`; `MotionConfig reducedMotion="user"` no layout raiz.

## As 12 animações de assinatura

| # | Animação | Gatilho | Duração | Curva | Atraso | Antes → depois |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Hero | carregar (CSS) | dur-slow, stagger 80ms | ease-enter · pata ease-stamp | textos 0/80/160/240/320ms · foto 120ms · moldura 220ms · pata 480ms | opacidade 0, y +24 → 0 · foto 0.96 → 1 · moldura translate 0 → (12px,12px) · pata scale 0.6 → 1, −2° → 18° |
| 2 | Trilha (Trail) | 35% visível, once | linha dur-trail · marco dur-slow | linha ease-standard · marco ease-stamp | marco i: i × 1200/(n−1) ms · texto +120ms | linha 0 → 100% (vertical no mobile) · marco 0.8 → 1 |
| 3 | Botão carimbo | hover / :active / soltar | dur-fast (press 60ms) | transform ease-stamp · cor/sombra ease-standard | — | hover y −1 · press y +4 sem sombra · solta com overshoot |
| 4 | Cards | entrada 20% + hover/foco | entrada dur-slow · hover dur-medium · seta dur-fast | ease-enter | i × 80ms | y −4, shadow-sm → md, foto 1 → 1.04, seta +4px |
| 5 | Camuflagem viva | seção visível (pausa fora) | dur-ambient 20s, alternate | ease-standard | — | padrão (0,0) → (−20px, 12px) · CTABanner e Hero floresta |
| 6 | Pilares | 20% visível, once | selo dur-slow · anel 900ms | selo ease-stamp · anel ease-exit | index × 160ms · anel +200ms | selo 0.7 → 1 · anel 0 → 22px e some |
| 7 | WhatsApp flutuante | 1,5s ou 30% de rolagem | dur-slow · pulso 1,2s a cada 20s | ease-enter · pulso ease-exit | 1500ms | y +24 → 0 · anel 0 → 18px · some com QuoteForm 25% visível · sem pulso no mobile durante rolagem |
| 8 | Header | rolagem | dur-medium | ease-standard | rAF, limiar 6px | >8px: 76 → 64px, logo 52 → 44px, shadow-md · descendo >240px: y −100% · subindo: volta · hover: sublinhado tracejado desliza |
| 9 | Menu mobile | toque | abrir dur-medium · fechar dur-fast | ease-enter / ease-exit | link i × 50ms | hambúrguer → X · links y −12 → 0 |
| 10 | Formulário | foco / erro / envio | foco 280ms · chacoalho 300ms · envio 700ms + check 280ms | ease-enter · ease-standard · check ease-stamp | — | 3 oscilações de ±4px · msg y −6 → 0 · pegadas → check → wa.me |
| 11 | Troca de página | rota (template.tsx) | dur-medium | ease-enter | — | conteúdo y +12 → 0 + fade · header/rodapé fixos |
| 12 | Filtro da Oficina | chip | dur-medium | entrada ease-enter · saída ease-exit | popLayout | cards fade + 0.94 ↔ 1 sem pulo de layout · chip ativo desliza (layoutId) |

## Especificação por componente

### Button (CSS)
| Estado | Muda | Duração | Curva | Reduzido |
| --- | --- | --- | --- | --- |
| Hover | y −1px, fundo `--_bg-h` | dur-fast | ease-stamp / ease-standard | só cor |
| :active | y +move-xs, sombra some | 60ms | ease-standard | só cor |
| Soltar | volta com overshoot | dur-fast | ease-stamp | sem overshoot |
| Foco | outline 3px `focus`, offset 3px | — | — | igual |
| Carregando | ícone → 3 pegadas (`.tda-steps`), “Abrindo o WhatsApp…” | 900ms loop | ease-standard | texto estático |

### Cards — ServiceCard / RestaurantCard / TeamCard
| Estado | Muda | Duração | Curva | Reduzido |
| --- | --- | --- | --- | --- |
| Entrada | opacidade, y move-md → 0, stagger | dur-slow | ease-enter | fade 150ms |
| Hover/foco (com link) | y −4px, shadow-md, foto 1.04, seta +4px | dur-medium (seta dur-fast) | ease-enter | só sombra |
| Pressionado | y −1px, borda brand | dur-fast | ease-standard | só borda |

### Header
| Estado | Muda | Duração | Curva | Reduzido |
| --- | --- | --- | --- | --- |
| Rolou > 8px (`data-scrolled`) | min-height 76 → 64, logo 52 → 44, shadow-md | dur-medium | ease-standard | só sombra |
| Descendo > 240px (`data-hidden`) | y −100% | dur-medium | ease-exit | não esconde |
| Subindo | y 0 | dur-medium | ease-enter | — |
| Hover nos links | sublinhado tracejado desliza (`layoutId="nav-underline"`) | dur-medium | ease-enter | troca sem deslizar |
| Ativo ao carregar | traço scaleX 0 → 1 | dur-slow | ease-enter | já desenhado |

Hook sugerido: `useScrollDirection()` → `{ scrolled: y > 8, hidden: y > 240 && descendo }`, com rAF e limiar de 6px.

### Trail
| Estado | Muda | Duração | Curva | Reduzido |
| --- | --- | --- | --- | --- |
| 35% visível | `motion.path` pathLength 0 → 1 (ou clip-path) | dur-trail | ease-standard | já desenhada |
| Marco i | scale 0.8 → 1 + fade | dur-slow | ease-stamp, delay i × 1.2/(n−1) s | no lugar |
| Texto i | y 12 → 0 + fade | dur-slow | ease-enter, delay marco + 120ms | fade |

### QuoteForm
| Estado | Muda | Duração | Curva | Reduzido |
| --- | --- | --- | --- | --- |
| Foco | anel `brand-soft` + `focus` | dur-medium | ease-enter | sem transição |
| Erro | campo chacoalha 3× ±4px; msg desce y −6 → 0; alerta “Revise N campos” no topo | 300ms / dur-medium | ease-standard / ease-enter | sem chacoalho |
| Envio | pegadas + “Abrindo o WhatsApp…” (700ms) → check stamp → abre wa.me | 700ms + dur-medium | ease-stamp | redireciona na hora |

Props novos pedidos pelo design: `defaultType` (tipo pré-selecionado) e `nameLabel` (“Seu nome e empresa”).

### WhatsAppFloat
| Estado | Muda | Duração | Curva | Reduzido |
| --- | --- | --- | --- | --- |
| Aparecer (1,5s ou 30%) | y +24 → 0 + fade | dur-slow | ease-enter | fade 150ms |
| Pulso (20s sem interação) | anel 0 → 18px e some | ~1,2s | ease-exit | sem pulso |
| Rolando no mobile | pulso pausado | — | — | — |
| QuoteForm ≥ 25% visível | some (y +24, fade), `tabIndex=-1` | dur-medium | ease-exit | some sem mover |

### CTABanner (e Hero floresta)
| Estado | Muda | Duração | Curva | Reduzido |
| --- | --- | --- | --- | --- |
| Entrada | fade + scale 0.96 → 1 (`Reveal effect="scale"`) | dur-slow | ease-enter | fade 150ms |
| Camuflagem viva | padrão translate (0,0) → (−20px, 12px), alternate; pausa fora da tela (`useInView`) | 20s | ease-standard | parada |

### Reveal / SectionHeader
- `Reveal` (`effect: up | fade | scale`, `stagger`, `delay`, `threshold=0.2`, `once`).
- SectionHeader dentro de Reveal: traço do overline desenha (scaleX, +120ms), depois título (+80ms) e descrição (+160ms).
- Imagens soltas: fade + scale 0.98 → 1. Nunca animar texto longo palavra por palavra.

## SSR sem “pisca”

Acima da dobra (Hero) anime com `@keyframes` + `animation-fill-mode: both` — nada de `whileInView` ali. Abaixo da dobra, `initial="hidden"` só no cliente; respeite `useReducedMotion()` passando `initial={false}`.
