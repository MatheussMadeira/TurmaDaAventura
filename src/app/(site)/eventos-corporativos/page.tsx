import type { Metadata } from 'next';
import { Reveal } from '@/motion/Reveal';
import { Panel } from '@/components/atoms/Panel';
import { CTABanner } from '@/components/organisms/CTABanner';
import { Hero } from '@/components/organisms/Hero';
import { QuoteForm } from '@/components/organisms/QuoteForm';
import { Trail } from '@/components/organisms/Trail';
import { BenefitPanel } from '@/components/molecules/BenefitPanel';
import { LogoStrip } from '@/components/molecules/LogoStrip';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { ServiceCard } from '@/components/molecules/ServiceCard';
import { Grid, Section, Split } from '@/components/templates';
import { pageMetadata } from '@/lib/seo';

const DESCRIPTION =
  'Os pais participam do evento enquanto as crianças ficam com monitores treinados, em atividades por faixa etária. Montagem, operação e desmontagem por nossa conta.';

export const metadata: Metadata = pageMetadata({
  title: 'Eventos corporativos',
  description: DESCRIPTION,
  path: '/eventos-corporativos',
});

export default function EventosCorporativosPage() {
  return (
    <>
      <Hero
        variant="forest"
        overline="Eventos corporativos"
        title="Espaço kids para o seu evento"
        lead={DESCRIPTION}
        imageAlt="Espaço kids montado num salão de eventos, com crianças em atividade de pintura"
        ctaLabel="Pedir proposta no WhatsApp"
        secondary={{ label: 'Ver formatos', href: '#formatos' }}
        highlights={[
          'Monitores treinados',
          'Seguro para cada criança',
          'Montagem e desmontagem inclusas',
        ]}
      />

      <Section name="EventosCorporativos/Formatos" id="formatos">
        <Reveal>
          <SectionHeader
            overline="Formatos"
            title="Para cada tipo de encontro"
            description="Do almoço de fim de ano à convenção de três dias: a estrutura acompanha o tamanho do evento."
          />
        </Reveal>
        <Grid cols={4}>
          <ServiceCard
            icon="star"
            title="Confraternização de fim de ano"
            description="Espaço kids durante a festa, com atividades para todas as idades e horário estendido."
          />
          <ServiceCard
            icon="heart"
            tone="earth"
            title="Dia da Família"
            description="Gincanas, oficinas e circuitos que aproximam as famílias da empresa."
          />
          <ServiceCard
            icon="briefcase"
            title="Convenções e feiras"
            description="Espaço kids em estandes e congressos, com controle de entrada e saída."
          />
          <ServiceCard
            icon="calendar"
            tone="earth"
            title="Férias na empresa"
            description="Programação para os filhos de colaboradores durante as férias escolares."
          />
        </Grid>
      </Section>

      <Section name="EventosCorporativos/EmpresasAtendidas" tone="sunken" compact>
        <p
          className="overline"
          style={{ margin: 0, color: 'var(--earth-strong)', textAlign: 'center' }}
        >
          Empresas que já levaram a Turma
        </p>
        <LogoStrip count={6} />
        <p
          className="caption"
          style={{ margin: 0, color: 'var(--ink-muted)', textAlign: 'center' }}
        >
          Logos exibidos com autorização de cada empresa.
        </p>
      </Section>

      <Section name="EventosCorporativos/ComoFunciona">
        <Reveal>
          <SectionHeader overline="Como funciona" title="Do briefing à operação em quatro etapas" />
        </Reveal>
        <Panel tone="sunken" shadow="none" padding="md">
          <Trail
            steps={[
              {
                icon: 'whatsapp',
                title: 'Briefing',
                text: 'Data, local, público e número estimado de crianças.',
              },
              {
                icon: 'mail',
                title: 'Proposta',
                text: 'Formato, equipe e cronograma em PDF para aprovação.',
              },
              {
                icon: 'tent',
                title: 'Montagem',
                text: 'Chegamos antes e entregamos o espaço pronto.',
              },
              {
                icon: 'shield',
                title: 'Operação',
                text: 'Check-in, atividades e entrega segura para os pais.',
              },
            ]}
          />
        </Panel>
      </Section>

      <Section name="EventosCorporativos/Beneficios" tone="earth">
        <Reveal>
          <SectionHeader overline="Benefícios" title="Bom para o RH, tranquilo para os pais" />
        </Reveal>
        <Grid cols={2}>
          <BenefitPanel
            title="Para o RH"
            icon="briefcase"
            tone="brand"
            items={[
              'Mais adesão: colaboradores com filhos conseguem participar do evento.',
              'Um único fornecedor para montagem, equipe, materiais e seguro.',
              'Proposta formal, contrato e nota fiscal para o seu processo de compras.',
              'Relatório pós-evento com número de crianças atendidas.',
            ]}
          />
          <BenefitPanel
            title="Para os pais"
            icon="users"
            tone="earth"
            items={[
              'Check-in com pulseira de identificação e retirada só pelo responsável.',
              'Monitores treinados em primeiros socorros, com proporção por idade.',
              'Atividades separadas por faixa etária, dos 3 aos 12 anos.',
              'Espaço à vista, perto do evento — sem perder o filho de vista.',
            ]}
          />
        </Grid>
      </Section>

      <Section name="EventosCorporativos/PreOrcamento">
        <Split ratio="5-7" align="start">
          <Reveal>
            <SectionHeader
              overline="Proposta"
              title="Conte sobre o seu evento"
              description="Com data, local e número estimado de crianças, a gente devolve uma proposta sob medida."
            />
            <p
              className="body-sm"
              style={{ margin: 'var(--space-5) 0 0', color: 'var(--ink-muted)' }}
            >
              Prefere e-mail? Peça no WhatsApp e enviamos a proposta em PDF para o seu time de
              compras.
            </p>
          </Reveal>
          <QuoteForm
            title="Pedir proposta"
            nameLabel="Seu nome e empresa"
            defaultType="Evento corporativo"
          />
        </Split>
      </Section>

      <Section name="EventosCorporativos/CTA" tight>
        <CTABanner
          title="Seu próximo evento com espaço kids"
          text="Fale com a gente e receba uma proposta para o seu formato e o seu público."
          ctaLabel="Pedir proposta no WhatsApp"
        />
      </Section>
    </>
  );
}
