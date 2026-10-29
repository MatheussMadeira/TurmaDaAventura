'use client';

import { useActionState, useState, useTransition, type FormEvent } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { CamoBackdrop } from '@/components/atoms/CamoPattern';
import { Logo } from '@/components/atoms/Logo';
import { TextField } from '@/components/atoms/TextField';
import { media } from '@/design-system/media';
import { loginAction } from '@/app/admin/_actions/auth';
import { Alert } from '../ui/controls';
import { Dialog } from '../ui/Dialog';

/** Duas metades: marca com camuflagem / formulário. Sem cadastro público. */
export function LoginScreen({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, null);
  const [forgot, setForgot] = useState(false);
  // onSubmit (e não <form action>) para o e-mail digitado não sumir depois de um erro
  const [, startTransition] = useTransition();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  };
  const failed = !!state && !state.ok;

  return (
    <Page>
      <Brand>
        <CamoBackdrop tone="forest" id="login" />
        <Content>
          <Logo variant="full" tone="white" height={120} />
          <Quote>Aqui você cuida do site da Turma: textos, fotos, restaurantes e equipe.</Quote>
          <Note>
            Acesso restrito à equipe. Sem cadastro público — novos acessos são criados pela
            Administração.
          </Note>
        </Content>
      </Brand>

      <Side>
        <Form onSubmit={onSubmit} noValidate>
          <div>
            <h1 className="h2" style={{ margin: 0 }}>
              Entrar no painel
            </h1>
            <p style={{ margin: 'var(--space-2) 0 0', color: 'var(--ink-muted)' }}>
              Use o e-mail e a senha que a Administração enviou para você.
            </p>
          </div>

          {failed ? (
            <Alert tone="err" role="alert" title="E-mail ou senha incorretos.">
              Confira os dois e tente de novo. Depois de 5 tentativas, o acesso fica bloqueado por
              15 minutos.
            </Alert>
          ) : null}

          {next ? <input type="hidden" name="next" value={next} /> : null}
          <TextField
            label="E-mail"
            name="email"
            type="email"
            autoComplete="username"
            required
            autoFocus
          />
          <TextField
            label="Senha"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />

          <Row>
            <Check>
              <input type="checkbox" name="remember" />
              Manter conectado(a)
            </Check>
            <LinkButton type="button" onClick={() => setForgot(true)}>
              Esqueci minha senha
            </LinkButton>
          </Row>

          <Button type="submit" size="lg" fullWidth disabled={pending}>
            {pending ? 'Entrando…' : 'Entrar'}
          </Button>
        </Form>
      </Side>

      <Dialog
        open={forgot}
        onClose={() => setForgot(false)}
        title="Esqueceu a senha?"
        footer={<Button onClick={() => setForgot(false)}>Entendi</Button>}
      >
        <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
          Por enquanto a senha não é recuperada por e-mail. Peça para alguém da{' '}
          <strong>Administração</strong> redefinir o seu acesso na tela Usuários.
        </p>
        <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
          Ela vai gerar uma senha temporária, que aparece só uma vez. No próximo acesso você cria a
          sua própria senha.
        </p>
      </Dialog>
    </Page>
  );
}

const Page = styled.div`
  display: flex;
  flex-wrap: wrap;
  min-height: 100vh;
  background: var(--surface);
  color: var(--ink);
  font-family: var(--font-body);
`;
const Brand = styled.div`
  position: relative;
  flex: 1 1 560px;
  min-height: 100vh;
  overflow: hidden;
  background: var(--surface-forest);
  color: var(--ink-on-forest);
  display: flex;

  ${media.down('bp-md')} {
    min-height: 0;
  }
`;
const Content = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-6);
  padding: var(--space-8);
  width: 100%;

  img {
    width: 300px;
    height: auto;
  }
  ${media.down('bp-md')} {
    padding: var(--space-6) var(--space-5);
    gap: var(--space-4);
    img {
      width: 200px;
    }
  }
`;
const Quote = styled.p`
  margin: 0;
  max-width: 18em;
  font: 700 36px/42px var(--font-display);
  color: var(--ink-on-forest);
  font-variation-settings:
    'opsz' 36,
    'SOFT' 100;
  ${media.down('bp-md')} {
    font-size: 24px;
    line-height: 30px;
  }
`;
const Note = styled.p`
  margin: 0;
  font: 600 14px/20px var(--font-body);
  color: var(--ink-on-forest-muted);
`;
const Side = styled.div`
  flex: 1 1 480px;
  display: grid;
  place-items: center;
  padding: var(--space-8) var(--space-6);
  ${media.down('bp-md')} {
    padding: var(--space-6) var(--space-4) var(--space-7);
    place-items: start stretch;
  }
`;
const Form = styled.form`
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
`;
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
`;
const Check = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: var(--tap-min);
  font: 700 15px/20px var(--font-body);
  color: var(--ink);
  cursor: pointer;

  input {
    width: 22px;
    height: 22px;
    margin: 0;
    accent-color: var(--brand);
  }
`;
const LinkButton = styled.button`
  display: inline-flex;
  align-items: center;
  min-height: var(--tap-min);
  padding: 0;
  border: 0;
  background: none;
  color: var(--brand);
  font: 800 15px/20px var(--font-body);
  text-decoration: underline;
  text-underline-offset: 3px;
  border-radius: 6px;
  cursor: pointer;
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
`;
