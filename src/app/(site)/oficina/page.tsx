import type { Metadata } from 'next';
import { Reveal } from '@/motion/Reveal';
import { Panel } from '@/components/atoms/Panel';
import { ActivityCatalog } from '@/components/organisms/ActivityCatalog';
import { CTABanner } from '@/components/organisms/CTABanner';
import { Hero } from '@/components/organisms/Hero';
import { QuoteForm } from '@/components/organisms/QuoteForm';
import { Trail } from '@/components/organisms/Trail';
import { CheckList } from '@/components/molecules/CheckList';
import { FeatureList } from '@/components/molecules/FeatureList';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Section, Split } from '@/components/templates';
import { getActivities, getActivityCategories } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Oficina',
  description:
    'Brincadeiras, oficinas manuais, gincanas e atividades de natureza. A gente leva os materiais, monta no seu espaço e adapta tudo à idade da turma.',
  path: '/oficina',
});

export default function OficinaPage() {
  return (
    <>
      <Hero
        overline="Oficina"
        title="Mão na massa, pé na grama"
        lead="Brincadeiras, oficinas manuais, gincanas e atividades de natureza. A gente leva os materiais, monta no seu espaço e adapta tudo à idade da turma."
        imageAlt="Crianças sentadas no chão do pátio montando pipas com papel de seda e varetas"
        secondary={{ label: 'Ver atividades', href: '#catalogo' }}
        highlights={[
          'Materiais seguros e naturais',
          'Atividades de 45 a 90 min',
          'Para grupos de 8 a 40 crianças',
        ]}
      />

      <Section name="Oficina/Catalogo" id="catalogo" tone="sunken">
        <Reveal>
          <SectionHeader
            overline="Catálogo de atividades"
            title="Escolha o roteiro da expedição"
            description="Misture atividades à vontade: a gente monta a sequência certa para o tempo e o espaço que você tem."
          />
        </Reveal>
        <ActivityCatalog categories={getActivityCategories()} activities={getActivities()} />
      </Section>

      <Section name="Oficina/ComoMontamos">
        <Reveal>
          <SectionHeader overline="Passo a passo" title="Como montamos uma oficina" />
        </Reveal>
        <Panel tone="sunken" shadow="none" padding="md">
          <Trail
            steps={[
              {
                icon: 'whatsapp',
                title: 'Chama no WhatsApp',
                text: 'Conta a data, o espaço e quantas crianças vêm.',
              },
              {
                icon: 'compass',
                title: 'Escolhemos o roteiro',
                text: 'Montamos a sequência de atividades por idade e tempo.',
              },
              {
                icon: 'backpack',
                title: 'Preparamos os materiais',
                text: 'Separamos tudo e conferimos o espaço antes do dia.',
              },
              {
                icon: 'tent',
                title: 'Oficina no seu espaço',
                text: 'Chegamos antes, conduzimos e deixamos tudo limpo.',
              },
            ]}
          />
        </Panel>
      </Section>

      <Section name="Oficina/SegurancaMateriais" tone="earth">
        <Reveal>
          <SectionHeader
            overline="Segurança e materiais"
            title="Tudo pensado antes da primeira tesoura"
            description="Pais e escolas perguntam — e a gente gosta de mostrar."
          />
        </Reveal>
        <FeatureList
          items={[
            {
              icon: 'shield',
              tone: 'brand',
              title: 'Materiais atóxicos',
              text: 'Tintas naturais, colas à base d’água e tesouras sem ponta para os menores.',
            },
            {
              icon: 'leaf',
              tone: 'olive',
              title: 'Natureza e reaproveitamento',
              text: 'Sementes, folhas, papel reciclado e sucata limpa viram brinquedo.',
            },
            {
              icon: 'users',
              tone: 'earth',
              title: 'Grupos por faixa etária',
              text: 'Atividades separadas por idade, com um monitor para cada grupo pequeno.',
            },
            {
              icon: 'heart',
              tone: 'brand',
              title: 'Primeiros socorros',
              text: 'Equipe treinada e kit de primeiros socorros em toda oficina.',
            },
            {
              icon: 'backpack',
              tone: 'olive',
              title: 'A gente leva tudo',
              text: 'Materiais, forros, mesas baixas e o que mais a atividade pedir.',
            },
            {
              icon: 'check',
              tone: 'earth',
              title: 'Espaço conferido',
              text: 'Antes de começar, checamos o local, as saídas e os pontos de atenção.',
            },
          ]}
        />
      </Section>

      <Section name="Oficina/PreOrcamento">
        <Split ratio="5-7" align="start">
          <Reveal>
            <SectionHeader
              overline="Pré-orçamento"
              title="Monte a sua oficina"
              description="Conta o básico e a conversa já abre no WhatsApp com tudo preenchido."
            />
            <div style={{ marginTop: 'var(--space-5)' }}>
              <CheckList
                items={[
                  'Só nome e tipo são obrigatórios',
                  'Resposta em horário comercial',
                  'Cada oficina é montada sob medida',
                ]}
              />
            </div>
          </Reveal>
          <QuoteForm defaultType="Oficina" />
        </Split>
      </Section>

      <Section name="Oficina/CTA" tight>
        <CTABanner
          title="Bora colocar a mão na massa?"
          text="Escolha as atividades ou deixe com a gente. Respondemos rapidinho no WhatsApp."
          ctaLabel="Chamar no WhatsApp"
        />
      </Section>
    </>
  );
}
