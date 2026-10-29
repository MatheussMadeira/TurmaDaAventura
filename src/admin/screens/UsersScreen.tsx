'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { TextField } from '@/components/atoms/TextField';
import {
  changeRoleAction,
  createUserAction,
  resetPasswordAction,
  setActiveAction,
  type TempPasswordData,
} from '@/app/admin/_actions/users';
import { ROLE_HELP, ROLE_LABEL, type Role } from '@/lib/permissions';
import { timeAgo } from '@/lib/time';
import { Alert, IconButton, StatusBadge } from '../ui/controls';
import { CardMeta, CardRow, CellMain, DataList, RowActions } from '../ui/DataList';
import { Dialog } from '../ui/Dialog';
import { ErrorSummary, fieldError, useAction } from '../ui/forms';
import { Box, BoxSub, BoxTitle, Cols, PageTop, Stack } from '../ui/layout';
import { useToast } from '../ui/Toast';

export interface UserListRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  locked: boolean;
  lastLoginAt: string | null;
}

const initials = (n: string) =>
  n
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export function UsersScreen({ users, meId }: { users: UserListRow[]; meId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { run, pending, result: actionResult } = useAction<TempPasswordData>();
  const create = useAction<TempPasswordData>();
  const [secret, setSecret] = useState<TempPasswordData | null>(null);
  const [confirm, setConfirm] = useState<{
    kind: 'reset' | 'deactivate' | 'activate';
    user: UserListRow;
  } | null>(null);
  const [role, setRole] = useState<Role>('EQUIPE');

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set('role', role);
    const r = await create.run(() => createUserAction(null, fd), { toast: false });
    if (r.ok && r.data) {
      setSecret(r.data); // mostrada UMA vez; não fica guardada em lugar nenhum
      form.reset();
      router.refresh();
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.show({ message: 'Senha copiada.' });
    } catch {
      toast.show({ message: 'Não foi possível copiar. Selecione e copie à mão.' });
    }
  };

  const onRole = async (u: UserListRow, next: Role) => {
    const r = await run(() => changeRoleAction(u.id, next));
    router.refresh();
    return r;
  };

  const status = (u: UserListRow) => (!u.active ? 'DESATIVADO' : u.locked ? 'BLOQUEADO' : 'ATIVO');

  const actions = (u: UserListRow) => {
    const me = u.id === meId;
    return (
      <RowActions>
        <RoleSelect
          aria-label={`Papel de ${u.name}`}
          value={u.role}
          disabled={me || pending}
          onChange={(e) => onRole(u, e.target.value as Role)}
        >
          <option value="EQUIPE">{ROLE_LABEL.EQUIPE}</option>
          <option value="ADMIN">{ROLE_LABEL.ADMIN}</option>
        </RoleSelect>
        <IconButton
          icon="lock"
          label={`Redefinir a senha de ${u.name}`}
          disabled={pending}
          onClick={() => setConfirm({ kind: 'reset', user: u })}
        />
        <IconButton
          icon={u.active ? 'pause' : 'eye'}
          label={u.active ? `Desativar o acesso de ${u.name}` : `Reativar o acesso de ${u.name}`}
          disabled={pending || (me && u.active)}
          onClick={() => setConfirm({ kind: u.active ? 'deactivate' : 'activate', user: u })}
        />
      </RowActions>
    );
  };

  const person = (u: UserListRow) => (
    <CellMain>
      <Avatar aria-hidden>{initials(u.name)}</Avatar>
      <div>
        <strong>
          {u.name}
          {u.id === meId ? <You> (você)</You> : null}
        </strong>
        <span>{u.email}</span>
      </div>
    </CellMain>
  );

  return (
    <Stack>
      <PageTop crumb="Administração · só quem é Administração vê esta área" title="Usuários" />

      {secret ? (
        <Alert tone="ok" title="Esta é a senha temporária:">
          <Secret>
            <code>{secret.tempPassword}</code>
            <Button
              size="sm"
              variant="outline"
              iconLeft="copy"
              onClick={() => copy(secret.tempPassword)}
            >
              Copiar senha
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSecret(null)}>
              Já anotei
            </Button>
          </Secret>
          <span>
            Para {secret.name} ({secret.email}). Ela aparece só desta vez. Envie por um canal seguro
            — no primeiro acesso, a pessoa cria a própria senha.
          </span>
        </Alert>
      ) : null}
      <ErrorSummary result={actionResult && !actionResult.ok ? actionResult : null} />

      <Cols $form>
        <Box $flush>
          <DataList
            caption="Pessoas com acesso ao painel"
            rows={users}
            rowKey={(u) => u.id}
            columns={[
              { key: 'who', header: 'Pessoa', render: person },
              { key: 'role', header: 'Papel', render: (u) => ROLE_LABEL[u.role] },
              {
                key: 'last',
                header: 'Último acesso',
                render: (u) => (u.lastLoginAt ? timeAgo(u.lastLoginAt) : 'Nunca entrou'),
              },
              { key: 'st', header: 'Situação', render: (u) => <StatusBadge status={status(u)} /> },
              {
                key: 'actions',
                header: 'Ações',
                srOnlyHeader: true,
                align: 'right',
                render: actions,
              },
            ]}
            card={(u) => (
              <>
                {person(u)}
                <CardMeta>
                  <span>
                    {ROLE_LABEL[u.role]} · Último acesso:{' '}
                    {u.lastLoginAt ? timeAgo(u.lastLoginAt) : 'nunca'}
                  </span>
                </CardMeta>
                <CardRow>
                  <StatusBadge status={status(u)} />
                  {actions(u)}
                </CardRow>
              </>
            )}
          />
          <Footnote>
            Sempre existe pelo menos uma conta de Administração ativa — por isso a sua não pode ser
            desativada nem rebaixada.
          </Footnote>
        </Box>

        <Box>
          <BoxTitle>Novo usuário</BoxTitle>
          <BoxSub>Sem cadastro público: só a Administração cria acessos.</BoxSub>
          <ErrorSummary result={create.result} />
          <Form onSubmit={onCreate} noValidate>
            <TextField
              label="Nome"
              name="name"
              required
              error={fieldError(create.result, 'name')}
            />
            <TextField
              label="E-mail"
              name="email"
              type="email"
              required
              error={fieldError(create.result, 'email')}
            />
            <Roles role="radiogroup" aria-label="Papel">
              <legend>Papel</legend>
              {(['EQUIPE', 'ADMIN'] as const).map((r) => (
                <label key={r}>
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={role === r}
                    onChange={() => setRole(r)}
                  />
                  <span>
                    <strong>{ROLE_LABEL[r]}</strong>
                    <small>{ROLE_HELP[r]}</small>
                  </span>
                </label>
              ))}
            </Roles>
            <Button type="submit" disabled={create.pending} iconLeft="plus">
              {create.pending ? 'Criando…' : 'Criar usuário'}
            </Button>
          </Form>
        </Box>
      </Cols>

      <Dialog
        open={!!confirm}
        alert
        onClose={() => setConfirm(null)}
        title={
          confirm?.kind === 'reset'
            ? 'Redefinir a senha?'
            : confirm?.kind === 'deactivate'
              ? 'Desativar este acesso?'
              : 'Reativar este acesso?'
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Cancelar
            </Button>
            <Button
              disabled={pending}
              onClick={async () => {
                if (!confirm) return;
                const { kind, user } = confirm;
                if (kind === 'reset') {
                  const r = await run(() => resetPasswordAction(user.id), { toast: false });
                  if (r.ok && r.data) setSecret(r.data);
                } else {
                  await run(() => setActiveAction(user.id, kind === 'activate'));
                }
                setConfirm(null);
                router.refresh();
              }}
            >
              {confirm?.kind === 'reset' ? 'Gerar senha temporária' : 'Confirmar'}
            </Button>
          </>
        }
      >
        {confirm ? (
          <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
            {confirm.kind === 'reset' ? (
              <>
                <strong style={{ color: 'var(--ink)' }}>{confirm.user.name}</strong> vai receber uma
                senha temporária (mostrada só uma vez) e terá de criar uma nova no próximo acesso.
                As sessões abertas dessa pessoa serão encerradas.
              </>
            ) : confirm.kind === 'deactivate' ? (
              <>
                <strong style={{ color: 'var(--ink)' }}>{confirm.user.name}</strong> perde o acesso
                na hora. Dá para reativar depois.
              </>
            ) : (
              <>
                <strong style={{ color: 'var(--ink)' }}>{confirm.user.name}</strong> volta a poder
                entrar (com a senha atual).
              </>
            )}
          </p>
        ) : null}
      </Dialog>
    </Stack>
  );
}

const Avatar = styled.span`
  flex: none;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--brand-soft);
  color: var(--brand);
  font: 800 14px/1 var(--font-body);
`;
const You = styled.span`
  font-weight: 600;
  color: var(--ink-muted);
`;
const Secret = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin: var(--space-2) 0;

  code {
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    background: var(--surface-raised);
    color: var(--ink);
    font:
      800 20px/28px ui-monospace,
      SFMono-Regular,
      Menlo,
      Consolas,
      monospace;
    letter-spacing: 0.06em;
    user-select: all;
  }
`;
const Footnote = styled.p`
  margin: 0;
  padding: var(--space-4);
  border-top: var(--border-thin) solid var(--line);
  font: 600 14px/20px var(--font-body);
  color: var(--ink-muted);
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
`;
const Roles = styled.fieldset`
  margin: 0;
  padding: 0;
  border: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  legend {
    padding: 0;
    margin-bottom: var(--space-1);
    font: 700 15px/20px var(--font-body);
    color: var(--ink);
  }
  label {
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
    padding: var(--space-3);
    border: var(--border-thick) solid var(--line-strong);
    border-radius: var(--radius-md);
    cursor: pointer;
  }
  label:has(input:checked) {
    border-color: var(--brand);
    background: var(--brand-soft);
  }
  input {
    width: 22px;
    height: 22px;
    margin: 2px 0 0;
    accent-color: var(--brand);
  }
  strong {
    display: block;
    font: 800 15px/20px var(--font-body);
  }
  small {
    display: block;
    font: 400 14px/20px var(--font-body);
    color: var(--ink-muted);
  }
`;
const RoleSelect = styled.select`
  min-height: var(--tap-min);
  padding: 0 var(--space-3);
  border: var(--border-thick) solid var(--line-strong);
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
  color: var(--ink);
  font: 700 14px/18px var(--font-body);

  &:disabled {
    opacity: 0.6;
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
`;
