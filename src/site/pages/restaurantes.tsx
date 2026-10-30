import { Entrance } from '@/motion/Entrance';
import { Reveal } from '@/motion/Reveal';
import { Panel } from '@/components/atoms/Panel';
import { CTABanner } from '@/components/organisms/CTABanner';
import { FeatureList } from '@/components/molecules/FeatureList';
import { RestaurantCard } from '@/components/molecules/RestaurantCard';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { StoryMedia } from '@/components/molecules/StoryMedia';
import { WhatsAppButton } from '@/components/molecules/WhatsAppButton';
import { Grid, Section, Split } from '@/components/templates';
import type { Restaurant } from '@/content/types';
import { opt, section, type Renderer } from '../render';

export interface RestaurantesData {
  restaurants: Restaurant[];
}

export const restaurantesRenderers: Record<string, Renderer<RestaurantesData>> = {
  intro: section('intro', (c, ctx, name) => (
    <Section name={name} intro gap="md">
      {/* acima da dobra: Entrance (CSS), não Reveal — ver motion/Entrance.tsx */}
      <Entrance>
        <SectionHeader
          level={1}
          overline={opt(c.overline)}
          title={c.title}
          description={opt(c.description)}
        />
      </Entrance>
    </Section>
  )),

  lista: section('data-backed', (_c, ctx, name) => {
    const list = ctx.data.restaurants;
    return (
      <Section name={name} tone="sunken" gap="lg">
        {list.length ? (
          <>
            <h2 className="h3" style={{ margin: 0 }}>
              {list.length} {list.length === 1 ? 'restaurante' : 'restaurantes'} com a Turma
            </h2>
            <Grid cols={3}>
              {list.map((r) => (
                <RestaurantCard
                  key={r.slug}
                  name={r.name}
                  neighborhood={r.neighborhood}
                  schedule={r.schedule}
                  address={r.address}
                  ages={r.ages}
                  mapsUrl={r.mapsUrl}
                  image={r.image?.src}
                  imageAlt={r.image?.alt ?? r.imageAlt}
                  placeholderId={`rest-${r.slug}`}
                />
              ))}
            </Grid>
          </>
        ) : (
          <p className="body" style={{ margin: 0, color: 'var(--ink-muted)' }}>
            Em breve, restaurantes com a Turma por aqui.
          </p>
        )}
      </Section>
    );
  }),

  'tem-um-restaurante': section('owner-panel', (c, ctx, name) => {
    const img = ctx.image(c.imageId);
    return (
      <Section name={name}>
        <Panel tone="earth">
          <Split ratio="7-5" gap="lg">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <Reveal>
                <SectionHeader
                  overline={opt(c.overline)}
                  title={c.title}
                  description={opt(c.description)}
                />
              </Reveal>
              <FeatureList columns={2} items={c.features} />
              <div>
                <WhatsAppButton size="lg" message={c.ctaMessage}>
                  {c.ctaLabel}
                </WhatsAppButton>
              </div>
            </div>
            <StoryMedia
              src={img?.src}
              ratio="4 / 5"
              icon="utensils"
              alt={img?.alt ?? c.imageAlt}
              placeholderId="owner"
            />
          </Split>
        </Panel>
      </Section>
    );
  }),

  cta: section('cta', (c, _ctx, name) => (
    <Section name={name} tight>
      <CTABanner
        title={c.title}
        text={opt(c.text)}
        ctaLabel={c.ctaLabel}
        message="Olá! Vim pelo site e quero um orçamento."
      />
    </Section>
  )),
};
