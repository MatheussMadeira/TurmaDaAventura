# Páginas do site

Arquitetura de informação baseada nos padrões de sites de recreação infantil (prova de segurança, catálogo de atividades, "como funciona", contato em um toque) e nos pedidos da Turma. Cada página fecha com `CTABanner` e tem `WhatsAppFloat`.

## Menu

`Início` · `Oficina` · `Restaurantes` · `Eventos corporativos` · `Quem somos` · botão **Orçamento** (WhatsApp)

| Rota | Página | Objetivo | Mensagem do WhatsApp |
| --- | --- | --- | --- |
| `/` | Início | Apresentar as três frentes e levar ao orçamento | "Olá! Vim pelo site e quero um orçamento." |
| `/oficina` | Oficina | Mostrar o que a Turma faz: atividades, oficinas e gincanas | "Olá! Quero saber mais sobre a Oficina." |
| `/restaurantes` | Restaurantes | Onde encontrar a Turma (pais) + captar novos restaurantes (donos) | "Olá! Tenho um restaurante e quero recreação para as famílias." |
| `/eventos-corporativos` | Eventos corporativos | Vender espaço kids para empresas | "Olá! Quero recreação infantil para um evento corporativo." |
| `/quem-somos` | Quem somos | Confiança: história, valores, equipe e segurança | "Olá! Quero conversar com a Turma da Aventura." |

## Início

1. `Header` (current `/`)
2. `Hero` light — "Bora pra aventura?" + destaques (monitores treinados, atividades por faixa etária, montamos tudo no local)
3. Três frentes — `SectionHeader` + 3 × `ServiceCard` (Restaurantes, Eventos corporativos, Oficina) com `href`
4. Nosso jeito — 3 × `ValuePillar` (Brincar / Aprender / Ensinar)
5. Como funciona — `Trail` com 3 etapas
6. Onde estamos — faixa com 3 `RestaurantCard` + link "Ver todos os restaurantes"
7. Galeria curta (6 fotos em `Media`) — opcional quando houver fotos
8. `CTABanner` · `Footer` · `WhatsAppFloat`

## Oficina

1. `Hero` light com foto de oficina
2. Catálogo — filtro por tipo (Brincadeiras, Oficinas manuais, Gincanas, Natureza) com `ServiceCard` + `Tag` de faixa etária e duração
3. Como montamos uma oficina — `Trail`
4. Segurança e materiais — lista com ícones `shield`/`leaf`
5. `QuoteForm` (tipo pré-selecionado "Oficina") · `CTABanner`

## Restaurantes

1. `SectionHeader level={1}` "Onde a Turma está"
2. Lista/grade de `RestaurantCard` agrupada por região (dados de `content/restaurantes.json`)
3. Bloco "Tem um restaurante?" — benefícios para o dono (famílias ficam mais tempo, pais comem tranquilos) + `WhatsAppButton` com mensagem de dono de restaurante
4. `CTABanner`

## Eventos corporativos

1. `Hero` **forest** (tom mais sóbrio) — "Espaço kids para o seu evento"
2. Formatos — `ServiceCard`: Confraternização de fim de ano, Dia da Família, Convenções e feiras, Férias na empresa
3. Logos de empresas atendidas (quando houver autorização)
4. Como funciona — `Trail` com 4 etapas (briefing, proposta, montagem, operação)
5. `QuoteForm` (tipo "Evento corporativo", rótulo "Seu nome e empresa") · `CTABanner`

## Quem somos

1. `SectionHeader level={1}` + texto da história
2. 3 × `ValuePillar`
3. Equipe — grade de `TeamCard` com apelidos e certificações
4. Segurança — monitores por criança, primeiros socorros, seguro
5. `CTABanner`

## Abas que podem entrar depois

- **Festas e aniversários** — se a Turma quiser vender festas particulares.
- **Galeria** — quando houver acervo de fotos autorizado.
- **Perguntas frequentes** — idade mínima, número de monitores, o que levamos, quanto tempo de montagem.
- **Trabalhe com a gente** — captar monitores (formulário que abre e-mail/WhatsApp).
