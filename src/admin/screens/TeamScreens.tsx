'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { Tag, TagList } from '@/components/atoms/Tag';
import { TextField } from '@/components/atoms/TextField';
import { TeamCard } from '@/components/molecules/TeamCard';
import {
  deleteMemberAction,
  moveMemberAction,
  saveMemberAction,
  setMemberVisibleAction,
} from '@/app/admin/_actions/content';
import { DangerButton, IconButton, IconLink, StatusBadge, Switch } from '../ui/controls';
import { CardRow, CellMain, DataList, RowActions } from '../ui/DataList';
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

export interface TeamListRow {
  id: string;
  nickname: string;
  name: string;
  role: string;
  badges: string[];
  visible: boolean;
}

/* ===================== Lista ===================== */
export function TeamList({ rows }: { rows: TeamListRow[] }) {
  const router = useRouter();
  const { run, pending } = useAction();
  const [toDelete, setToDelete] = useState<TeamListRow | null>(null);

  const act = async (fn: () => ReturnType<typeof moveMemberAction>) => {
    const r = await run(fn);
    if (r.ok) router.refresh();
    return r;
  };
  const idx = (r: TeamListRow) => rows.findIndex((x) => x.id === r.id);

  const actions = (r: TeamListRow) => (
    <RowActions>
      <IconButton
        icon="arrow-up"
        label={`Subir ${r.name}`}
        disabled={pending || idx(r) === 0}
        onClick={() => act(() => moveMemberAction(r.id, 'up'))}
      />
      <IconButton
        icon="arrow-down"
        label={`Descer ${r.name}`}
        disabled={pending || idx(r) === rows.length - 1}
        onClick={() => act(() => moveMemberAction(r.id, 'down'))}
      />
      <IconButton
        icon={r.visible ? 'eye-off' : 'eye'}
        label={r.visible ? `Ocultar ${r.name} do site` : `Mostrar ${r.name} no site`}
        disabled={pending}
        onClick={() => act(() => setMemberVisibleAction(r.id, !r.visible))}
      />
      <IconLink icon="edit" label={`Editar ${r.name}`} href={`/admin/equipe/${r.id}`} />
      <IconButton
        icon="trash"
        tone="danger"
        label={`Remover ${r.name}`}
        onClick={() => setToDelete(r)}
      />
    </RowActions>
  );

  const who = (r: TeamListRow) => (
    <CellMain>
      <Initials aria-hidden>{r.name.slice(0, 2).toUpperCase()}</Initials>
      <div>
        <strong>{r.name}</strong>
        <span>{r.nickname}</span>
      </div>
    </CellMain>
  );

  return (
    <Stack>
      <PageTop
        crumb="Conteúdo"
        title="Equipe"
        actions={
          <Button href="/admin/equipe/novo" iconLeft="plus">
            Nova pessoa
          </Button>
        }
      />
      {rows.length === 0 ? (
        <Box>
          <EmptyState
            title="Ninguém na equipe ainda"
            action={
              <Button href="/admin/equipe/novo" iconLeft="plus">
                Nova pessoa
              </Button>
            }
          >
            Cadastre os monitores e eles aparecem em Quem somos.
          </EmptyState>
        </Box>
      ) : (
        <Box $flush>
          <DataList
            caption="Equipe"
            rows={rows}
            rowKey={(r) => r.id}
            columns={[
              { key: 'who', header: 'Pessoa', render: who },
              { key: 'role', header: 'Função', render: (r) => r.role },
              {
                key: 'badges',
                header: 'Selos',
                render: (r) => (
                  <TagList>
                    {r.badges.map((b) => (
                      <Tag key={b} tone="earth" icon="shield">
                        {b}
                      </Tag>
                    ))}
                  </TagList>
                ),
              },
              {
                key: 'visible',
                header: 'Situação',
                render: (r) => <StatusBadge status={r.visible ? 'PUBLICADO' : 'PAUSADO'} />,
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
                {who(r)}
                <span style={{ color: 'var(--ink-muted)' }}>{r.role}</span>
                <CardRow>
                  <StatusBadge status={r.visible ? 'PUBLICADO' : 'PAUSADO'} />
                  {actions(r)}
                </CardRow>
              </>
            )}
          />
          <Footnote>A ordem desta lista é a ordem em Quem somos.</Footnote>
        </Box>
      )}

      <Dialog
        open={!!toDelete}
        alert
        closeOnBackdrop={false}
        onClose={() => setToDelete(null)}
        title="Remover esta pessoa da equipe?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Cancelar
            </Button>
            {toDelete?.visible ? (
              <Button
                variant="outline"
                iconLeft="eye-off"
                disabled={pending}
                onClick={async () => {
                  const r = await act(() => setMemberVisibleAction(toDelete.id, false));
                  if (r.ok) setToDelete(null);
                }}
              >
                Ocultar em vez de remover
              </Button>
            ) : null}
            <DangerButton
              iconLeft="trash"
              disabled={pending}
              onClick={async () => {
                if (!toDelete) return;
                const r = await act(() => deleteMemberAction(toDelete.id));
                if (r.ok) setToDelete(null);
              }}
            >
              Remover
            </DangerButton>
          </>
        }
      >
        {toDelete ? (
          <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
            <strong style={{ color: 'var(--ink)' }}>{toDelete.name}</strong> sai da página Quem
            somos. Se for só uma pausa, prefira ocultar: a pessoa some do site e volta com um
            clique.
          </p>
        ) : null}
      </Dialog>
    </Stack>
  );
}

/* ===================== Formulário ===================== */
export interface TeamFormValues {
  nickname: string;
  name: string;
  role: string;
  bio: string;
  badges: string;
  photoId: string | null;
  visible: boolean;
}

export const EMPTY_MEMBER: TeamFormValues = {
  nickname: '',
  name: '',
  role: '',
  bio: '',
  badges: 'Primeiros socorros',
  photoId: null,
  visible: true,
};

const splitList = (s: string) =>
  s
    .split(/[,;\n]/)
    .map((t) => t.trim())
    .filter(Boolean);

export function TeamForm({
  id,
  initial,
  library,
}: {
  id: string | null;
  initial: TeamFormValues;
  library: PickerPhoto[];
}) {
  const router = useRouter();
  const { run, pending, result } = useAction<{ id: string }>();
  const [v, setV] = useState(initial);
  const set = <K extends keyof TeamFormValues>(k: K, value: TeamFormValues[K]) =>
    setV((s) => ({ ...s, [k]: value }));
  const photo = library.find((p) => p.id === v.photoId);
  const badges = splitList(v.badges);

  const save = async () => {
    const r = await run(() => saveMemberAction(id, { ...v, badges }));
    if (r.ok && r.data) {
      if (!id) router.replace(`/admin/equipe/${r.data.id}`);
      else router.refresh();
    }
  };

  return (
    <Stack>
      <PageTop
        crumb={<>Equipe › {id ? 'Editar' : 'Nova pessoa'}</>}
        title={v.name.trim() || (id ? 'Pessoa' : 'Nova pessoa')}
      />
      <ErrorSummary result={result} />
      <Cols $form>
        <Stack>
          <Box>
            <BoxTitle>1 · Pessoa</BoxTitle>
            <Fields>
              <TextField
                label="Nome"
                required
                value={v.name}
                onChange={(e) => set('name', e.target.value)}
                error={fieldError(result, 'name')}
              />
              <TextField
                label="Apelido de monitor"
                required
                value={v.nickname}
                onChange={(e) => set('nickname', e.target.value)}
                placeholder="Capitão Trilha"
                error={fieldError(result, 'nickname')}
              />
              <div className="full">
                <TextField
                  label="Função"
                  required
                  value={v.role}
                  onChange={(e) => set('role', e.target.value)}
                  error={fieldError(result, 'role')}
                />
              </div>
              <div className="full">
                <TextField
                  label="Bio"
                  multiline
                  rows={3}
                  required
                  value={v.bio}
                  onChange={(e) => set('bio', e.target.value)}
                  error={fieldError(result, 'bio')}
                />
                <Count value={v.bio} max={140} />
              </div>
              <div className="full">
                <TextField
                  label="Selos"
                  value={v.badges}
                  onChange={(e) => set('badges', e.target.value)}
                  hint="Certificações, separadas por vírgula. No máximo 3."
                  error={fieldError(result, 'badges')}
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
              label="Foto (1:1)"
              hint="Sem foto, o card mostra as iniciais."
              library={library}
              value={v.photoId}
              onChange={(x) => set('photoId', x)}
              ratio="1 / 1"
            />
          </Box>
          <Buttons>
            <Button variant="ghost" href="/admin/equipe">
              Cancelar
            </Button>
            <Button disabled={pending} onClick={save}>
              {pending ? 'Salvando…' : 'Salvar e publicar'}
            </Button>
          </Buttons>
        </Stack>
        <Sticky>
          <Box>
            <BoxTitle>Prévia no site</BoxTitle>
            <BoxSub>Como o card aparece em Quem somos. Atualiza enquanto você digita.</BoxSub>
            <TeamCard
              name={v.name || 'Nome'}
              nickname={v.nickname || undefined}
              role={v.role || undefined}
              bio={v.bio || undefined}
              badges={badges}
              photo={photo?.url}
            />
          </Box>
        </Sticky>
      </Cols>
    </Stack>
  );
}

const Initials = styled.span`
  flex: none;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--brand-soft);
  color: var(--brand);
  font: 800 15px/1 var(--font-body);
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
