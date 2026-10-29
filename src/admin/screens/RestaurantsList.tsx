'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Media } from '@/components/atoms/Media';
import {
  deleteRestaurantAction,
  moveRestaurantAction,
  setRestaurantStatusAction,
} from '@/app/admin/_actions/content';
import {
  DangerButton,
  IconButton,
  IconLink,
  StatusBadge,
  Tabs,
  type TabItem,
} from '../ui/controls';
import { CardMeta, CardRow, CellMain, DataList, RowActions } from '../ui/DataList';
import { Dialog } from '../ui/Dialog';
import { useAction } from '../ui/forms';
import { Box, PageTop, Stack } from '../ui/layout';
import { EmptyState } from '../ui/states';

export interface RestaurantListRow {
  id: string;
  name: string;
  neighborhood: string;
  region: string;
  regionId: string;
  schedule: string;
  ages: string;
  status: 'RASCUNHO' | 'PUBLICADO' | 'PAUSADO';
  destaqueHome: boolean;
  imageUrl: string | null;
}

export function RestaurantsList({
  rows,
  tabs,
  total,
}: {
  rows: RestaurantListRow[];
  tabs: TabItem[];
  total: number;
}) {
  const router = useRouter();
  const { run, pending } = useAction();
  const [toDelete, setToDelete] = useState<RestaurantListRow | null>(null);

  const act = async (fn: () => ReturnType<typeof moveRestaurantAction>) => {
    const r = await run(fn);
    if (r.ok) router.refresh();
    return r;
  };

  // pode subir/descer dentro da própria região (a ordem do site é por região)
  const siblings = (r: RestaurantListRow) => rows.filter((x) => x.regionId === r.regionId);
  const canMove = (r: RestaurantListRow, dir: 'up' | 'down') => {
    const s = siblings(r);
    const i = s.findIndex((x) => x.id === r.id);
    return dir === 'up' ? i > 0 : i < s.length - 1;
  };

  const actions = (r: RestaurantListRow) => (
    <RowActions>
      <IconButton
        icon="arrow-up"
        label={`Subir ${r.name}`}
        disabled={pending || !canMove(r, 'up')}
        onClick={() => act(() => moveRestaurantAction(r.id, 'up'))}
      />
      <IconButton
        icon="arrow-down"
        label={`Descer ${r.name}`}
        disabled={pending || !canMove(r, 'down')}
        onClick={() => act(() => moveRestaurantAction(r.id, 'down'))}
      />
      {r.status === 'PUBLICADO' ? (
        <IconButton
          icon="pause"
          label={`Pausar ${r.name}`}
          disabled={pending}
          onClick={() => act(() => setRestaurantStatusAction(r.id, 'PAUSADO'))}
        />
      ) : (
        <IconButton
          icon="eye"
          label={`Publicar ${r.name}`}
          disabled={pending}
          onClick={() => act(() => setRestaurantStatusAction(r.id, 'PUBLICADO'))}
        />
      )}
      <IconLink icon="edit" label={`Editar ${r.name}`} href={`/admin/restaurantes/${r.id}`} />
      <IconButton
        icon="trash"
        tone="danger"
        label={`Excluir ${r.name}`}
        onClick={() => setToDelete(r)}
      />
    </RowActions>
  );

  return (
    <Stack>
      <PageTop
        crumb="Conteúdo"
        title="Restaurantes"
        actions={
          <Button href="/admin/restaurantes/novo" iconLeft="plus">
            Novo restaurante
          </Button>
        }
      />

      {total === 0 ? (
        <Box>
          <EmptyState
            title="Nenhum restaurante por aqui ainda"
            action={
              <Button href="/admin/restaurantes/novo" iconLeft="plus">
                Novo restaurante
              </Button>
            }
          >
            Cadastre o primeiro parceiro e ele aparece na página Restaurantes, agrupado pela região.
          </EmptyState>
        </Box>
      ) : (
        <Box $flush>
          <TabsWrap>
            <Tabs items={tabs} label="Situação dos restaurantes" />
          </TabsWrap>
          {rows.length ? (
            <DataList
              caption="Restaurantes"
              rows={rows}
              rowKey={(r) => r.id}
              columns={[
                {
                  key: 'name',
                  header: 'Restaurante',
                  render: (r) => (
                    <CellMain>
                      <Thumb>
                        <Media
                          src={r.imageUrl}
                          alt=""
                          ratio="4 / 3"
                          icon="utensils"
                          rounded={false}
                        />
                      </Thumb>
                      <div>
                        <strong>{r.name}</strong>
                        <span>{r.neighborhood}</span>
                      </div>
                    </CellMain>
                  ),
                },
                { key: 'region', header: 'Região', render: (r) => r.region },
                { key: 'schedule', header: 'Recreação', render: (r) => r.schedule },
                { key: 'ages', header: 'Idades', render: (r) => r.ages },
                {
                  key: 'status',
                  header: 'Situação',
                  render: (r) => (
                    <Stack $gap="var(--space-1)">
                      <StatusBadge status={r.status} />
                      {r.destaqueHome ? (
                        <Hint>
                          <Icon name="star" size={14} /> Destaque na Início
                        </Hint>
                      ) : null}
                    </Stack>
                  ),
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
                  <CardRow>
                    <CellMain>
                      <Thumb>
                        <Media
                          src={r.imageUrl}
                          alt=""
                          ratio="4 / 3"
                          icon="utensils"
                          rounded={false}
                        />
                      </Thumb>
                      <div>
                        <strong>{r.name}</strong>
                        <span>
                          {r.neighborhood} · {r.region}
                        </span>
                      </div>
                    </CellMain>
                  </CardRow>
                  <CardMeta>
                    <span>
                      <Icon name="clock" size={16} /> {r.schedule}
                    </span>
                    <span>
                      <Icon name="users" size={16} /> {r.ages}
                    </span>
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
              Tente outra aba ou cadastre um novo restaurante.
            </EmptyState>
          )}
          <Footnote>
            A ordem desta lista é a ordem em que os restaurantes aparecem no site, agrupados por
            região.
          </Footnote>
        </Box>
      )}

      <Dialog
        open={!!toDelete}
        alert
        closeOnBackdrop={false}
        onClose={() => setToDelete(null)}
        title="Excluir este restaurante?"
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
                  const r = await act(() => setRestaurantStatusAction(toDelete.id, 'PAUSADO'));
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
                const r = await act(() => deleteRestaurantAction(toDelete.id));
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
            <Highlight>
              <Thumb>
                <Media
                  src={toDelete.imageUrl}
                  alt=""
                  ratio="4 / 3"
                  icon="utensils"
                  rounded={false}
                />
              </Thumb>
              <div>
                <strong>{toDelete.name}</strong>
                <span>
                  {toDelete.neighborhood} · {toDelete.schedule}
                </span>
              </div>
            </Highlight>
            <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
              O card sai da página Restaurantes e da prévia na Início. As fotos continuam na
              biblioteca.
            </p>
            {toDelete.destaqueHome ? (
              <p style={{ margin: 0, color: 'var(--ink)' }}>
                Ele aparece em destaque na Início. Se for só uma pausa (reforma, férias), prefira
                pausar: ele some do site e volta com um clique.
              </p>
            ) : null}
          </>
        ) : null}
      </Dialog>
    </Stack>
  );
}

const TabsWrap = styled.div`
  padding: var(--space-2) var(--space-4) 0;
`;
const Thumb = styled.div`
  flex: none;
  width: 56px;
  height: 44px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  [data-media] {
    height: 100%;
    aspect-ratio: auto !important;
  }
`;
const Hint = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font: 600 13px/18px var(--font-body);
  color: var(--ink-muted);
`;
const Footnote = styled.p`
  margin: 0;
  padding: var(--space-4);
  border-top: var(--border-thin) solid var(--line);
  font: 600 14px/20px var(--font-body);
  color: var(--ink-muted);
`;
const Highlight = styled.div`
  display: flex;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--surface-sunken);

  strong {
    display: block;
    font: 800 15px/20px var(--font-body);
  }
  span {
    font: 400 14px/20px var(--font-body);
    color: var(--ink-muted);
  }
`;
