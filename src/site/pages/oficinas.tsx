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
import type { Activity } from '@/content/types';
import { opt, section, type Renderer } from '../render';

export interface OficinasData {
  categories: string[];
  activities: Activity[];
}

export const oficinasRenderers: Record<string, Renderer<OficinasData>> = {
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

  catalogo: section('intro', (c, ctx, name) => (
    <Section name={name} id="catalogo" tone="sunken">
      <Reveal>
        <SectionHeader
          overline={opt(c.overline)}
          title={c.title}
          description={opt(c.description)}
        />
      </Reveal>
      <ActivityCatalog
        categories={ctx.data.categories}
        activities={ctx.data.activities.map((a) => ({
          slug: a.slug,
          categoria: a.categoria,
          icon: a.icon,
          title: a.title,
          description: a.description,
          tags: a.tags,
          image: a.image?.src ?? null,
          imageAlt: a.image?.alt ?? a.imageAlt,
        }))}
      />
    </Section>
  )),

  'como-montamos': section('steps', (c, _ctx, name) => (
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

  seguranca: section('features', (c, _ctx, name) => (
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

  'pre-orcamento': section('pre-quote', (c, _ctx, name) => (
    <Section name={name}>
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
        <QuoteForm defaultType="Oficinas" title={opt(c.formTitle)} nameLabel={opt(c.nameLabel)} />
      </Split>
    </Section>
  )),

  cta: section('cta', (c, _ctx, name) => (
    <Section name={name} tight>
      <CTABanner title={c.title} text={opt(c.text)} ctaLabel={c.ctaLabel} />
    </Section>
  )),
};
