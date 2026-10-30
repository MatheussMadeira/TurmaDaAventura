import { Entrance } from '@/motion/Entrance';
import { Reveal } from '@/motion/Reveal';
import { Icon } from '@/components/atoms/Icon';
import { Panel } from '@/components/atoms/Panel';
import { VisuallyHidden } from '@/components/atoms/VisuallyHidden';
import { CTABanner } from '@/components/organisms/CTABanner';
import { ProductCatalog } from '@/components/organisms/ProductCatalog';
import { Trail } from '@/components/organisms/Trail';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Section } from '@/components/templates';
import type { Product } from '@/content/types';
import { opt, section, type Renderer } from '../render';

export interface ProdutosData {
  products: Product[];
}

export const produtosRenderers: Record<string, Renderer<ProdutosData>> = {
  intro: section('products-intro', (c, _ctx, name) => (
    <Section name={name} intro gap="md">
      {/* acima da dobra: Entrance (CSS), não Reveal — ver motion/Entrance.tsx */}
      <Entrance>
        <SectionHeader
          level={1}
          overline={opt(c.overline)}
          title={c.title}
          description={opt(c.description)}
        />
        <p
          className="body-sm"
          style={{
            margin: 'var(--space-5) 0 0',
            maxWidth: 640,
            display: 'flex',
            gap: 'var(--space-2)',
            alignItems: 'flex-start',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--brand-soft)',
            fontWeight: 600,
          }}
        >
          <span style={{ color: 'var(--brand)', flex: 'none', display: 'flex', marginTop: 1 }}>
            <Icon name="shield" size={20} />
          </span>
          <span>{c.notice}</span>
        </p>
      </Entrance>
    </Section>
  )),

  catalogo: section('products-catalog', (c, ctx, name) => (
    <Section name={name} id="catalogo" tone="sunken" gap="lg">
      {/* os cards são h3: um h2 só para leitores de tela mantém a ordem dos títulos */}
      <VisuallyHidden as="h2">Nossos produtos</VisuallyHidden>
      <ProductCatalog products={ctx.data.products} />
      {opt(c.note) ? (
        <p className="caption" style={{ margin: 0, color: 'var(--ink-muted)' }}>
          {c.note}
        </p>
      ) : null}
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

  cta: section('cta', (c, _ctx, name) => (
    <Section name={name} tight>
      <CTABanner
        title={c.title}
        text={opt(c.text)}
        ctaLabel={c.ctaLabel}
        message="Olá! Quero lembrancinhas personalizadas para uma festa."
      />
    </Section>
  )),
};
