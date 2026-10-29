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
import { opt, section, type Renderer } from '../render';

export const eventosRenderers: Record<string, Renderer<Record<string, never>>> = {
  hero: section('hero', (c, ctx) => {
    const img = ctx.image(c.imageId);
    return (
      <Hero
        variant="forest"
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
    <Section name={name} id="formatos">
      <Reveal>
        <SectionHeader
          overline={opt(c.overline)}
          title={c.title}
          description={opt(c.description)}
        />
      </Reveal>
      <Grid cols={4}>
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

  empresas: section('companies', (c, _ctx, name) => (
    <Section name={name} tone="sunken" compact>
      <p
        className="overline"
        style={{ margin: 0, color: 'var(--earth-strong)', textAlign: 'center' }}
      >
        {c.label}
      </p>
      <LogoStrip count={c.count} />
      <p className="caption" style={{ margin: 0, color: 'var(--ink-muted)', textAlign: 'center' }}>
        {c.caption}
      </p>
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

  beneficios: section('benefits', (c, _ctx, name) => (
    <Section name={name} tone="earth">
      <Reveal>
        <SectionHeader
          overline={opt(c.overline)}
          title={c.title}
          description={opt(c.description)}
        />
      </Reveal>
      <Grid cols={2}>
        {c.panels.map((p) => (
          <BenefitPanel key={p.title} title={p.title} icon={p.icon} tone={p.tone} items={p.items} />
        ))}
      </Grid>
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
          {opt(c.note) ? (
            <p
              className="body-sm"
              style={{ margin: 'var(--space-5) 0 0', color: 'var(--ink-muted)' }}
            >
              {c.note}
            </p>
          ) : null}
        </Reveal>
        <QuoteForm
          title={opt(c.formTitle)}
          nameLabel={opt(c.nameLabel)}
          defaultType="Evento corporativo"
        />
      </Split>
    </Section>
  )),

  cta: section('cta', (c, _ctx, name) => (
    <Section name={name} tight>
      <CTABanner title={c.title} text={opt(c.text)} ctaLabel={c.ctaLabel} />
    </Section>
  )),
};
