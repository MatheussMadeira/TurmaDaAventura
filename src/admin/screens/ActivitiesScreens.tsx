'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Select } from '@/components/atoms/Select';
import { Tag, TagList } from '@/components/atoms/Tag';
import { TextField } from '@/components/atoms/TextField';
import { ServiceCard } from '@/components/molecules/ServiceCard';
import {
  deleteActivityAction,
  moveActivityAction,
  saveActivityAction,
  setActivityStatusAction,
} from '@/app/admin/_actions/content';
import { ICON_NAMES, type IconName } from '@/lib/iconNames';
import type { SaveMode } from '@/server/admin/restaurants';
import {
  DangerButton,
  IconButton,
  IconLink,
  StatusBadge,
  Switch,
  Tabs,
  type TabItem,
} from '../ui/controls';
import { CardMeta, CardRow, CellMain, DataList, RowActions } from '../ui/DataList';
import { Dialog } from '../ui/Dialog';
import { ErrorSummary, fieldError, useAction } from '../ui/forms';
import {
  Box,
  BoxSub,
  BoxTitle,
  Cols,
  Count,
  Fields,
  PageTop,
  Row,
  Stack,
  Sticky,
} from '../ui/layout';
import { MediaPicker, type PickerPhoto } from '../ui/MediaPicker';
import { EmptyState } from '../ui/states';

type Status = 'RASCUNHO' | 'PUBLICADO' | 'PAUSADO';

export interface ActivityListRow {
  id: string;
  title: string;
  category: string;
  icon: string;
  tags: string[];
  status: Status;
}

/* ===================== Lista ===================== */
export function ActivitiesList({
  rows,
  tabs,
  total,
}: {
  rows: ActivityListRow[];
  tabs: TabItem[];
  total: number;
}) {
  const router = useRouter();
  const { run, pending } = useAction();
  const [toDelete, setToDelete] = useState<ActivityListRow | null>(null);

  const act = async (fn: () => ReturnType<typeof moveActivityAction>) => {
    const r = await run(fn);
    if (r.ok) router.refresh();
    return r;
  };
  const idx = (r: ActivityListRow) => rows.findIndex((x) => x.id === r.id);

  const actions = (r: ActivityListRow) => (
    <RowActions>
      <IconButton
        icon="arrow-up"
        label={`Subir ${r.title}`}
        disabled={pending || idx(r) === 0}
        onClick={() => act(() => moveActivityAction(r.id, 'up'))}
      />
      <IconButton
        icon="arrow-down"
        label={`Descer ${r.title}`}
        disabled={pending || idx(r) === rows.length - 1}
        onClick={() => act(() => moveActivityAction(r.id, 'down'))}
      />
      {r.status === 'PUBLICADO' ? (
        <IconButton
          icon="pause"
          label={`Pausar ${r.title}`}
          disabled={pending}
          onClick={() => act(() => setActivityStatusAction(r.id, 'PAUSADO'))}
        />
      ) : (
        <IconButton
          icon="eye"
          label={`Publicar ${r.title}`}
          disabled={pending}
          onClick={() => act(() => setActivityStatusAction(r.id, 'PUBLICADO'))}
        />
      )}
      <IconLink icon="edit" label={`Editar ${r.title}`} href={`/admin/atividades/${r.id}`} />
      <IconButton
        icon="trash"
        tone="danger"
        label={`Excluir ${r.title}`}
        onClick={() => setToDelete(r)}
      />
    </RowActions>
  );

  return (
    <Stack>
      <PageTop
        crumb="Conteúdo"
        title="Atividades"
        actions={
          <Button href="/admin/atividades/novo" iconLeft="plus">
            Nova atividade
          </Button>
        }
      />
      {total === 0 ? (
        <Box>
          <EmptyState
            title="Nenhuma atividade por aqui ainda"
            action={
              <Button href="/admin/atividades/novo" iconLeft="plus">
                Nova atividade
              </Button>
            }
          >
            Cadastre a primeira e ela aparece no catálogo da Oficina.
          </EmptyState>
        </Box>
      ) : (
        <Box $flush>
          <TabsWrap>
            <Tabs items={tabs} label="Situação das atividades" />
          </TabsWrap>
          {rows.length ? (
            <DataList
              caption="Atividades"
              rows={rows}
              rowKey={(r) => r.id}
              columns={[
                {
                  key: 'title',
                  header: 'Atividade',
                  render: (r) => (
                    <CellMain>
                      <IconBadge aria-hidden>
                        <Icon
                          name={
                            (ICON_NAMES as readonly string[]).includes(r.icon)
                              ? (r.icon as IconName)
                              : 'compass'
                          }
                          size={22}
                        />
                      </IconBadge>
                      <div>
                        <strong>{r.title}</strong>
                        <span>{r.category}</span>
                      </div>
                    </CellMain>
                  ),
                },
                {
                  key: 'tags',
                  header: 'Etiquetas',
                  render: (r) => (
                    <TagList>
                      {r.tags.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </TagList>
                  ),
                },
                {
                  key: 'status',
                  header: 'Situação',
                  render: (r) => <StatusBadge status={r.status} />,
                },
                {
                  key: 'actions',
                  header: 'Ações',
                  srOnlyHeader: true,
                  align: 'right',
                  render: actions,
                },
              ]}
              card={(r) => (
                <>
                  <CellMain>
                    <IconBadge aria-hidden>
                      <Icon
                        name={
                          (ICON_NAMES as readonly string[]).includes(r.icon)
                            ? (r.icon as IconName)
                            : 'compass'
                        }
                        size={22}
                      />
                    </IconBadge>
                    <div>
                      <strong>{r.title}</strong>
                      <span>{r.category}</span>
                    </div>
                  </CellMain>
                  <CardMeta>
                    <span>{r.tags.join(' · ')}</span>
                  </CardMeta>
                  <CardRow>
                    <StatusBadge status={r.status} />
                    {actions(r)}
                  </CardRow>
                </>
              )}
            />
          ) : (
            <EmptyState title="Nada nesta aba">
              Tente outra aba ou cadastre uma nova atividade.
            </EmptyState>
          )}
          <Footnote>A ordem desta lista é a ordem do catálogo da Oficina.</Footnote>
        </Box>
      )}

      <Dialog
        open={!!toDelete}
        alert
        closeOnBackdrop={false}
        onClose={() => setToDelete(null)}
        title="Excluir esta atividade?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Cancelar
            </Button>
            {toDelete && toDelete.status !== 'PAUSADO' ? (
              <Button
                variant="outline"
                iconLeft="pause"
                disabled={pending}
                onClick={async () => {
                  const r = await act(() => setActivityStatusAction(toDelete.id, 'PAUSADO'));
                  if (r.ok) setToDelete(null);
                }}
              >
                Pausar em vez de excluir
              </Button>
            ) : null}
            <DangerButton
              iconLeft="trash"
              disabled={pending}
              onClick={async () => {
                if (!toDelete) return;
                const r = await act(() => deleteActivityAction(toDelete.id));
                if (r.ok) setToDelete(null);
              }}
            >
              Excluir
            </DangerButton>
          </>
        }
      >
        {toDelete ? (
          <>
            <p style={{ margin: 0 }}>
              <strong>{toDelete.title}</strong> · {toDelete.category}
            </p>
            <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
              O card sai do catálogo da Oficina. As fotos continuam na biblioteca. Se for só uma
              pausa, prefira pausar: ele some do site e volta com um clique.
            </p>
          </>
        ) : null}
      </Dialog>
    </Stack>
  );
}

/* ===================== Formulário ===================== */
export interface ActivityFormValues {
  category: string;
  icon: IconName;
  title: string;
  description: string;
  tags: string;
  imageId: string | null;
  imageAlt: string;
  visible: boolean;
}

export const EMPTY_ACTIVITY: ActivityFormValues = {
  category: '',
  icon: 'compass',
  title: '',
  description: '',
  tags: '',
  imageId: null,
  imageAlt: '',
  visible: true,
};

const splitTags = (s: string) =>
  s
    .split(/[,;\n]/)
    .map((t) => t.trim())
    .filter(Boolean);

export function ActivityForm({
  id,
  initial,
  status,
  categories,
  library,
}: {
  id: string | null;
  initial: ActivityFormValues;
  status?: Status;
  categories: string[];
  library: PickerPhoto[];
}) {
  const router = useRouter();
  const { run, pending, result } = useAction<{ id: string }>();
  const [v, setV] = useState(initial);
  const set = <K extends keyof ActivityFormValues>(k: K, value: ActivityFormValues[K]) =>
    setV((s) => ({ ...s, [k]: value }));
  const photo = library.find((p) => p.id === v.imageId);
  const tags = splitTags(v.tags);

  const save = async (mode: SaveMode) => {
    const r = await run(() => saveActivityAction(id, { ...v, tags }, mode));
    if (r.ok && r.data) {
      if (!id) router.replace(`/admin/atividades/${r.data.id}`);
      else router.refresh();
    }
  };

  return (
    <Stack>
      <PageTop
        crumb={<>Atividades › {id ? 'Editar' : 'Nova'}</>}
        title={v.title.trim() || (id ? 'Atividade' : 'Nova atividade')}
        actions={status ? <StatusBadge status={status} /> : undefined}
      />
      <ErrorSummary result={result} />
      <Cols $form>
        <Stack>
          <Box>
            <BoxTitle>1 · Atividade</BoxTitle>
            <Fields>
              <div className="full">
                <TextField
                  label="Título"
                  required
                  value={v.title}
                  onChange={(e) => set('title', e.target.value)}
                  error={fieldError(result, 'title')}
                />
                <Count value={v.title} max={40} />
              </div>
              <div>
                <TextField
                  label="Categoria"
                  required
                  list="categorias"
                  value={v.category}
                  onChange={(e) => set('category', e.target.value)}
                  hint="Escolha uma existente ou escreva uma nova."
                  error={fieldError(result, 'category')}
                />
                <datalist id="categorias">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <Select
                label="Ícone"
                value={v.icon}
                onChange={(e) => set('icon', e.target.value as IconName)}
                options={ICON_NAMES.map((n) => ({ value: n, label: n }))}
                error={fieldError(result, 'icon')}
              />
              <div className="full">
                <TextField
                  label="Descrição"
                  multiline
                  rows={3}
                  required
                  value={v.description}
                  onChange={(e) => set('description', e.target.value)}
                  error={fieldError(result, 'description')}
                />
                <Count value={v.description} max={160} />
              </div>
              <div className="full">
                <TextField
                  label="Etiquetas"
                  value={v.tags}
                  onChange={(e) => set('tags', e.target.value)}
                  placeholder="6 a 12 anos, 90 min"
                  hint="Separe por vírgula (idade, duração…). No máximo 4."
                  error={fieldError(result, 'tags')}
                />
              </div>
            </Fields>
            <Row>
              <Switch
                label="Mostrar no site"
                checked={v.visible}
                onChange={(x) => set('visible', x)}
              />
            </Row>
          </Box>

          <Box>
            <BoxTitle>2 · Foto</BoxTitle>
            <MediaPicker
              label="Foto da atividade (16:10)"
              library={library}
              value={v.imageId}
              onChange={(x) => set('imageId', x)}
              ratio="16 / 10"
            />
            {!v.imageId ? (
              <TextField
                label="Descrição do placeholder"
                value={v.imageAlt}
                onChange={(e) => set('imageAlt', e.target.value)}
                error={fieldError(result, 'imageAlt')}
              />
            ) : null}
          </Box>

          <Buttons>
            <Button variant="ghost" href="/admin/atividades">
              Cancelar
            </Button>
            <Button variant="outline" disabled={pending} onClick={() => save('draft')}>
              Salvar rascunho
            </Button>
            <Button disabled={pending} onClick={() => save('publish')}>
              {pending ? 'Salvando…' : 'Salvar e publicar'}
            </Button>
          </Buttons>
        </Stack>

        <Sticky>
          <Box>
            <BoxTitle>Prévia no site</BoxTitle>
            <BoxSub>
              Como o card aparece no catálogo da Oficina. Atualiza enquanto você digita.
            </BoxSub>
            <ServiceCard
              image={photo?.url ?? null}
              imageAlt={photo?.alt ?? (v.imageAlt || v.title)}
              icon={v.icon}
              overline={v.category || 'Categoria'}
              title={v.title || 'Título da atividade'}
              description={v.description || 'Descrição curta da atividade.'}
              tags={tags}
              placeholderId="preview"
            />
          </Box>
        </Sticky>
      </Cols>
    </Stack>
  );
}

const TabsWrap = styled.div`
  padding: var(--space-2) var(--space-4) 0;
`;
const IconBadge = styled.span`
  flex: none;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 14px 14px 14px 4px;
  background: var(--brand-soft);
  color: var(--brand);
`;
const Footnote = styled.p`
  margin: 0;
  padding: var(--space-4);
  border-top: var(--border-thin) solid var(--line);
  font: 600 14px/20px var(--font-body);
  color: var(--ink-muted);
`;
const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  flex-wrap: wrap;
`;
