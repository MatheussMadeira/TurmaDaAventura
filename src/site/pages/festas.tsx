import { Reveal } from '@/motion/Reveal';
import { Panel } from '@/components/atoms/Panel';
import { CTABanner } from '@/components/organisms/CTABanner';
import { Hero } from '@/components/organisms/Hero';
import { QuoteForm } from '@/components/organisms/QuoteForm';
import { Trail } from '@/components/organisms/Trail';
import { CheckList } from '@/components/molecules/CheckList';
import { FeatureList } from '@/components/molecules/FeatureList';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { ServiceCard } from '@/components/molecules/ServiceCard';
import { Grid, Section, Split } from '@/components/templates';
import type { PartyTheme } from '@/content/types';
import { opt, section, type Renderer } from '../render';

export interface FestasData {
  themes: PartyTheme[];
}

export const festasRenderers: Record<string, Renderer<FestasData>> = {
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

  formatos: section('cards', (c, _ctx, name) => (
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

  temas: section('intro', (c, ctx, name) => (
    <Section name={name} id="temas">
      <Reveal>
        <SectionHeader
          overline={opt(c.overline)}
          title={c.title}
          description={opt(c.description)}
        />
      </Reveal>
      {ctx.data.themes.length ? (
        <Grid cols={3}>
          {ctx.data.themes.map((t) => (
            <ServiceCard
              key={t.slug}
              icon={t.icon}
              title={t.title}
              description={t.description}
              tags={t.tags}
              image={t.image?.src ?? null}
              imageAlt={t.image?.alt ?? t.imageAlt}
              placeholderId={`tema-${t.slug}`}
            />
          ))}
        </Grid>
      ) : (
        <p className="body" style={{ margin: 0, color: 'var(--ink-muted)' }}>
          Em breve, novos temas por aqui.
        </p>
      )}
    </Section>
  )),

  'o-que-inclui': section('features', (c, _ctx, name) => (
    <Section name={name} tone="earth">
      <Reveal>
        <SectionHeader
          overline={opt(c.overline)}
          title={c.title}
          description={opt(c.description)}
        />
      </Reveal>
      <FeatureList items={c.items} />
    </Section>
  )),

  'como-funciona': section('steps', (c, _ctx, name) => (
    <Section name={name}>
      <Reveal>
        <SectionHeader
          overline={opt(c.overline)}
          title={c.title}
          description={opt(c.description)}
        />
      </Reveal>
      <Panel tone="sunken" shadow="none" padding="md">
        <Trail steps={c.steps} />
      </Panel>
    </Section>
  )),

  'pre-orcamento': section('pre-quote', (c, _ctx, name) => (
    <Section name={name} tight>
      <Split ratio="5-7" align="start">
        <Reveal>
          <SectionHeader
            overline={opt(c.overline)}
            title={c.title}
            description={opt(c.description)}
          />
          {c.checks.length ? (
            <div style={{ marginTop: 'var(--space-5)' }}>
              <CheckList items={c.checks} />
            </div>
          ) : null}
        </Reveal>
        <QuoteForm
          defaultType="Festa ou aniversário"
          title={opt(c.formTitle)}
          nameLabel={opt(c.nameLabel)}
        />
      </Split>
    </Section>
  )),

  cta: section('cta', (c, _ctx, name) => (
    <Section name={name}>
      <CTABanner title={c.title} text={opt(c.text)} ctaLabel={c.ctaLabel} />
    </Section>
  )),
};
