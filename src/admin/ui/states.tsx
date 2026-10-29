'use client';

import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { Logo } from '@/components/atoms/Logo';
import { Box } from './layout';

/* Estados do painel: vazio, sem permissão e banco desatualizado. Nunca página de erro crua. */

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Center>
      <Logo variant="symbol" tone="auto" height={88} />
      <h2 className="h3">{title}</h2>
      {children ? <p>{children}</p> : null}
      {action}
    </Center>
  );
}

export function NoPermission() {
  return (
    <Box>
      <Center role="alert">
        <Logo variant="symbol" tone="auto" height={88} />
        <h2 className="h3">Esta área é só da Administração</h2>
        <p>
          Se você precisa criar um acesso ou trocar o WhatsApp do site, peça para alguém da
          Administração.
        </p>
        <Button href="/admin">Voltar ao painel</Button>
      </Center>
    </Box>
  );
}

export function SchemaOutdated() {
  return (
    <Box>
      <Center role="alert">
        <Logo variant="symbol" tone="auto" height={88} />
        <h2 className="h3">O banco precisa ser atualizado</h2>
        <p>
          O site continua no ar normalmente. Para voltar a editar, é preciso aplicar uma atualização
          do banco — leva menos de um minuto.
        </p>
        <Instruction>
          <span>Quem cuida do site roda, no projeto:</span>
          <code>npm run db:deploy</code>
        </Instruction>
        <Button href="/admin" variant="outline">
          Tentar de novo
        </Button>
      </Center>
    </Box>
  );
}

const Center = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
  padding: var(--space-8) var(--space-5);

  h2 {
    margin: 0;
    font-family: var(--font-display);
    color: var(--ink);
  }
  p {
    margin: 0;
    max-width: 32em;
    color: var(--ink-muted);
  }
`;
const Instruction = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--surface-sunken);
  color: var(--ink-muted);
  font: 600 14px/20px var(--font-body);

  code {
    color: var(--ink);
    font:
      700 15px/22px ui-monospace,
      SFMono-Regular,
      Menlo,
      Consolas,
      monospace;
  }
`;
