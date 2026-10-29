import { Entrance } from '@/motion/Entrance';
import { Reveal } from '@/motion/Reveal';
import { CTABanner } from '@/components/organisms/CTABanner';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Stat } from '@/components/molecules/Stat';
import { StoryMedia } from '@/components/molecules/StoryMedia';
import { TeamCard } from '@/components/molecules/TeamCard';
import { ValuePillar } from '@/components/molecules/ValuePillar';
import { Grid, Section, Split } from '@/components/templates';
import type { TeamMember } from '@/content/types';
import { opt, section, type Renderer } from '../render';

export interface QuemSomosData {
  team: TeamMember[];
}

export const quemSomosRenderers: Record<string, Renderer<QuemSomosData>> = {
  historia: section('history', (c, ctx, name) => {
    const img = ctx.image(c.imageId);
    return (
      <Section name={name} intro>
        <Split ratio="6-6" gap="lg">
          {/* acima da dobra: Entrance (CSS), não Reveal — ver motion/Entrance.tsx */}
          <Entrance>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <SectionHeader level={1} overline={opt(c.overline)} title={c.title} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <p className="lead" style={{ margin: 0, color: 'var(--ink)' }}>
                  {c.lead}
                </p>
                <p className="body" style={{ margin: 0, color: 'var(--ink-muted)' }}>
                  {c.body}
                </p>
              </div>
              <p className="tagline" style={{ margin: 0, color: 'var(--earth-strong)' }}>
                {c.tagline}
              </p>
            </div>
          </Entrance>
          <StoryMedia
            src={img?.src}
            ratio="5 / 4"
            icon="users"
            alt={img?.alt ?? c.imageAlt}
            placeholderId="historia"
            paw
          />
        </Split>
      </Section>
    );
  }),

  pilares: section('pillars', (c, _ctx, name) => (
    <Section name={name} tone="sunken">
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

  equipe: section('intro', (c, ctx, name) => (
    <Section name={name}>
      <Reveal>
        <SectionHeader
          overline={opt(c.overline)}
          title={c.title}
          description={opt(c.description)}
        />
      </Reveal>
      <Grid cols={3}>
        {ctx.data.team.map((m) => (
          <TeamCard
            key={m.nickname}
            name={m.name}
            nickname={m.nickname}
            role={m.role}
            bio={m.bio}
            badges={m.badges}
            photo={m.photo?.src}
          />
        ))}
      </Grid>
    </Section>
  )),

  seguranca: section('stats', (c, _ctx, name) => (
    <Section name={name} tone="earth">
      <Reveal>
        <SectionHeader
          overline={opt(c.overline)}
          title={c.title}
          description={opt(c.description)}
        />
      </Reveal>
      <Grid cols={3}>
        {c.stats.map((s) => (
          <Stat
            key={s.label}
            icon={s.icon}
            tone={s.tone}
            value={s.value}
            label={s.label}
            description={s.description}
          />
        ))}
      </Grid>
    </Section>
  )),

  cta: section('cta', (c, _ctx, name) => (
    <Section name={name}>
      <CTABanner title={c.title} text={opt(c.text)} ctaLabel={c.ctaLabel} />
    </Section>
  )),
};
