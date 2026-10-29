Recreação infantil com cara de expedição: trilha, pegadas, acampamento e camuflagem, num tom caloroso que fala com pais, donos de restaurante e RH de empresas ao mesmo tempo. Todo caminho do site termina numa conversa no WhatsApp — **nenhum preço aparece no site**.

## Princípios

1. **Expedição lúdica, não infantilizada.** Metáforas de aventura (missão, trilha, acampamento, mapa) com acabamento adulto. Nada de arco-íris, balões ou letras saltitantes.
2. **Natureza primeiro.** Verde e marrom em tons de camuflagem; areia como fundo. Cor viva só nas fotos das crianças.
3. **Tudo leva ao WhatsApp.** Cada página tem um CTA primário `WhatsAppButton` com mensagem contextual, e o `WhatsAppFloat` acompanha a rolagem.
4. **Segurança visível.** Pais decidem pela confiança: equipe, certificações e faixas etárias sempre à vista.

## Conteúdo e tom de voz

- Português do Brasil, **você** para o leitor e **a gente / a Turma** para a empresa. Caloroso e direto, frases curtas.
- Vocabulário de aventura com moderação: "Bora pra aventura?", "Missão 01", "Montamos a expedição". Um termo temático por bloco, no máximo.
- Títulos e botões em caixa de frase ("Pedir orçamento no WhatsApp"), nunca TUDO MAIÚSCULO — exceto `overline`.
- Botões começam com verbo: Pedir, Chamar, Conhecer, Ver.
- **Preço nunca.** Em vez de "a partir de R$…": "Cada aventura é montada sob medida — chama a gente no WhatsApp."
- Sem emoji em títulos, botões ou textos de interface. Em legendas de Instagram, à vontade.
- Para empresas (Eventos corporativos) o tom sobe meio degrau: menos gíria, mais resultados ("os pais participam do evento enquanto as crianças ficam com monitores treinados").

| Evite | Prefira |
| --- | --- |
| Clique aqui | Pedir orçamento no WhatsApp |
| Preços e pacotes | Monte seu orçamento |
| Animação de festa | Recreação com monitores treinados |
| Crianças de todas as idades | De 3 a 12 anos (atividades por faixa) |

## Cor

- Fundo de página `surface` (areia); cards em `surface-raised`; seções alternadas em `surface-sunken`; seções de terra em `surface-earth`; rodapé e faixas de CTA em `surface-forest`.
- Texto `ink` / `ink-muted` / `ink-subtle` sobre superfícies claras; `ink-on-forest` / `ink-on-forest-muted` sobre `surface-forest`.
- `brand` (verde oficial do logo, `mata-700` #1F632A) é a ação primária, links e o título do hero. `earth` (couro) é a ação secundária forte. `olive` marca faixas etárias.
- `camo-1…4` e `caqui-*` são **só decorativos** (padrões, ilustrações). Nunca como texto.
- Estados terrosos: erro `danger` (ferrugem), atenção `warning` (ocre), sucesso = `brand` com ícone de check. Estado nunca só por cor: sempre ícone + texto.
- Componentes usam só tokens semânticos; a paleta crua (`mata-*`, `terra-*`…) é para ilustração e para montar novos semânticos.
- Proporção por página: ~70% areia/branco, ~20% verde, ~10% marrom.
- Temas: **Dia** (padrão do site) e **Noite** (modo escuro, `[data-theme="noite"]`). Todos os pares de texto acima passam 4.5:1 nos dois temas; bordas de controle e foco passam 3:1.

## Tipografia

- **Fraunces** (serifa macia, peso 700–800) nos títulos — conversa com o letreiro do logo. Use `display` só no hero, `h1` por página, `h2` por seção, `h3`/`h4` em cards. `tagline` (itálico) para slogans.
- **Nunito** (sans arredondada) em todo texto corrido, rótulos e botões: `lead`, `body`, `body-sm`, `label`, `overline` (CAIXA ALTA, espaçamento 0.14em), `caption`.
- Mobile (< 768px): `display` 40/44, `h1` 34/40, `h2` 28/34.
- Linha de texto com no máximo ~70 caracteres (`max-width: 34em` no lead).

## Espaço, forma e layout

- Escala de 4px: `space-1`…`space-10`. Seção = `space-9` vertical no desktop, `space-8` no mobile. Título de seção → conteúdo = `space-7`.
- Container `container` (1200px) com gutter `space-5` (desktop) / `space-4` (mobile).
- Cantos generosos: `radius-md` botões, `radius-lg` cards e fotos, `radius-xl` faixas e hero, `radius-pill` tags e flutuante.
- Grids de 3 → 2 → 1 colunas em `bp-lg` / `bp-md`. Componentes grandes (Header, Hero, CTABanner, QuoteForm, Footer) respondem à **largura do próprio container** (container queries), não da janela.

## Sombras, bordas e assinaturas visuais

- **Carimbo:** botões têm sombra sólida deslocada 4px (`shadow-stamp-brand` / `shadow-stamp-earth`) que some ao pressionar. Cards de destaque (formulário) usam `shadow-stamp-card`; fotos de hero, `shadow-photo`.
- Cards em repouso: `border-thin` em `line` + `shadow-sm`; hover: sobe 4px + `shadow-md`.
- **Trilha tracejada** (`border-dash` em `earth`) liga etapas e marca o item ativo do menu.
- **Camuflagem** (`CamoPattern`) em placeholders, faixa de CTA e hero floresta — no máximo um bloco de camuflagem "cheia" por página.
- **Pegadas e pata** do logo como ornamentos pontuais (canto do hero, faixa de CTA), nunca como padrão repetido.

## Movimento

A animação é parte central da experiência: as coisas **chegam caminhando** (de baixo para cima, escalonadas) e as ações **carimbam** (leve overshoot). Detalhes em **Animação e microinterações**.

- Use só os tokens de movimento: `dur-fast` (hover/press), `dur-medium` (menus, foco), `dur-slow` (entradas), `dur-trail` (linhas), `stagger` (80ms entre itens); curvas `ease-enter`, `ease-exit`, `ease-standard`, `ease-stamp`; distâncias `move-xs`, `move-sm`, `move-md`.
- Toda seção entra com `Reveal` ao rolar, uma vez só. O Hero tem sequência própria ao carregar.
- Assinaturas: botão carimbo, trilha que se desenha, pata que "pisa" no hero, pilares com anel, camuflagem viva, WhatsApp que surge e pulsa, header que encolhe e se esconde.
- Anime só `transform` e `opacity`. Conteúdo legível em até 600ms. Com `prefers-reduced-motion`, nada se desloca.

## Foco e acessibilidade

- Anel de foco: `outline: 3px solid var(--focus)` com `outline-offset: 2–3px`; dentro de `surface-forest` use `focus-on-forest`.
- Alvos de toque ≥ `tap-min` (44px). Imagens com `alt` descritivo; pegadas e pata decorativas com `alt=""`.
- Um `h1` por página; navegação com `aria-current="page"`.

## Imagens

- Fotos reais de crianças em atividade (de costas, de perfil ou em grupo; com autorização dos responsáveis), luz natural, tons quentes, ao ar livre quando possível.
- Recorte 4:3 em cards, 5:4 no hero, 16:10 em catálogos. Sem banco de imagens genérico de "criança sorrindo para a câmera".
- Enquanto não houver foto, `Media` mostra o placeholder de camuflagem com um ícone.

## Iconografia

- Set próprio de traço arredondado 2px em grade 24px (`Icon`), herdando `currentColor`. Lista em `Icon`.
- Para ampliar, desenhe no mesmo padrão ou use **Phosphor Icons — Bold** (mais próximo). O ícone de WhatsApp é uma versão simplificada do símbolo, para os CTAs.
- Sem emoji como ícone.

## Logo

Use os arquivos do grupo **Logos** (vetorizados a partir do original): `logo-sem-tagline` no header, `turma-da-aventura-logo` (com slogan) no rodapé e em materiais, `simbolo-pegadas` para favicon/avatar. Regras e pendências no README do grupo.

## Componentes (Atomic Design)

- **Átomos:** Icon, Reveal, Button, Tag, Logo, Media, CamoPattern, TextField, Select
- **Moléculas:** SectionHeader, WhatsAppButton, ServiceCard, RestaurantCard, TeamCard, ValuePillar
- **Organismos:** Header, Hero, Trail, CTABanner, QuoteForm, Footer, WhatsAppFloat
- **Templates:** HomeTemplate (composição de referência da Home)

Os componentes aqui são a referência visual e de API (`components/index.d.ts`). A implementação de produção (Next.js + styled-components) está na seção **Implementação**; o mapa de páginas, em **Páginas do site**; as regras de movimento, em **Animação e microinterações**.
