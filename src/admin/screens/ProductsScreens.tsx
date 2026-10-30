'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Select } from '@/components/atoms/Select';
import { TextField } from '@/components/atoms/TextField';
import {
  deleteProductAction,
  moveProductAction,
  saveProductAction,
  setProductStatusAction,
} from '@/app/admin/_actions/content';
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABEL } from '@/content/productCategories';
import type { ProductCategory } from '@/content/productCategories';
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
import { Box, BoxSub, BoxTitle, Cols, Count, Fields, PageTop, Stack, Sticky } from '../ui/layout';
import { MediaPicker, type PickerPhoto } from '../ui/MediaPicker';
import { EmptyState } from '../ui/states';

type Status = 'RASCUNHO' | 'PUBLICADO' | 'ESGOTADO';

export interface ProductListRow {
  id: string;
  name: string;
  icon: string;
  categoryLabel: string;
  minQty: number;
  personalizavel: boolean;
  nosRestaurantes: boolean;
  status: Status;
  missing: string | null;
}

const iconOf = (name: string): IconName =>
  (ICON_NAMES as readonly string[]).includes(name) ? (name as IconName) : 'backpack';

/** Linha de apoio sob o nome: o que falta (rascunho) ou as etiquetas do produto. */
const extraOf = (r: ProductListRow) =>
  r.status === 'RASCUNHO' && r.missing
    ? r.missing
    : [r.personalizavel && 'Personalizável', r.nosRestaurantes && 'Nos restaurantes']
        .filter(Boolean)
        .join(' · ') || '—';

/* ===================== Tela: lista (+ formulário ao lado) ===================== */
export function ProductsScreen({
  rows,
  tabs,
  total,
  editing,
}: {
  rows: ProductListRow[];
  tabs: TabItem[];
  total: number;
  /** formulário aberto ao lado da lista (editar ou novo); null = só a lista */
  editing: ProductFormProps | null;
}) {
  const router = useRouter();
  const { run, pending } = useAction();
  const [toDelete, setToDelete] = useState<ProductListRow | null>(null);

  const act = async (fn: () => ReturnType<typeof moveProductAction>) => {
    const r = await run(fn);
    if (r.ok) router.refresh();
    return r;
  };
  const idx = (r: ProductListRow) => rows.findIndex((x) => x.id === r.id);

  const actions = (r: ProductListRow) => (
    <RowActions>
      <IconButton
        icon="arrow-up"
        label={`Subir ${r.name}`}
        disabled={pending || idx(r) === 0}
        onClick={() => act(() => moveProductAction(r.id, 'up'))}
      />
      <IconButton
        icon="arrow-down"
        label={`Descer ${r.name}`}
        disabled={pending || idx(r) === rows.length - 1}
        onClick={() => act(() => moveProductAction(r.id, 'down'))}
      />
      {r.status === 'RASCUNHO' ? (
        <IconButton
          icon="eye"
          label={`Publicar ${r.name}`}
          disabled={pending}
          onClick={() => act(() => setProductStatusAction(r.id, 'PUBLICADO'))}
        />
      ) : r.status === 'PUBLICADO' ? (
        <IconButton
          icon="flag"
          label={`Marcar ${r.name} como esgotado`}
          disabled={pending}
          onClick={() => act(() => setProductStatusAction(r.id, 'ESGOTADO'))}
        />
      ) : (
        <IconButton
          icon="check"
          label={`Voltar ${r.name} ao site`}
          disabled={pending}
          onClick={() => act(() => setProductStatusAction(r.id, 'PUBLICADO'))}
        />
      )}
      <IconLink icon="edit" label={`Editar ${r.name}`} href={`/admin/produtos/${r.id}`} />
      <IconButton
        icon="trash"
        tone="danger"
        label={`Excluir ${r.name}`}
        onClick={() => setToDelete(r)}
      />
    </RowActions>
  );

  const list = (
    <Box $flush aria-label="Lista de produtos">
      <TabsWrap>
        <Tabs items={tabs} label="Filtrar produtos" />
      </TabsWrap>
      {rows.length ? (
        <DataList
          caption="Produtos"
          rows={rows}
          rowKey={(r) => r.id}
          columns={[
            {
              key: 'name',
              header: 'Produto',
              render: (r) => (
                <CellMain>
                  <IconBadge aria-hidden>
                    <Icon name={iconOf(r.icon)} size={22} />
                  </IconBadge>
                  <div>
                    <strong>{r.name}</strong>
                    <span>{extraOf(r)}</span>
                  </div>
                </CellMain>
              ),
            },
            { key: 'cat', header: 'Categoria', render: (r) => r.categoryLabel },
            { key: 'min', header: 'Mínimo', render: (r) => `${r.minQty} un.` },
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
                  <Icon name={iconOf(r.icon)} size={22} />
                </IconBadge>
                <div>
                  <strong>{r.name}</strong>
                  <span>{extraOf(r)}</span>
                </div>
              </CellMain>
              <CardMeta>
                <span>
                  {r.categoryLabel} · mínimo {r.minQty} un.
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
        <EmptyState title="Nada nesta aba">Tente outra aba ou cadastre um novo produto.</EmptyState>
      )}
      <Footnote>A ordem desta lista é a ordem dos produtos na página Produtos.</Footnote>
    </Box>
  );

  return (
    <Stack>
      <PageTop
        crumb="Conteúdo"
        title="Produtos"
        actions={
          <Button href="/admin/produtos/novo" iconLeft="plus">
            Novo produto
          </Button>
        }
      />
      {total === 0 && !editing ? (
        <Box>
          <EmptyState
            title="Nenhum produto por aqui ainda"
            action={
              <Button href="/admin/produtos/novo" iconLeft="plus">
                Novo produto
              </Button>
            }
          >
            Cadastre o primeiro e ele aparece na página Produtos.
          </EmptyState>
        </Box>
      ) : editing ? (
        <Cols $form>
          {list}
          <ProductForm key={editing.id ?? 'novo'} {...editing} />
        </Cols>
      ) : (
        list
      )}

      <Dialog
        open={!!toDelete}
        alert
        closeOnBackdrop={false}
        onClose={() => setToDelete(null)}
        title="Excluir este produto?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Cancelar
            </Button>
            {toDelete && toDelete.status !== 'RASCUNHO' ? (
              <Button
                variant="outline"
                iconLeft="eye-off"
                disabled={pending}
                onClick={async () => {
                  const r = await act(() => setProductStatusAction(toDelete.id, 'RASCUNHO'));
                  if (r.ok) setToDelete(null);
                }}
              >
                Tirar do site em vez de excluir
              </Button>
            ) : null}
            <DangerButton
              iconLeft="trash"
              disabled={pending}
              onClick={async () => {
                if (!toDelete) return;
                const r = await act(() => deleteProductAction(toDelete.id));
                if (r.ok) {
                  setToDelete(null);
                  if (editing?.id === toDelete.id) router.replace('/admin/produtos');
                }
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
              <strong>{toDelete.name}</strong>
            </p>
            <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
              O card sai da página Produtos e quem já tem o produto na sacola o vê até esvaziá-la.
              As fotos continuam na biblioteca. Se for só uma pausa, prefira tirar do site: ele
              volta como rascunho e você publica de novo com um clique.
            </p>
          </>
        ) : null}
      </Dialog>
    </Stack>
  );
}

/* ===================== Formulário ===================== */
export interface ProductFormValues {
  name: string;
  category: ProductCategory;
  icon: IconName;
  description: string;
  minQty: string;
  personalizavel: boolean;
  nosRestaurantes: boolean;
  imageId: string | null;
  imageAlt: string;
  visible: boolean;
  soldOut: boolean;
}

export const EMPTY_PRODUCT: ProductFormValues = {
  name: '',
  category: 'LEMBRANCINHA',
  icon: 'backpack',
  description: '',
  minQty: '1',
  personalizavel: false,
  nosRestaurantes: false,
  imageId: null,
  imageAlt: '',
  visible: true,
  soldOut: false,
};

export interface ProductFormProps {
  id: string | null;
  initial: ProductFormValues;
  status?: Status;
  library: PickerPhoto[];
}

export function ProductForm({ id, initial, status, library }: ProductFormProps) {
  const router = useRouter();
  const { run, pending, result } = useAction<{ id: string }>();
  const [v, setV] = useState(initial);
  const set = <K extends keyof ProductFormValues>(k: K, value: ProductFormValues[K]) =>
    setV((s) => ({ ...s, [k]: value }));

  const save = async (mode: SaveMode) => {
    const minQty = v.minQty.trim() === '' ? Number.NaN : Number(v.minQty);
    const r = await run(() => saveProductAction(id, { ...v, minQty }, mode));
    if (r.ok && r.data) {
      if (!id) router.replace(`/admin/produtos/${r.data.id}`);
      else router.refresh();
    }
  };

  return (
    <Sticky>
      <Box as="form" noValidate aria-labelledby="ed-prod" onSubmit={(e) => e.preventDefault()}>
        <BoxHead>
          <BoxTitle id="ed-prod">
            {id ? `Editar · ${initial.name || 'Produto'}` : 'Novo produto'}
          </BoxTitle>
          {status ? <StatusBadge status={status} /> : null}
        </BoxHead>
        <ErrorSummary result={result} />

        <MediaPicker
          label="Foto do produto (4:3)"
          library={library}
          value={v.imageId}
          onChange={(x) => set('imageId', x)}
          ratio="4 / 3"
        />
        <Fields>
          <div className="full">
            <TextField
              label="Descrição da foto"
              required
              value={v.imageAlt}
              onChange={(e) => set('imageAlt', e.target.value)}
              hint="Para quem não vê a imagem; também aparece enquanto não houver foto."
              error={fieldError(result, 'imageAlt')}
            />
          </div>
          <div className="full">
            <TextField
              label="Nome"
              required
              value={v.name}
              onChange={(e) => set('name', e.target.value)}
              error={fieldError(result, 'name')}
            />
            <Count value={v.name} max={50} />
          </div>
          <Select
            label="Categoria"
            value={v.category}
            onChange={(e) => set('category', e.target.value as ProductCategory)}
            options={PRODUCT_CATEGORIES.map((c) => ({
              value: c,
              label: PRODUCT_CATEGORY_LABEL[c],
            }))}
            error={fieldError(result, 'category')}
          />
          <Select
            label="Ícone (sem foto)"
            value={v.icon}
            onChange={(e) => set('icon', e.target.value as IconName)}
            options={ICON_NAMES.map((n) => ({ value: n, label: n }))}
            error={fieldError(result, 'icon')}
          />
          <div className="full">
            <TextField
              label="Descrição curta"
              multiline
              rows={2}
              required
              value={v.description}
              onChange={(e) => set('description', e.target.value)}
              error={fieldError(result, 'description')}
            />
            <Count value={v.description} max={120} />
          </div>
          <div className="full">
            <TextField
              label="Quantidade mínima"
              type="number"
              inputMode="numeric"
              min={1}
              required
              value={v.minQty}
              onChange={(e) => set('minQty', e.target.value)}
              hint="1 = vende por unidade."
              error={fieldError(result, 'minQty')}
            />
          </div>
        </Fields>

        <Switches>
          <Switch
            label="Personalizável (nome, tema, cores)"
            checked={v.personalizavel}
            onChange={(x) => set('personalizavel', x)}
          />
          <Switch
            label="Também à venda nos restaurantes"
            checked={v.nosRestaurantes}
            onChange={(x) => set('nosRestaurantes', x)}
          />
          <Switch
            label="Esgotado (aparece no site, sem o botão de adicionar)"
            checked={v.soldOut}
            onChange={(x) => set('soldOut', x)}
          />
          <Switch label="Mostrar no site" checked={v.visible} onChange={(x) => set('visible', x)} />
        </Switches>

        <BoxSub style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Icon name="shield" size={16} />
          Produtos não têm campo de preço: valores são combinados no WhatsApp.
        </BoxSub>

        <Buttons>
          <Button variant="ghost" href="/admin/produtos">
            Cancelar
          </Button>
          <Button variant="outline" disabled={pending} onClick={() => save('draft')}>
            Salvar rascunho
          </Button>
          <Button disabled={pending} iconLeft="check" onClick={() => save('publish')}>
            {pending ? 'Salvando…' : 'Salvar e publicar'}
          </Button>
        </Buttons>
      </Box>
    </Sticky>
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
const BoxHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
`;
const Switches = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;
const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  flex-wrap: wrap;
  padding-top: var(--space-2);
  border-top: var(--border-thin) solid var(--line);
`;
