'use client';

import styled from 'styled-components';
import { Icon, type IconName } from '../../atoms/Icon';
import { Panel } from '../../atoms/Panel';
import { CheckList } from '../CheckList';

export interface BenefitPanelProps {
  title: string;
  icon: IconName;
  tone?: 'brand' | 'earth';
  items: string[];
  className?: string;
}

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-4);

  h3 {
    margin: 0;
  }
`;

const Seal = styled.span<{ $tone: 'brand' | 'earth' }>`
  flex: none;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 16px 16px 16px 4px;
  background: ${({ $tone }) => ($tone === 'earth' ? 'var(--earth-soft)' : 'var(--brand-soft)')};
  color: ${({ $tone }) => ($tone === 'earth' ? 'var(--earth-strong)' : 'var(--brand)')};
`;

/** Painel de benefícios com selo, título e lista de checks (Eventos corporativos: "Para o RH" / "Para os pais"). */
export function BenefitPanel({ title, icon, tone = 'brand', items, className }: BenefitPanelProps) {
  return (
    <Panel shadow="sm" padding="md" className={className}>
      <Inner>
        <Head>
          <Seal $tone={tone}>
            <Icon name={icon} size={24} />
          </Seal>
          <h3 className="h3">{title}</h3>
        </Head>
        <CheckList variant="text" items={items} />
      </Inner>
    </Panel>
  );
}
