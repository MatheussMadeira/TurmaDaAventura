import type { Metadata } from 'next';
import { Entrance } from '@/motion/Entrance';
import { Reveal } from '@/motion/Reveal';
import { Panel } from '@/components/atoms/Panel';
import { CTABanner } from '@/components/organisms/CTABanner';
import { FeatureList } from '@/components/molecules/FeatureList';
import { RegionAnchors } from '@/components/organisms/RegionAnchors';
import { RegionHeading } from '@/components/molecules/RegionHeading';
import { RestaurantCard } from '@/components/molecules/RestaurantCard';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { StoryMedia } from '@/components/molecules/StoryMedia';
import { WhatsAppButton } from '@/components/molecules/WhatsAppButton';
import { Grid, Section, Split } from '@/components/templates';
import { getRestaurantGroups } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Restaurantes',
  description:
    'Restaurantes parceiros com recreação fixa e monitores treinados. Você escolhe a mesa, as crianças escolhem a aventura — e todo mundo come em paz.',
  path: '/restaurantes',
});

export default function RestaurantesPage() {
  const groups = getRestaurantGroups();

  return (
    <>
      <Section name="Restaurantes/Intro" intro gap="md">
        {/* acima da dobra: Entrance (CSS), não Reveal — ver motion/Entrance.tsx */}
        <Entrance>
          <SectionHeader
            level={1}
            overline="Fim de semana com a Turma"
            title="Onde a Turma está"
            description="Restaurantes parceiros com recreação fixa e monitores treinados. Você escolhe a mesa, as crianças escolhem a aventura — e todo mundo come em paz."
          />
        </Entrance>
        <RegionAnchors
          regions={groups.map((g) => ({ id: g.id, name: g.name, count: g.restaurants.length }))}
        />
      </Section>

      <Section name="Restaurantes/Lista" tone="sunken" gap="lg">
        {groups.map((g) => (
          <div
            key={g.id}
            id={g.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-6)',
              scrollMarginTop: 'var(--space-10)',
            }}
          >
            <RegionHeading name={g.name} count={g.restaurants.length} />
            <Grid cols={3}>
              {g.restaurants.map((r) => (
                <RestaurantCard
                  key={r.slug}
                  name={r.name}
                  neighborhood={r.neighborhood}
                  schedule={r.schedule}
                  address={r.address}
                  ages={r.ages}
                  mapsUrl={r.mapsUrl}
                  image={r.image ?? undefined}
                  imageAlt={r.imageAlt}
                  placeholderId={`rest-${r.slug}`}
                />
              ))}
            </Grid>
          </div>
        ))}
      </Section>

      <Section name="Restaurantes/TemUmRestaurante">
        <Panel tone="earth">
          <Split ratio="7-5" gap="lg">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <Reveal>
                <SectionHeader
                  overline="Para donos de restaurante"
                  title="Tem um restaurante?"
                  description="Leve a Turma para o seu salão. A gente cuida da recreação do começo ao fim — sua equipe só cuida da cozinha."
                />
              </Reveal>
              <FeatureList
                columns={2}
                items={[
                  {
                    icon: 'clock',
                    tone: 'brand',
                    title: 'Famílias ficam mais tempo',
                    text: 'Criança entretida é sobremesa pedida e mesa sem pressa.',
                  },
                  {
                    icon: 'utensils',
                    tone: 'earth',
                    title: 'Pais comem com calma',
                    text: 'Monitores por perto, à vista da mesa, e a refeição volta a ser programa.',
                  },
                  {
                    icon: 'star',
                    tone: 'olive',
                    title: 'Diferencial no fim de semana',
                    text: 'Um motivo a mais para as famílias escolherem o seu endereço.',
                  },
                  {
                    icon: 'backpack',
                    tone: 'brand',
                    title: 'Zero trabalho para a sua equipe',
                    text: 'Levamos materiais, montamos o espaço e organizamos tudo ao final.',
                  },
                ]}
              />
              <div>
                <WhatsAppButton
                  size="lg"
                  message="Olá! Tenho um restaurante e quero recreação para as famílias."
                >
                  Chamar a Turma para o meu restaurante
                </WhatsAppButton>
              </div>
            </div>
            <StoryMedia
              ratio="4 / 5"
              icon="utensils"
              alt="Monitora brincando com crianças ao lado das mesas de um restaurante"
              placeholderId="owner"
            />
          </Split>
        </Panel>
      </Section>

      <Section name="Restaurantes/CTA" tight>
        <CTABanner
          title="Quer a Turma no seu evento também?"
          text="Além dos restaurantes, a gente monta recreação para empresas, escolas e festas."
          ctaLabel="Pedir orçamento no WhatsApp"
          message="Olá! Vim pelo site e quero um orçamento."
        />
      </Section>
    </>
  );
}
