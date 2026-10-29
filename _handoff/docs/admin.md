# Painel /admin — especificação

Base: `brief/admin-brief-design.md` (adaptado: este site não tem agenda/inscrições/traduções). Telas no canvas, página “Admin (/admin)”. Mesma marca do site, versão mais densa: fundo `surface-sunken`, blocos `surface-raised`, barra lateral `surface-forest` (248px), títulos em caixa de frase (o design system não permite caixa alta fora do overline).

## Telas

| Rota | Canvas | Observações |
| --- | --- | --- |
| `/admin/login` | `AdminLogin.dc.html`, `AdminLoginErro.dc.html`, `AdminLoginMobile.dc.html` | Duas metades (marca com camuflagem / formulário). Sem cadastro público. Erro genérico “E-mail ou senha incorretos” + aviso de bloqueio (5 tentativas → 15 min). “Manter conectado(a)”, “Esqueci minha senha”. |
| `/admin` | `AdminPainel.dc.html`, `AdminPainelNoite.dc.html` | 4 indicadores, aviso de pendências (fotos sem descrição, restaurante sem horário), “Últimas alterações” (tabela) e atalhos. |
| `/admin/editor?pagina=<slug>` | `AdminEditor.dc.html` (texto selecionado), `AdminEditorFoto.dc.html` (trocar foto), `AdminEditorPublicado.dc.html` (publicado), `AdminEditorMobile.dc.html` | **Editor visual estilo WordPress** — ver abaixo. |
| `/admin/restaurantes` | `AdminRestaurantes.dc.html`, `…Noite`, `…Mobile` (tabela vira cartões < 768px) | Abas com contagem (Ativos, Rascunhos, Pausados, Todos), ações ver/editar/excluir, status sempre ícone + palavra. |
| `/admin/restaurantes/[id]` | `AdminRestauranteEditar.dc.html` | Formulário em blocos (Restaurante, Recreação, Fotos) + **prévia ao vivo** do `RestaurantCard` real, fixa ao rolar. Cancelar · Salvar rascunho · Salvar e publicar. |
| `/admin/atividades`, `/admin/equipe` | (mesmo padrão de Restaurantes) | Lista + formulário com prévia do `ServiceCard` / `TeamCard`. Reordenar (subir/descer ou arrastar). |
| `/admin/fotos` | `AdminMidia.dc.html` | Regras de imagem no topo, envio múltiplo, filtros (Todas, Sem descrição, Usadas, Não usadas), descrição obrigatória por foto, onde é usada, substituir/remover. |
| `/admin/usuarios` | `AdminUsuarios.dc.html`, `AdminUsuariosMobile.dc.html` | Só Administração. Criar, mudar papel, desativar, redefinir senha. Senha temporária aparece **uma única vez**. Sempre ≥ 1 Administração ativa (a própria conta não pode ser desativada). |
| `/admin/contato` | `AdminContato.dc.html` | Só Administração. WhatsApp, Instagram, e-mail, cidade, horário + **mensagem pronta por página** + “Abrir conversa de teste”. |
| Estados | `AdminEstados.dc.html`, `AdminExcluir.dc.html` | Carregando (skeleton, nunca spinner), vazio (símbolo das pegadas + próximo passo), erro de validação (“Revise N campos” + mensagem por campo), salvo (alerta/toast discreto), “O banco precisa ser atualizado” (no lugar da tela), sem permissão, diálogo de excluir com alternativa “Pausar”. |

Componente compartilhado: `AdminSidebar.dc.html` (grupos Site / Conteúdo / Administração; usuário no rodapé com papel e “Sair”). Abaixo de 1024px vira barra horizontal com rolagem lateral.

Papéis: **Administração** (tudo) e **Equipe** (editar site, fotos, restaurantes, atividades, equipe; sem Usuários e Contato).

## Editor visual (o coração do admin)

Comportamento desenhado:

- Barra superior verde-floresta: voltar, logo, seletor de página (“Editando a página Início”), alternância computador/celular, desfazer/refazer, status (“2 alterações não publicadas” / “Tudo publicado”), “Ver no site”, **“Publicar alterações”**.
- Esquerda: **seções da página** (arrastar para reordenar, olho para esconder sem apagar). Header e rodapé são globais (editados em Contato e WhatsApp).
- Centro: **a página real** em escala, com áreas editáveis. Hover = contorno tracejado `earth` + etiqueta; selecionado = tracejado `brand` + etiqueta com contador (“Título · 18/40”) + mini barra de ferramentas. Texto edita no lugar (cursor); foto mostra “Trocar foto”.
- Direita: campos do bloco selecionado, com rótulo acima, contador e dica. Tudo que muda aparece na prévia na hora.
- Publicar: toast “Alterações publicadas. Já estão no site.” + link.
- Trocar foto (diálogo): 1) arrastar/enviar ou escolher da biblioteca; 2) recorte com proporção fixa do slot (hero 5:4, cards 4:3, catálogo 16:10, equipe 1:1) + zoom; aviso não bloqueante se a foto for pequena; **descrição obrigatória**; aviso fixo de autorização dos responsáveis.
- Mobile: prévia em tamanho real; tocar num texto abre uma folha inferior com o campo, Desfazer e Aplicar.

Arquitetura recomendada:

- **Mesmos componentes do site** renderizados em modo edição. A prévia é um `<iframe>` de `/admin/preview/[slug]` usando `draftMode()` do Next — assim a alternância computador/celular é só a largura do iframe (390px) e as container queries funcionam de verdade.
- Comunicação editor ⇄ iframe por `postMessage` (selecionar bloco, atualizar valor, rolar até a seção).
- Cada seção tem um **schema** (zod) que define campos, limites de caracteres e proporção de imagem; o painel da direita é gerado a partir dele.
- Wrappers no site: `<EditableText path="hero.title" />`, `<EditableImage path="hero.image" ratio="5/4" />` — em produção renderizam só o conteúdo; em draft/edição adicionam os contornos e o `contentEditable` (texto puro).
- Rascunho salvo automaticamente (debounce ~1s). **Publicar** copia rascunho → publicado numa transação e chama `revalidatePath` das rotas afetadas. O site público lê só o publicado.
- Desfazer/refazer no cliente (pilha de patches por sessão).

## Modelo de dados (sugestão — Prisma/Postgres)

- `User` (nome, e-mail único, hash argon2/bcrypt, papel ADMIN|EQUIPE, ativo, mustChangePassword, lastLoginAt, failedAttempts, lockedUntil)
- `Page` (slug) · `Section` (pageId, type, order, visible, draft Json, published Json, updatedBy, updatedAt)
- `Region` · `Restaurant` (campos do `RestaurantCard` + regionId, order, status RASCUNHO|PUBLICADO|PAUSADO, destaqueHome, imageId)
- `Activity` (categoria, título, descrição, tags[], imageId, order, status)
- `TeamMember` (apelido, nome, função, bio, badges[], photoId, visível, order)
- `Media` (url, largura, altura, alt **obrigatório**, autorizacaoConfirmada, createdBy) + uso calculado
- `SiteSettings` (whatsapp, instagram, email, cidade, horário, mensagens por página)
- `AuditLog` (o que mudou, onde, quem, quando, publicado?) → alimenta “Últimas alterações”

Nenhum campo de preço em nenhum modelo.

## Segurança

- `/admin/**` protegido por middleware; papéis checados no servidor (Server Actions / route handlers), não só na UI.
- Login: rate limit + bloqueio de 15 min após 5 falhas; mensagem nunca diz qual campo errou.
- Senha temporária gerada no servidor, exibida uma vez, troca obrigatória no primeiro acesso.
- Uploads: validar tipo/tamanho, remover EXIF/GPS, gerar tamanhos (sharp), servir AVIF/WebP.
- Invariante: nunca permitir que a última Administração ativa seja desativada ou rebaixada.
