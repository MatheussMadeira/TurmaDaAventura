import { Reveal } from '@/motion/Reveal';
import { CTABanner } from '@/components/organisms/CTABanner';
import { Gallery } from '@/components/organisms/Gallery';
import { Hero } from '@/components/organisms/Hero';
import { Trail } from '@/components/organisms/Trail';
import { RestaurantCard } from '@/components/molecules/RestaurantCard';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { ServiceCard } from '@/components/molecules/ServiceCard';
import { TextLink } from '@/components/molecules/TextLink';
import { ValuePillar } from '@/components/molecules/ValuePillar';
import { Grid, Section } from '@/components/templates';
import type { Restaurant } from '@/content/types';
import { opt, section, type Renderer } from '../render';

export interface InicioData {
  restaurants: Restaurant[];
}

export const inicioRenderers: Record<string, Renderer<InicioData>> = {
  hero: section('hero', (c, ctx) => {
    const img = ctx.image(c.imageId);
    return (
      <Hero
        overline={opt(c.overline)}
        title={c.title}
        lead={c.lead}
        image={img?.src}
        imageAlt={img?.alt ?? c.imageAlt}
        ctaLabel={opt(c.ctaLabel)}
        secondary={c.secondary}
        highlights={c.highlights}
      />
    );
  }),

  'tres-jeitos': section('cards', (c, _ctx, name) => (
    <Section name={name} tone="sunken">
      <Reveal>
        <SectionHeader
          overline={opt(c.overline)}
          title={c.title}
          description={opt(c.description)}
        />
      </Reveal>
      <Grid cols={3}>
        {c.cards.map((card) => (
          <ServiceCard
            key={card.title}
            icon={card.icon}
            tone={card.tone}
            overline={opt(card.overline)}
            title={card.title}
            description={card.description}
            href={card.href}
            linkLabel={opt(card.linkLabel)}
          />
        ))}
      </Grid>
    </Section>
  )),

  pilares: section('pillars', (c, _ctx, name) => (
    <Section name={name}>
      <Reveal>
        <SectionHeader
          align="center"
          overline={opt(c.overline)}
          title={c.title}
          description={opt(c.description)}
        />
      </Reveal>
      <Grid cols={3} reveal={false}>
        {c.pillars.map((p, i) => (
          <ValuePillar
            key={p.number}
            index={i}
            icon={p.icon}
            tone={p.tone}
            number={p.number}
            title={p.title}
            text={p.text}
          />
        ))}
      </Grid>
    </Section>
  )),

  'como-funciona': section('steps', (c, _ctx, name) => (
    <Section name={name} tone="sunken">
      <Reveal>
        <SectionHeader
          overline={opt(c.overline)}
          title={c.title}
          description={opt(c.description)}
        />
      </Reveal>
      <Trail steps={c.steps} />
    </Section>
  )),

  'onde-esta': section('restaurants-home', (c, ctx, name) => (
    <Section name={name}>
      <Reveal>
        <SectionHeader
          overline={opt(c.overline)}
          title={c.title}
          description={opt(c.description)}
        />
      </Reveal>
      <Grid cols={3}>
        {ctx.data.restaurants.map((r) => (
          <RestaurantCard
            key={r.slug}
            name={r.name}
            neighborhood={`${r.neighborhood} · ${r.regionShortName}`}
            schedule={r.schedule}
            address={r.address}
            ages={r.ages}
            mapsUrl={r.mapsUrl}
            image={r.image?.src}
            imageAlt={r.image?.alt ?? r.imageAlt}
            placeholderId={`home-${r.slug}`}
          />
        ))}
      </Grid>
      <div>
        <TextLink href="/restaurantes">{c.linkLabel}</TextLink>
      </div>
    </Section>
  )),

  galeria: section('gallery', (c, ctx, name) => (
    <Section name={name} tone="sunken">
      <Reveal>
        <SectionHeader
          overline={opt(c.overline)}
          title={c.title}
          description={opt(c.description)}
        />
      </Reveal>
      <Gallery
        images={c.images.map((g) => {
          const img = ctx.image(g.mediaId);
          return { src: img?.src, alt: img?.alt ?? g.alt, icon: g.icon };
        })}
      />
    </Section>
  )),

  cta: section('cta', (c, _ctx, name) => (
    <Section name={name}>
      <CTABanner title={c.title} text={opt(c.text)} ctaLabel={c.ctaLabel} />
    </Section>
  )),
};
