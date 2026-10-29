'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { TextField } from '@/components/atoms/TextField';
import { saveSettingsAction } from '@/app/admin/_actions/content';
import { MESSAGE_KEYS } from '@/content/adminSchemas';
import { whatsappUrl } from '@/lib/whatsapp';
import { Alert } from '../ui/controls';
import { ErrorSummary, fieldError, useAction } from '../ui/forms';
import { Box, BoxSub, BoxTitle, Cols, Count, Fields, PageTop, Stack, Sticky } from '../ui/layout';

export interface ContactValues {
  whatsapp: string;
  instagram: string;
  email: string;
  city: string;
  hours: string;
  messages: Record<string, string>;
}

export function ContactScreen({ initial }: { initial: ContactValues }) {
  const { run, pending, result } = useAction();
  const [v, setV] = useState(initial);
  const set = <K extends keyof ContactValues>(k: K, value: ContactValues[K]) =>
    setV((s) => ({ ...s, [k]: value }));

  const digits = v.whatsapp.replace(/\D/g, '');
  const pretty =
    digits.length >= 12
      ? `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`
      : v.whatsapp;
  const handle = v.instagram.startsWith('@') || !v.instagram ? v.instagram : `@${v.instagram}`;

  return (
    <Stack>
      <PageTop
        crumb="Administração"
        title="Contato e WhatsApp"
        actions={
          <>
            <Button
              variant="outline"
              iconLeft="whatsapp"
              href={whatsappUrl(v.messages.float ?? '', digits)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir conversa de teste
            </Button>
            <Button disabled={pending} onClick={() => run(() => saveSettingsAction(v))}>
              {pending ? 'Salvando…' : 'Salvar e publicar'}
            </Button>
          </>
        }
      />
      <ErrorSummary result={result} />

      <Cols $form>
        <Stack>
          <Box>
            <BoxTitle>Dados de contato</BoxTitle>
            <BoxSub>Aparecem no rodapé de todas as páginas e no botão flutuante.</BoxSub>
            <Fields>
              <TextField
                label="WhatsApp"
                required
                inputMode="numeric"
                value={v.whatsapp}
                onChange={(e) => set('whatsapp', e.target.value)}
                hint="DDI + DDD + número. Ex.: 5511999999999"
                error={fieldError(result, 'whatsapp')}
              />
              <TextField
                label="Instagram"
                required
                value={v.instagram}
                onChange={(e) => set('instagram', e.target.value)}
                error={fieldError(result, 'instagram')}
              />
              <TextField
                label="E-mail"
                type="email"
                value={v.email}
                onChange={(e) => set('email', e.target.value)}
                hint="Opcional."
                error={fieldError(result, 'email')}
              />
              <TextField
                label="Cidade"
                required
                value={v.city}
                onChange={(e) => set('city', e.target.value)}
                error={fieldError(result, 'city')}
              />
              <div className="full">
                <TextField
                  label="Horário de atendimento"
                  required
                  value={v.hours}
                  onChange={(e) => set('hours', e.target.value)}
                  error={fieldError(result, 'hours')}
                />
              </div>
            </Fields>
          </Box>

          <Box>
            <BoxTitle>Mensagem pronta por página</BoxTitle>
            <BoxSub>
              É o texto que já chega escrito quando alguém toca no botão de WhatsApp daquela página.
            </BoxSub>
            <Stack $gap="var(--space-4)">
              {MESSAGE_KEYS.map(([key, label]) => (
                <div key={key}>
                  <TextField
                    label={label}
                    multiline
                    rows={2}
                    value={v.messages[key] ?? ''}
                    onChange={(e) => set('messages', { ...v.messages, [key]: e.target.value })}
                    error={fieldError(result, `messages.${key}`)}
                  />
                  <Count value={v.messages[key] ?? ''} max={300} />
                </div>
              ))}
            </Stack>
          </Box>

          <Alert tone="info">
            Depois de salvar, use “Abrir conversa de teste” para conferir se o número e a mensagem
            estão certos.
          </Alert>
        </Stack>

        <Sticky>
          <Box>
            <BoxTitle>Prévia</BoxTitle>
            <BoxSub>Como o contato aparece no site.</BoxSub>
            <Preview>
              <p className="overline">Fale com a gente</p>
              <ul>
                <li>
                  <Icon name="whatsapp" size={18} /> {pretty || 'WhatsApp'}
                </li>
                {handle ? (
                  <li>
                    <Icon name="instagram" size={18} /> {handle}
                  </li>
                ) : null}
                {v.email ? (
                  <li>
                    <Icon name="mail" size={18} /> {v.email}
                  </li>
                ) : null}
                {v.city ? (
                  <li>
                    <Icon name="map-pin" size={18} /> {v.city}
                  </li>
                ) : null}
                {v.hours ? (
                  <li>
                    <Icon name="clock" size={18} /> {v.hours}
                  </li>
                ) : null}
              </ul>
            </Preview>
          </Box>
        </Sticky>
      </Cols>
    </Stack>
  );
}

const Preview = styled.div`
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--surface-forest);
  color: var(--ink-on-forest);

  .overline {
    margin: 0 0 var(--space-3);
    color: var(--caqui-200);
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  li {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font: 600 16px/22px var(--font-body);
    overflow-wrap: anywhere;
  }
`;
