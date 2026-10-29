'use client';

import { useActionState, useEffect, useTransition, type FormEvent } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { Logo } from '@/components/atoms/Logo';
import { TextField } from '@/components/atoms/TextField';
import { MIN_PASSWORD } from '@/lib/passwordPolicy';
import { changePasswordAction, logoutAction } from '@/app/admin/_actions/auth';
import { ErrorSummary, fieldError } from '../ui/forms';

/** Primeiro acesso (ou senha redefinida): a troca vem antes de qualquer outra tela. */
export function ChangePasswordScreen({ name }: { name: string }) {
  const [state, action, pending] = useActionState(changePasswordAction, null);
  useEffect(() => {
    if (state?.ok && state.data?.to) window.location.assign(state.data.to);
  }, [state]);
  // onSubmit (e não <form action>) para os campos NÃO serem apagados quando há erro de validação
  const [, startTransition] = useTransition();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  };

  return (
    <Page>
      <Card>
        <Logo variant="compact" tone="auto" height={48} />
        <div>
          <h1 className="h2" style={{ margin: 0 }}>
            Crie a sua senha
          </h1>
          <p style={{ margin: 'var(--space-2) 0 0', color: 'var(--ink-muted)' }}>
            Olá, {name}. A senha que você recebeu é temporária: antes de continuar, escolha uma só
            sua.
          </p>
        </div>

        <ErrorSummary result={state} />

        <Form onSubmit={onSubmit} noValidate>
          <TextField
            label="Senha temporária"
            name="current"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            error={fieldError(state, 'current')}
          />
          <TextField
            label="Nova senha"
            name="next"
            type="password"
            autoComplete="new-password"
            required
            hint={`Pelo menos ${MIN_PASSWORD} caracteres, com letras e números.`}
            error={fieldError(state, 'next')}
          />
          <TextField
            label="Repita a nova senha"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            error={fieldError(state, 'confirm')}
          />
          <Button type="submit" size="lg" fullWidth disabled={pending}>
            {pending ? 'Salvando…' : 'Salvar e entrar'}
          </Button>
        </Form>

        <form action={logoutAction}>
          <Button type="submit" variant="ghost">
            Sair sem trocar
          </Button>
        </form>
      </Card>
    </Page>
  );
}

const Page = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: var(--space-6) var(--space-4);
  background: var(--surface-sunken);
  color: var(--ink);
  font-family: var(--font-body);
`;
const Card = styled.div`
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-6);
  background: var(--surface-raised);
  border: var(--border-thin) solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-stamp-card);
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
`;
