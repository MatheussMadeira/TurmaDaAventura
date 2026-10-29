import type { Metadata } from 'next';
import { Reveal } from '@/motion/Reveal';
import { Gallery } from '@/components/organisms/Gallery';
import { CTABanner } from '@/components/organisms/CTABanner';
import { Hero } from '@/components/organisms/Hero';
import { Trail } from '@/components/organisms/Trail';
import { RestaurantCard } from '@/components/molecules/RestaurantCard';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { ServiceCard } from '@/components/molecules/ServiceCard';
import { TextLink } from '@/components/molecules/TextLink';
import { ValuePillar } from '@/components/molecules/ValuePillar';
import { Grid, Section } from '@/components/templates';
import { getHomeRestaurants } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Início',
  absoluteTitle: 'Turma da Aventura · Recreação infantil',
  description:
    'A gente leva brincadeiras, oficinas e gincanas para restaurantes, empresas e eventos. Monitores treinados, atividades por idade e muita natureza.',
  path: '/',
});

const STEPS = [
  {
    icon: 'whatsapp',
    title: 'Chama no WhatsApp',
    text: 'Conta o tipo de evento, a data e quantas crianças. Respondemos em horário comercial.',
  },
  {
    icon: 'compass',
    title: 'Montamos a expedição',
    text: 'Atividades, materiais e equipe sob medida para o seu espaço e para a idade da turma.',
  },
  {
    icon: 'tent',
    title: 'A aventura começa',
    text: 'Chegamos antes, montamos tudo e cuidamos das crianças do começo ao fim.',
  },
] as const;

const GALLERY = [
  { alt: 'Crianças de costas empinando pipas num gramado', icon: 'flag' },
  { alt: 'Mãos pintando papel com tinta de urucum', icon: 'palette' },
  { alt: 'Grupo de crianças montando cabana com galhos', icon: 'tent' },
  { alt: 'Monitora mostrando um mapa do tesouro para o grupo', icon: 'compass' },
  { alt: 'Crianças plantando mudas na mini horta', icon: 'leaf' },
  { alt: 'Circuito de aventura com cordas entre árvores', icon: 'tree' },
] as const;

export default function HomePage() {
  const restaurants = getHomeRestaurants();

  return (
    <>
      {/* Inicio/Hero — o h1 da página */}
      <Hero
        overline="Recreação infantil"
        title="Bora pra aventura?"
        lead="A gente leva brincadeiras, oficinas e gincanas para restaurantes, empresas e eventos. Monitores treinados, atividades por idade e muita natureza — você só curte."
        imageAlt="Crianças de costas correndo num gramado ao fim da tarde, com monitores por perto"
        secondary={{ label: 'Conhecer a Oficina', href: '/oficina' }}
        highlights={[
          'Monitores treinados',
          'Atividades por faixa etária',
          'Montamos tudo no local',
        ]}
      />

      <Section name="Inicio/TresJeitos" tone="sunken">
        <Reveal>
          <SectionHeader
            overline="Onde a Turma aparece"
            title="Três jeitos de viver a aventura"
            description="Escolha o seu ponto de partida. Em todos eles, quem cuida das crianças é a nossa equipe."
          />
        </Reveal>
        <Grid cols={3}>
          <ServiceCard
            icon="utensils"
            overline="Para famílias"
            title="Restaurantes"
            description="Recreação fixa nos fins de semana. As crianças brincam por perto e você come com calma."
            href="/restaurantes"
            linkLabel="Ver restaurantes"
          />
          <ServiceCard
            icon="briefcase"
            tone="earth"
            overline="Para empresas"
            title="Eventos corporativos"
            description="Espaço kids em confraternizações, Dia da Família, convenções e férias na empresa."
            href="/eventos-corporativos"
            linkLabel="Ver eventos corporativos"
          />
          <ServiceCard
            icon="scissors"
            overline="Para todos"
            title="Oficina"
            description="Pipas, mini horta, tintas naturais e gincanas. Atividades manuais e de natureza."
            href="/oficina"
            linkLabel="Conhecer a Oficina"
          />
        </Grid>
      </Section>

      <Section name="Inicio/Pilares">
        <Reveal>
          <SectionHeader
            align="center"
            overline="Nosso jeito"
            title="Brincar / Aprender / Ensinar"
          />
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

      <Section name="Inicio/ComoFunciona" tone="sunken">
        <Reveal>
          <SectionHeader overline="Como funciona" title="Do “oi” à aventura em três etapas" />
        </Reveal>
        <Trail steps={[...STEPS]} />
      </Section>

      <Section name="Inicio/OndeEsta">
        <Reveal>
          <SectionHeader
            overline="Fim de semana com a Turma"
            title="Onde a Turma está"
            description="Restaurantes parceiros com recreação fixa. Chegue, peça seu prato e deixe a aventura com a gente."
          />
        </Reveal>
        <Grid cols={3}>
          {restaurants.map((r) => (
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
              placeholderId={`home-${r.slug}`}
            />
          ))}
        </Grid>
        <div>
          <TextLink href="/restaurantes">Ver todos os restaurantes</TextLink>
        </div>
      </Section>

      <Section name="Inicio/Galeria" tone="sunken">
        <Reveal>
          <SectionHeader overline="Diário de expedição" title="Um pouco do que rola por aqui" />
        </Reveal>
        <Gallery images={[...GALLERY]} />
      </Section>

      <Section name="Inicio/CTA">
        <CTABanner
          title="Bora planejar a próxima aventura?"
          text="Conta pra gente o que você imagina. A gente monta a proposta e responde rapidinho."
          ctaLabel="Pedir orçamento no WhatsApp"
        />
      </Section>
    </>
  );
}
