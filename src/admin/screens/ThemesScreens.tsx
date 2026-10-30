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
  deleteThemeAction,
  moveThemeAction,
  saveThemeAction,
  setThemeStatusAction,
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

export interface ThemeListRow {
  id: string;
  title: string;
  icon: string;
  tags: string[];
  status: Status;
}

/* ===================== Lista ===================== */
export function ThemesList({
  rows,
  tabs,
  total,
}: {
  rows: ThemeListRow[];
  tabs: TabItem[];
  total: number;
}) {
  const router = useRouter();
  const { run, pending } = useAction();
  const [toDelete, setToDelete] = useState<ThemeListRow | null>(null);

  const act = async (fn: () => ReturnType<typeof moveThemeAction>) => {
    const r = await run(fn);
    if (r.ok) router.refresh();
    return r;
  };
  const idx = (r: ThemeListRow) => rows.findIndex((x) => x.id === r.id);

  const actions = (r: ThemeListRow) => (
    <RowActions>
      <IconButton
        icon="arrow-up"
        label={`Subir ${r.title}`}
        disabled={pending || idx(r) === 0}
        onClick={() => act(() => moveThemeAction(r.id, 'up'))}
      />
      <IconButton
        icon="arrow-down"
        label={`Descer ${r.title}`}
        disabled={pending || idx(r) === rows.length - 1}
        onClick={() => act(() => moveThemeAction(r.id, 'down'))}
      />
      {r.status === 'PUBLICADO' ? (
        <IconButton
          icon="pause"
          label={`Pausar ${r.title}`}
          disabled={pending}
          onClick={() => act(() => setThemeStatusAction(r.id, 'PAUSADO'))}
        />
      ) : (
        <IconButton
          icon="eye"
          label={`Publicar ${r.title}`}
          disabled={pending}
          onClick={() => act(() => setThemeStatusAction(r.id, 'PUBLICADO'))}
        />
      )}
      <IconLink icon="edit" label={`Editar ${r.title}`} href={`/admin/temas/${r.id}`} />
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
        title="Temas de festa"
        actions={
          <Button href="/admin/temas/novo" iconLeft="plus">
            Novo tema
          </Button>
        }
      />
      {total === 0 ? (
        <Box>
          <EmptyState
            title="Nenhum tema por aqui ainda"
            action={
              <Button href="/admin/temas/novo" iconLeft="plus">
                Novo tema
              </Button>
            }
          >
            Cadastre o primeiro e ele aparece na página Festas e aniversários.
          </EmptyState>
        </Box>
      ) : (
        <Box $flush>
          <TabsWrap>
            <Tabs items={tabs} label="Situação dos temas" />
          </TabsWrap>
          {rows.length ? (
            <DataList
              caption="Temas de festa"
              rows={rows}
              rowKey={(r) => r.id}
              columns={[
                {
                  key: 'title',
                  header: 'Tema',
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
              Tente outra aba ou cadastre um novo tema.
            </EmptyState>
          )}
          <Footnote>
            A ordem desta lista é a ordem dos temas na página Festas e aniversários.
          </Footnote>
        </Box>
      )}

      <Dialog
        open={!!toDelete}
        alert
        closeOnBackdrop={false}
        onClose={() => setToDelete(null)}
        title="Excluir este tema?"
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
                  const r = await act(() => setThemeStatusAction(toDelete.id, 'PAUSADO'));
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
                const r = await act(() => deleteThemeAction(toDelete.id));
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
              <strong>{toDelete.title}</strong>
            </p>
            <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
              O card sai da página Festas e aniversários. As fotos continuam na biblioteca. Se for
              só uma pausa, prefira pausar: ele some do site e volta com um clique.
            </p>
          </>
        ) : null}
      </Dialog>
    </Stack>
  );
}

/* ===================== Formulário ===================== */
export interface ThemeFormValues {
  icon: IconName;
  title: string;
  description: string;
  tags: string;
  imageId: string | null;
  imageAlt: string;
  visible: boolean;
}

export const EMPTY_THEME: ThemeFormValues = {
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

export function ThemeForm({
  id,
  initial,
  status,
  library,
}: {
  id: string | null;
  initial: ThemeFormValues;
  status?: Status;
  library: PickerPhoto[];
}) {
  const router = useRouter();
  const { run, pending, result } = useAction<{ id: string }>();
  const [v, setV] = useState(initial);
  const set = <K extends keyof ThemeFormValues>(k: K, value: ThemeFormValues[K]) =>
    setV((s) => ({ ...s, [k]: value }));
  const photo = library.find((p) => p.id === v.imageId);
  const tags = splitTags(v.tags);

  const save = async (mode: SaveMode) => {
    const r = await run(() => saveThemeAction(id, { ...v, tags }, mode));
    if (r.ok && r.data) {
      if (!id) router.replace(`/admin/temas/${r.data.id}`);
      else router.refresh();
    }
  };

  return (
    <Stack>
      <PageTop
        crumb={<>Temas de festa › {id ? 'Editar' : 'Novo'}</>}
        title={v.title.trim() || (id ? 'Tema' : 'Novo tema')}
        actions={status ? <StatusBadge status={status} /> : undefined}
      />
      <ErrorSummary result={result} />
      <Cols $form>
        <Stack>
          <Box>
            <BoxTitle>1 · Tema</BoxTitle>
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
                  placeholder="4 a 10 anos, Personalizável"
                  hint="Separe por vírgula (idade, “Personalizável”…). No máximo 4."
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
              label="Foto do tema (16:10)"
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
            <Button variant="ghost" href="/admin/temas">
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
              Como o card aparece na página Festas e aniversários. Atualiza enquanto você digita.
            </BoxSub>
            <ServiceCard
              image={photo?.url ?? null}
              imageAlt={photo?.alt ?? (v.imageAlt || v.title)}
              icon={v.icon}
              title={v.title || 'Título do tema'}
              description={v.description || 'Descrição curta do tema.'}
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
