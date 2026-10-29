import type { Metadata } from 'next';
import { Entrance } from '@/motion/Entrance';
import { Reveal } from '@/motion/Reveal';
import { CTABanner } from '@/components/organisms/CTABanner';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Stat } from '@/components/molecules/Stat';
import { StoryMedia } from '@/components/molecules/StoryMedia';
import { TeamCard } from '@/components/molecules/TeamCard';
import { ValuePillar } from '@/components/molecules/ValuePillar';
import { Grid, Section, Split } from '@/components/templates';
import { getTeam } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Quem somos',
  description:
    'Amigos educadores que levam brincadeira de verdade, natureza e um adulto atento para cada grupo pequeno a restaurantes, empresas e escolas.',
  path: '/quem-somos',
});

export default function QuemSomosPage() {
  const team = getTeam();

  return (
    <>
      <Section name="QuemSomos/Historia" intro>
        <Split ratio="6-6" gap="lg">
          {/* acima da dobra: Entrance (CSS), não Reveal — ver motion/Entrance.tsx */}
          <Entrance>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <SectionHeader level={1} overline="Quem somos" title="A turma por trás da aventura" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <p className="lead" style={{ margin: 0, color: 'var(--ink)' }}>
                  A Turma nasceu de um quintal: amigos educadores que levavam as próprias crianças
                  para brincar ao ar livre todo fim de semana — e, de repente, os filhos dos
                  vizinhos também queriam ir.
                </p>
                <p className="body" style={{ margin: 0, color: 'var(--ink-muted)' }}>
                  Hoje somos uma equipe de monitores, pedagogos e arte-educadores que leva essa
                  mesma expedição para restaurantes, empresas e escolas. Mudou o tamanho, não o
                  jeito: brincadeira de verdade, natureza sempre que dá e um adulto atento para cada
                  grupo pequeno.
                </p>
              </div>
              <p className="tagline" style={{ margin: 0, color: 'var(--earth-strong)' }}>
                Brincar / Aprender / Ensinar
              </p>
            </div>
          </Entrance>
          <StoryMedia
            ratio="5 / 4"
            icon="users"
            alt="Equipe de monitores sentada em roda com as crianças no gramado"
            placeholderId="historia"
            paw
          />
        </Split>
      </Section>

      <Section name="QuemSomos/Pilares" tone="sunken">
        <Reveal>
          <SectionHeader align="center" overline="Nosso jeito" title="O que guia cada expedição" />
        </Reveal>
        <Grid cols={3} reveal={false}>
          <ValuePillar
            index={0}
            icon="compass"
            tone="brand"
            number="01"
            title="Brincar"
            text="Brincadeira livre e dirigida, ao ar livre sempre que dá. Criança precisa correr, sujar a mão e rir alto."
          />
          <ValuePillar
            index={1}
            icon="leaf"
            tone="olive"
            number="02"
            title="Aprender"
            text="Cada atividade traz uma descoberta: sobre a natureza, sobre o grupo e sobre si mesmo."
          />
          <ValuePillar
            index={2}
            icon="heart"
            tone="earth"
            number="03"
            title="Ensinar"
            text="As crianças ensinam umas às outras — e a gente aprende junto com elas."
          />
        </Grid>
      </Section>

      <Section name="QuemSomos/Equipe">
        <Reveal>
          <SectionHeader
            overline="Equipe"
            title="Quem cuida da sua turma"
            description="Todos os monitores passam por formação própria, checagem de antecedentes e reciclagem de primeiros socorros todo ano."
          />
        </Reveal>
        <Grid cols={3}>
          {team.map((m) => (
            <TeamCard
              key={m.nickname}
              name={m.name}
              nickname={m.nickname}
              role={m.role}
              bio={m.bio}
              badges={m.badges}
              photo={m.photo ?? undefined}
            />
          ))}
        </Grid>
      </Section>

      <Section name="QuemSomos/Seguranca" tone="earth">
        <Reveal>
          <SectionHeader
            overline="Segurança"
            title="Confiança se constrói com cuidado visível"
            description="Os números que os pais perguntam — e que a gente faz questão de cumprir."
          />
        </Reveal>
        <Grid cols={3}>
          <Stat
            icon="users"
            tone="brand"
            value="1 : 6"
            label="Monitor por criança até 5 anos"
            description="De 6 a 12 anos, um monitor para cada 10 crianças."
          />
          <Stat
            icon="heart"
            tone="earth"
            value="100%"
            label="Da equipe com primeiros socorros"
            description="Certificação renovada todo ano e kit completo em todo evento."
          />
          <Stat
            icon="shield"
            tone="olive"
            value="Seguro"
            label="Para cada criança atendida"
            description="Seguro de acidentes pessoais válido durante toda a atividade."
          />
        </Grid>
      </Section>

      <Section name="QuemSomos/CTA">
        <CTABanner
          title="Bora conversar?"
          text="Conta o que você imagina e a gente responde no WhatsApp, em horário comercial."
          ctaLabel="Chamar no WhatsApp"
        />
      </Section>
    </>
  );
}
