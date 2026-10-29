# Brief de design — painel admin de conteúdo

Brief para desenhar no Claude Design as telas do painel admin de um site institucional com agenda de eventos (cursos, turmas, workshops). O admin é onde a equipe cadastra e edita tudo o que aparece no site: eventos, pessoas, galeria, textos das páginas, depoimentos e contatos.

A regra de funcionamento por trás das telas está em `admin-de-conteudo.md`. Este documento trata só do que precisa ser desenhado.

---

## 1. Identidade e tom

- **Use o design system do site**, quando houver um: cores, tipografia, espaçamento, cantos e sombras. O admin é a mesma marca, numa versão mais densa e funcional.
- **O conteúdo fica sobre um fundo levemente rebaixado** em relação ao site (ex.: `surface-sunken`), e tabelas e formulários ficam em blocos elevados (`surface-raised`) com sombra suave.
- **Barra lateral na cor dominante da marca** (escura), com o logo no topo.
- **Tom:** calmo, claro e sem jargão técnico. Quem usa não é técnico: é a dona do negócio e a equipe dela, em português.
- **Funciona em tema claro e escuro.**

## 2. Estrutura geral (moldura)

- **Barra lateral fixa** (cerca de 248 px) com o logo e o menu:
  - Painel
  - Agenda (eventos)
  - Inscrições
  - Configurações
- **No rodapé da barra:** nome do usuário, papel ("Administração" ou "Equipe") e "Sair".
- **Área principal:**
  - no topo, o título da página (fonte de títulos da marca, caixa alta) e, à direita, as ações principais da tela (ex.: "Nova data", "Novo professor");
  - embaixo, o conteúdo.
- **Abaixo de 1024 px:** a barra lateral vira uma barra horizontal no topo, com rolagem lateral.
- **No celular (390 px):** as tabelas viram cartões, um por linha, sem rolagem lateral.

## 3. Telas a desenhar

### 3.1 Login
- Duas metades:
  - à esquerda, um painel escuro com o logo vertical e uma frase curta sobre o painel;
  - à direita, o formulário: e-mail, senha, "Manter conectado(a)", "Esqueci minha senha" e o botão "Entrar".
- Sem cadastro público.
- **Estado de erro:** aviso no topo ("E-mail ou senha incorretos"), sem dizer qual dos dois está errado, e a menção ao bloqueio temporário.
- Celular: as metades ficam uma embaixo da outra.

### 3.2 Painel (início)
- **4 indicadores em blocos:** próximos eventos, inscritos, vagas livres e itens a conferir. Cada um com número grande, rótulo e nota.
- **Duas listas:** "Próximos eventos" (tabela curta) e "Inscrições recentes".
- **Um aviso discreto** quando houver algo pendente: traduções não revisadas, e-mails que falharam, envios barrados pelo anti-spam.

### 3.3 Agenda — lista de eventos
- **Abas com contagem:** Próximas, Rascunhos, Realizadas, Todas.
- **Tabela:** evento, data, local, inscritos ("9 / 12") e status (selo com ícone e palavra).
- **Ações por linha:** ver inscrições, editar e excluir.
- **Nota discreta:** os status "Últimas vagas" e "Esgotado" são automáticos.
- **Estado vazio:** símbolo da marca e uma frase sobre o que fazer.

### 3.4 Agenda — criar ou editar evento
- **Duas colunas:**
  - à esquerda, o formulário em blocos;
  - à direita, uma **pré-visualização ao vivo** fixa ao rolar, com o cartão do evento e o resumo exatamente como aparecem no site.
- **Blocos do formulário:**
  1. **Evento:** título, modalidade, publicação (Rascunho / Em breve / Publicado), resumo de 1 frase e descrição.
  2. **Data, local e vagas:** início, fim, horário, cidade, local, vagas, preço e parcelamento. Aviso de que o status de vagas é automático.
  3. **Foto:** miniatura atual e o botão "Trocar foto".
  4. **Pessoas deste evento:** caixas de seleção com a ordem.
  5. **Programação:** por dia. Cada item tem horário, atividade e descrição, com "Adicionar atividade" e "Adicionar dia".
  6. **Perguntas frequentes:** pergunta e resposta, reordenáveis.
- **Rodapé do formulário:** Cancelar, Salvar rascunho e "Salvar e publicar".
- **Se o site tiver vários idiomas:** abas de idioma acima dos campos de texto (PT · EN · ES…), com o selo "tradução automática, não revisada" em cada aba traduzida.

### 3.5 Diálogo — excluir evento
- Título "Excluir esta data?", o evento em destaque (nome, data e local) e o texto de que a página sai do site.
- **Se houver inscritos:** aviso em amarelo sugerindo "Mudar para rascunho".
- **Botões:** Cancelar, "Mudar para rascunho" e "Excluir" (na cor de perigo).

### 3.6 Diálogo — trocar foto
- **Passo 1:**
  - área de arrastar e soltar ("Arraste uma foto ou clique para escolher");
  - **ou** escolher da biblioteca da marca (grade de miniaturas, com a selecionada marcada).
- **Passo 2:** recorte com moldura fixa (16:10 para eventos, 4:5 para pessoas), arraste e zoom. Aviso que não bloqueia quando a foto é pequena.
- **Campo obrigatório:** "Descrição da foto", com a explicação curta de que é o texto lido por quem usa leitor de tela.
- **Aviso fixo das regras de imagem** do domínio, quando houver.
- **Botões:** Cancelar e "Usar esta foto".

### 3.7 Configurações (com abas)
Abas: **Pessoas · Galeria · Textos do site · Depoimentos · Contato do site · Usuários**. Só a Administração vê esta área.

**a) Pessoas**
- Lista: foto pequena, nome com a especialidade embaixo, registro, em quantos eventos aparece e um selo "Visível" ou "Oculto".
- Ações por linha: editar e excluir. Botão "Nova pessoa".
- **Formulário ao lado da lista:** foto em retrato com "Trocar foto", nome, especialidade, registro profissional (com a dica da regra do domínio), mini bio e "Mostrar no site". Salvar e Cancelar.
- Reordenar com subir e descer.

**b) Galeria**
- Aviso das regras de imagem no topo.
- Área de envio de várias fotos de uma vez.
- Grade de cartões, cada um com a foto, a posição ("Foto 1 · destaque"), o campo de descrição e os botões Subir, Descer e Remover.

**c) Textos do site**
- Blocos por página e seção, cada um com os campos e o limite de caracteres visível:
  - **Topo da home:** sobretítulo, título, frase e foto.
  - **Sobre:** dois parágrafos.
  - **Pilares:** lista de 3 a 5 itens (título e frase), reordenável, com "Adicionar pilar".
  - **Números:** 4 itens (valor e rótulo).
  - **Valores:** título e frase.
- Pré-visualização simples de cada bloco ao lado.

**d) Depoimentos**
- Lista e formulário com nome, profissão, cidade, texto, visível e **"Autorização por escrito recebida em"** (data obrigatória).
- Sem a data, um selo "Não aparece no site: falta autorização".

**e) Contato do site**
- Telefone, WhatsApp, e-mail, Instagram, endereço e horário.
- Botão "Enviar e-mail de teste".

**f) Usuários**
- Lista com nome, e-mail, papel (Administração ou Equipe) e ativo/inativo.
- Criar usuário, mudar o papel, desativar e redefinir a senha (a senha temporária aparece uma única vez, num aviso destacado).
- Indicação de que sempre existe pelo menos uma conta de Administração ativa.

### 3.8 Traduções (só se o site tiver vários idiomas)
- Tabela por idioma: revisadas, automáticas, desatualizadas e faltando.
- Botão "Gerar traduções que faltam", com barra de progresso.

## 4. Estados que precisam aparecer

- **Carregando:** blocos de espera (skeleton) nas cores da marca, nunca spinner.
- **Vazio:** cada lista tem um estado vazio com o símbolo da marca e uma frase de próximo passo.
- **Salvo:** confirmação discreta (alerta de sucesso no topo ou um toast), sem pular de página.
- **Erro de validação:** aviso no topo ("Revise 2 campos") e a mensagem em cada campo, dizendo o que fazer.
- **Ação perigosa:** sempre um diálogo de confirmação.
- **Sistema desatualizado:** um bloco "O banco precisa ser atualizado" no lugar da tela, em vez de página de erro.

## 5. Regras de interface

- **Formulários:** rótulo **acima** do campo. Mesma altura de campo, e linhas com dois campos alinhadas pelo topo.
- **Botões:** começam com verbo. Uma ação principal por tela, as de apoio contornadas e as discretas como texto.
- **Status:** sempre selo com **ícone e palavra**, nunca só cor.
- **Acessibilidade:**
  - alvos de toque de pelo menos 44 px;
  - contraste de 4,5:1 no texto;
  - foco visível;
  - tudo utilizável pelo teclado;
  - diálogos que fecham com Esc.
- **Movimento:** calmo e curto, só para dar retorno (abrir diálogo, salvar). Nada que quique ou pisque.
- **Dados de exemplo:** placeholders explícitos ("Nome da pessoa", "Registro 00000", "R$ 0.000"), nunca dados inventados que pareçam reais.

## 6. Entrega esperada

- **Desktop (1440 px):** todas as telas da seção 3.
- **Celular (390 px):** pelo menos Login, Agenda (lista em cartões), Editar evento e Configurações › Pessoas.
- **Estados da seção 4** mostrados ao menos uma vez cada.
- **Tema escuro:** ao menos o Painel e a Agenda.
- **Telas organizadas no canvas por fluxo:** Acesso, Agenda, Configurações, Estados.
