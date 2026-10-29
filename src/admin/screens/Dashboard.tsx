'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { media } from '@/design-system/media';
import type { AnyIconName } from '@/components/atoms/Icon';
import { can, type Role } from '@/lib/permissions';
import { ENTITY_AREA, timeAgo } from '@/lib/time';
import { Alert } from '../ui/controls';
import { CardMeta, CardRow, DataList } from '../ui/DataList';
import { Box, BoxHead, BoxTitle, Cols, PageTop, Stack } from '../ui/layout';

export interface DashboardData {
  firstName: string;
  role: Role;
  pages: number;
  lastPublishAt: string | null;
  restaurantsActive: number;
  regions: number;
  activitiesPublished: number;
  categories: number;
  pending: { text: string; href: string }[];
  recent: {
    id: string;
    summary: string;
    entity: string;
    who: string;
    at: string;
    published: boolean;
  }[];
}

export function Dashboard({ data }: { data: DashboardData }) {
  const pendingN = data.pending.length;

  return (
    <Stack>
      <PageTop
        crumb={`Olá, ${data.firstName}`}
        title="Painel"
        actions={
          <Button
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            iconRight="external"
          >
            Ver o site
          </Button>
        }
      />

      {pendingN > 0 ? (
        <Alert tone="warn" title={`${pendingN} ${pendingN === 1 ? 'item' : 'itens'} para conferir`}>
          <PendingList>
            {data.pending.map((p) => (
              <li key={p.text}>
                <Link href={p.href}>{p.text}</Link>
              </li>
            ))}
          </PendingList>
        </Alert>
      ) : null}

      <Cols $n={4}>
        <Kpi
          icon="flag"
          n={data.pages}
          label="Páginas no ar"
          desc={
            data.lastPublishAt
              ? `Última publicação: ${timeAgo(data.lastPublishAt)}`
              : 'Nenhuma publicação ainda'
          }
        />
        <Kpi
          icon="utensils"
          n={data.restaurantsActive}
          label="Restaurantes ativos"
          desc={`Em ${data.regions} ${data.regions === 1 ? 'região' : 'regiões'}`}
        />
        <Kpi
          icon="compass"
          n={data.activitiesPublished}
          label="Atividades na Oficina"
          desc={`${data.categories} ${data.categories === 1 ? 'categoria' : 'categorias'}`}
        />
        <Kpi
          icon="alert"
          n={pendingN}
          label="Itens a conferir"
          desc={pendingN ? 'Veja o aviso acima' : 'Tudo certo por aqui'}
        />
      </Cols>

      <Cols $form>
        <Box $flush>
          <Pad>
            <BoxHead>
              <BoxTitle>Últimas alterações</BoxTitle>
            </BoxHead>
          </Pad>
          {data.recent.length ? (
            <DataList
              caption="Últimas alterações"
              rows={data.recent}
              rowKey={(r) => r.id}
              columns={[
                { key: 'what', header: 'O que mudou', render: (r) => <strong>{r.summary}</strong> },
                { key: 'when', header: 'Quando', render: (r) => timeAgo(r.at) },
                { key: 'where', header: 'Onde', render: (r) => ENTITY_AREA[r.entity] ?? r.entity },
                { key: 'who', header: 'Quem', render: (r) => r.who },
                {
                  key: 'state',
                  header: 'Situação',
                  render: (r) => (
                    <Muted>
                      <Icon name={r.published ? 'check' : 'edit'} size={14} />
                      {r.published ? 'Publicado' : 'Não publicado'}
                    </Muted>
                  ),
                },
              ]}
              card={(r) => (
                <>
                  <strong>{r.summary}</strong>
                  <CardMeta>
                    <span>
                      {ENTITY_AREA[r.entity] ?? r.entity} · {r.who}
                    </span>
                    <CardRow>
                      <span>{timeAgo(r.at)}</span>
                      <Muted>{r.published ? 'Publicado' : 'Não publicado'}</Muted>
                    </CardRow>
                  </CardMeta>
                </>
              )}
            />
          ) : (
            <Pad>
              <Muted>Ainda não há alterações registradas.</Muted>
            </Pad>
          )}
        </Box>

        <Box>
          <BoxTitle>Atalhos</BoxTitle>
          <Shortcuts>
            <Shortcut href="/admin/fotos" icon="image" label="Enviar fotos para a biblioteca" />
            {can(data.role, 'restaurants') ? (
              <Shortcut href="/admin/restaurantes/novo" icon="plus" label="Adicionar restaurante" />
            ) : null}
            {can(data.role, 'activities') ? (
              <Shortcut href="/admin/atividades/novo" icon="plus" label="Adicionar atividade" />
            ) : null}
            {can(data.role, 'contact') ? (
              <Shortcut href="/admin/contato" icon="whatsapp" label="Trocar número do WhatsApp" />
            ) : null}
          </Shortcuts>
        </Box>
      </Cols>
    </Stack>
  );
}

function Kpi({
  icon,
  n,
  label,
  desc,
}: {
  icon: AnyIconName;
  n: number;
  label: string;
  desc: string;
}) {
  return (
    <Box>
      <KpiIcon aria-hidden>
        <Icon name={icon} size={22} />
      </KpiIcon>
      <KpiN>{n}</KpiN>
      <KpiL>{label}</KpiL>
      <KpiD>{desc}</KpiD>
    </Box>
  );
}

function Shortcut({ href, icon, label }: { href: string; icon: AnyIconName; label: string }) {
  return (
    <li>
      <ShortLink href={href}>
        <Icon name={icon} size={20} />
        {label}
        <Icon name="arrow-right" size={18} />
      </ShortLink>
    </li>
  );
}

const Pad = styled.div`
  padding: var(--space-5);
`;
const PendingList = styled.ul`
  margin: var(--space-1) 0 0;
  padding-left: var(--space-5);
  color: var(--ink);

  a {
    color: var(--ink);
    font-weight: 600;
  }
`;
const KpiIcon = styled.span`
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px 12px 12px 4px;
  background: var(--brand-soft);
  color: var(--brand);
`;
const KpiN = styled.p`
  margin: 0;
  font: 800 40px/44px var(--font-display);
  color: var(--ink);
  font-variation-settings:
    'opsz' 36,
    'SOFT' 100;
`;
const KpiL = styled.p`
  margin: 0;
  font: 800 15px/20px var(--font-body);
  color: var(--ink);
`;
const KpiD = styled.p`
  margin: 0;
  font: 600 13px/18px var(--font-body);
  color: var(--ink-muted);
`;
const Muted = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ink-muted);
  font: 600 14px/20px var(--font-body);
`;
const Shortcuts = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;
const ShortLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: var(--tap-min);
  padding: 0 var(--space-3);
  border-radius: var(--radius-md);
  background: var(--surface-sunken);
  color: var(--ink);
  font: 700 15px/20px var(--font-body);
  text-decoration: none;

  svg:first-child {
    color: var(--brand);
  }
  svg:last-child {
    margin-left: auto;
    color: var(--ink-muted);
  }
  &:hover {
    background: var(--brand-soft);
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }
  ${media.reducedMotion} {
    transition: none;
  }
`;
