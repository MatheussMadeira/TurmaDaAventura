'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { TextField } from '@/components/atoms/TextField';
import { RestaurantCard } from '@/components/molecules/RestaurantCard';
import { saveRestaurantAction } from '@/app/admin/_actions/content';
import type { SaveMode } from '@/server/admin/restaurants';
import { StatusBadge, Switch } from '../ui/controls';
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

export interface RestaurantFormValues {
  name: string;
  neighborhood: string;
  address: string;
  mapsUrl: string;
  schedule: string;
  ages: string;
  destaqueHome: boolean;
  visible: boolean;
  imageId: string | null;
  imageAlt: string;
}

export const EMPTY_RESTAURANT: RestaurantFormValues = {
  name: '',
  neighborhood: '',
  address: '',
  mapsUrl: '',
  schedule: '',
  ages: '',
  destaqueHome: false,
  visible: true,
  imageId: null,
  imageAlt: '',
};

export function RestaurantForm({
  id,
  initial,
  status,
  library,
}: {
  id: string | null;
  initial: RestaurantFormValues;
  status?: 'RASCUNHO' | 'PUBLICADO' | 'PAUSADO';
  library: PickerPhoto[];
}) {
  const router = useRouter();
  const { run, pending, result } = useAction<{ id: string }>();
  const [v, setV] = useState(initial);
  const set = <K extends keyof RestaurantFormValues>(k: K, value: RestaurantFormValues[K]) =>
    setV((s) => ({ ...s, [k]: value }));
  const text =
    (k: 'name' | 'neighborhood' | 'address' | 'mapsUrl' | 'schedule' | 'ages' | 'imageAlt') =>
    (e: { target: { value: string } }) =>
      set(k, e.target.value);

  const photo = library.find((p) => p.id === v.imageId);

  const save = async (mode: SaveMode) => {
    const r = await run(() => saveRestaurantAction(id, v, mode));
    if (r.ok && r.data) {
      if (!id) router.replace(`/admin/restaurantes/${r.data.id}`);
      else router.refresh();
    }
  };

  return (
    <Stack>
      <PageTop
        crumb={<>Restaurantes › {id ? 'Editar' : 'Novo'}</>}
        title={v.name.trim() || (id ? 'Restaurante' : 'Novo restaurante')}
        actions={status ? <StatusBadge status={status} /> : undefined}
      />

      <ErrorSummary result={result} />

      <Cols $form>
        <Stack>
          <Box>
            <BoxTitle>1 · Restaurante</BoxTitle>
            <Fields>
              <TextField
                label="Nome"
                required
                value={v.name}
                onChange={text('name')}
                maxLength={80}
                error={fieldError(result, 'name')}
              />
              <TextField
                label="Bairro"
                required
                value={v.neighborhood}
                onChange={text('neighborhood')}
                hint="Aparece em cima do nome, no card."
                error={fieldError(result, 'neighborhood')}
              />
              <TextField
                label="Endereço"
                required
                value={v.address}
                onChange={text('address')}
                hint="Sem o bairro."
                placeholder="Rua das Acácias, 000"
                error={fieldError(result, 'address')}
              />
              <div className="full">
                <TextField
                  label="Link do mapa (opcional)"
                  value={v.mapsUrl}
                  onChange={text('mapsUrl')}
                  placeholder="https://maps.app.goo.gl/…"
                  hint="Vazio: o botão “Como chegar” busca pelo endereço."
                  error={fieldError(result, 'mapsUrl')}
                />
              </div>
            </Fields>
          </Box>

          <Box>
            <BoxTitle>2 · Recreação</BoxTitle>
            <Fields>
              <div className="full">
                <TextField
                  label="Dias e horários"
                  required
                  value={v.schedule}
                  onChange={text('schedule')}
                  placeholder="Sáb e dom, 12h às 17h"
                  hint="Ex.: “Sex, 19h às 23h · Sáb, 12h às 16h”"
                  error={fieldError(result, 'schedule')}
                />
                <Count value={v.schedule} max={50} />
              </div>
              <TextField
                label="Faixa etária"
                required
                value={v.ages}
                onChange={text('ages')}
                placeholder="De 3 a 10 anos"
                error={fieldError(result, 'ages')}
              />
            </Fields>
            <Row>
              <Switch
                label="Mostrar no site"
                checked={v.visible}
                onChange={(x) => set('visible', x)}
              />
              <Switch
                label="Destacar na Início"
                checked={v.destaqueHome}
                onChange={(x) => set('destaqueHome', x)}
              />
            </Row>
            <BoxSub>
              “Mostrar no site” desligado pausa o restaurante ao publicar. A Início mostra até 3
              destaques.
            </BoxSub>
          </Box>

          <Box>
            <BoxTitle>3 · Fotos</BoxTitle>
            <MediaPicker
              label="Foto do espaço kids (4:3)"
              hint="Fotos com autorização dos responsáveis. A descrição vem do cadastro da foto."
              library={library}
              value={v.imageId}
              onChange={(x) => set('imageId', x)}
              ratio="4 / 3"
            />
            {!v.imageId ? (
              <TextField
                label="Descrição do placeholder"
                value={v.imageAlt}
                onChange={text('imageAlt')}
                hint="Lida por leitores de tela enquanto não houver foto."
                error={fieldError(result, 'imageAlt')}
              />
            ) : null}
          </Box>

          <Buttons>
            <Button variant="ghost" href="/admin/restaurantes">
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
            <Head>
              <BoxTitle>Prévia no site</BoxTitle>
              <Live>Ao vivo</Live>
            </Head>
            <BoxSub>
              Exatamente como o card aparece em Restaurantes e na Início. Atualiza enquanto você
              digita.
            </BoxSub>
            <RestaurantCard
              name={v.name || 'Nome do restaurante'}
              neighborhood={v.neighborhood || 'Bairro'}
              schedule={v.schedule || 'Dias e horários'}
              address={v.address || 'Endereço'}
              ages={v.ages || 'Faixa etária'}
              image={photo?.url}
              imageAlt={photo?.alt ?? (v.imageAlt || v.name)}
              mapsUrl="#"
              placeholderId="preview"
            />
          </Box>
        </Sticky>
      </Cols>
    </Stack>
  );
}

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  flex-wrap: wrap;
`;
const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
`;
const Live = styled.span`
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  background: var(--brand-soft);
  color: var(--brand);
  font: 800 12px/16px var(--font-body);
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;
