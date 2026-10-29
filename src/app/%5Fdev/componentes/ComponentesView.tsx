'use client';

import { useState, type ReactNode } from 'react';
import styled from 'styled-components';
import {
  Button,
  CTABanner,
  CamoPattern,
  FeatureList,
  FilterChips,
  Footer,
  Gallery,
  Header,
  Hero,
  Icon,
  LogoStrip,
  Logo,
  Media,
  QuoteForm,
  RestaurantCard,
  Reveal,
  SectionHeader,
  Select,
  ServiceCard,
  Stat,
  Tag,
  TeamCard,
  TextField,
  Trail,
  ValuePillar,
  WhatsAppButton,
  WhatsAppFloat,
  iconNames,
  type ButtonVariant,
} from '@/components';

const Page = styled.div`
  background: var(--surface);
  color: var(--ink);
  min-height: 100vh;
`;
const Wrap = styled.div`
  max-width: var(--container);
  margin: 0 auto;
  padding: var(--space-7) var(--space-4);
  display: grid;
  gap: var(--space-9);
`;
const Bar = styled.div`
  position: sticky;
  top: 0;
  z-index: var(--z-overlay);
  display: flex;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: var(--surface-raised);
  border-bottom: var(--border-thin) solid var(--line);
`;
const Block = styled.section`
  display: grid;
  gap: var(--space-5);
`;
const Label = styled.p`
  margin: 0;
  font: 800 12px/16px var(--font-body);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-subtle);
`;
const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  align-items: flex-start;
`;
const Cols = styled.div<{ $min?: string }>`
  display: grid;
  gap: var(--space-5);
  grid-template-columns: repeat(auto-fill, minmax(${({ $min }) => $min ?? '280px'}, 1fr));
`;
const Frame = styled.div<{ $w?: number; $bg?: string }>`
  width: min(100%, ${({ $w }) => $w ?? 1200}px);
  border: var(--border-thin) dashed var(--line-strong);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: ${({ $bg }) => $bg ?? 'var(--surface)'};
`;
const Pad = styled.div`
  padding: var(--space-6) var(--space-4);
`;
const Forest = styled.div`
  background: var(--surface-forest);
  padding: var(--space-6);
  border-radius: var(--radius-md);
`;
const IconGrid = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: var(--space-3);

  li {
    display: grid;
    justify-items: center;
    gap: var(--space-1);
    padding: var(--space-3);
    border-radius: var(--radius-sm);
    border: var(--border-thin) solid var(--line);
    background: var(--surface-raised);
    color: var(--brand);
    font: 600 12px/16px var(--font-body);
  }
  span {
    color: var(--ink-muted);
  }
`;

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <Block>
      <div>
        <h2 className="h2" style={{ margin: 0 }}>
          {title}
        </h2>
        {hint ? <p style={{ margin: '8px 0 0', color: 'var(--ink-muted)' }}>{hint}</p> : null}
      </div>
      {children}
    </Block>
  );
}

const STATES = ['repouso', 'hover', 'focus', 'pressed', 'disabled'] as const;
const VARIANTS: { variant: ButtonVariant; label: string }[] = [
  { variant: 'primary', label: 'Pedir orçamento' },
  { variant: 'earth', label: 'Conhecer a Oficina' },
  { variant: 'outline', label: 'Ver restaurantes' },
  { variant: 'ghost', label: 'Ver todos' },
  { variant: 'inverse', label: 'Chamar no WhatsApp' },
  { variant: 'ghost-inverse', label: 'Ver formatos' },
];

const FILTERS = [
  { value: 'todas', label: 'Todas', count: 12 },
  { value: 'brincadeiras', label: 'Brincadeiras', count: 4 },
  { value: 'oficinas', label: 'Oficinas manuais', count: 3 },
  { value: 'gincanas', label: 'Gincanas', count: 3 },
  { value: 'natureza', label: 'Natureza', count: 2 },
];

const NAV_DEMO = [
  { label: 'Início', href: '/' },
  { label: 'Oficina', href: '/oficina' },
  { label: 'Restaurantes', href: '/restaurantes' },
  { label: 'Eventos corporativos', href: '/eventos-corporativos' },
  { label: 'Quem somos', href: '/quem-somos' },
];

export function ComponentesView() {
  const [theme, setTheme] = useState<'dia' | 'noite'>('dia');
  const [filter, setFilter] = useState('todas');

  return (
    <Page data-theme={theme}>
      <Bar>
        <strong className="label">/_dev/componentes</strong>
        <Button
          size="sm"
          variant="outline"
          aria-pressed={theme === 'noite'}
          onClick={() => setTheme(theme === 'dia' ? 'noite' : 'dia')}
        >
          Tema: {theme === 'dia' ? 'Dia' : 'Noite'}
        </Button>
      </Bar>

      <Wrap>
        <header>
          <h1 className="h1" style={{ margin: 0 }}>
            Componentes
          </h1>
          <p className="lead" style={{ color: 'var(--ink-muted)' }}>
            Todos os estados do design system. Não existe em produção.
          </p>
        </header>

        <Section
          title="Átomos"
          hint="Ícones, botões (estados forçados por data-state), tags, logos, mídia e campos."
        >
          <Label>Ícones</Label>
          <IconGrid>
            {iconNames.map((n) => (
              <li key={n}>
                <Icon name={n} size={28} />
                <span>{n}</span>
              </li>
            ))}
          </IconGrid>

          <Label>Botões · estados</Label>
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            {VARIANTS.map(({ variant, label }) => {
              const onForest = variant === 'inverse' || variant === 'ghost-inverse';
              const row = (
                <Row>
                  {STATES.map((s) => (
                    <Button
                      key={s}
                      variant={variant}
                      data-state={s === 'repouso' || s === 'disabled' ? undefined : s}
                      disabled={s === 'disabled'}
                    >
                      {label}
                    </Button>
                  ))}
                </Row>
              );
              return (
                <div key={variant} style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <Label>{variant}</Label>
                  {onForest ? <Forest>{row}</Forest> : row}
                </div>
              );
            })}
            <Row>
              <Button size="sm" iconRight="arrow-right">
                Pequeno
              </Button>
              <Button size="md" iconLeft="whatsapp">
                Médio
              </Button>
              <Button size="lg" iconLeft="whatsapp">
                Grande
              </Button>
              <Button fullWidth variant="earth">
                Largura total
              </Button>
            </Row>
          </div>

          <Label>Tags</Label>
          <Row>
            <Tag tone="olive">3 a 6 anos</Tag>
            <Tag tone="brand" icon="check">
              Disponível
            </Tag>
            <Tag tone="earth" icon="shield">
              Primeiros socorros
            </Tag>
            <Tag tone="neutral">Neutra</Tag>
          </Row>

          <Label>Logos</Label>
          <Row>
            <Logo variant="compact" tone="green" height={52} />
            <Logo variant="full" tone="green" height={96} />
            <Logo variant="symbol" tone="green" height={64} />
            <Logo variant="paw" tone="green" height={72} />
            <Forest>
              <Row>
                <Logo variant="compact" tone="white" height={52} />
                <Logo variant="symbol" tone="white" height={64} />
              </Row>
            </Forest>
          </Row>

          <Label>Media e camuflagem</Label>
          <Cols $min="220px">
            <Media alt="Placeholder de camuflagem" icon="tent" ratio="4 / 3" />
            <Media
              alt="Placeholder com legenda"
              icon="utensils"
              caption="Legenda da foto"
              ratio="16 / 10"
            />
            <div style={{ height: 160, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <CamoPattern tone="full" />
            </div>
            <div style={{ height: 160, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <CamoPattern tone="forest" />
            </div>
          </Cols>

          <Label>Campos · repouso, foco, erro, dica, desabilitado</Label>
          <Cols>
            <TextField label="Seu nome" placeholder="Maria Souza" />
            <TextField label="Com foco" data-state="focus" defaultValue="Campo focado" />
            <TextField label="Com erro" error="Conta pra gente seu nome." required />
            <TextField label="Com dica" hint="Uma estimativa já ajuda." type="number" />
            <TextField label="Desabilitado" disabled defaultValue="Não editável" />
            <Select
              label="Tipo de evento"
              placeholder="Escolha uma opção"
              options={['Oficina', 'Evento corporativo', 'Outro']}
            />
            <Select
              label="Select com erro"
              placeholder="Escolha uma opção"
              error="Escolha o tipo de evento."
              options={['Oficina', 'Evento corporativo']}
            />
            <TextField label="Quer contar mais?" multiline />
          </Cols>
        </Section>

        <Section title="Moléculas">
          <Label>SectionHeader · dentro de Reveal (rolar para ver o traço desenhar)</Label>
          <Reveal>
            <SectionHeader
              overline="Missão 01"
              title="Três jeitos de brincar"
              description="Recreação que transforma qualquer espaço em trilha."
            />
          </Reveal>
          <Forest>
            <SectionHeader
              onForest
              overline="Para empresas"
              title="Eventos corporativos"
              description="Tom mais sóbrio."
            />
          </Forest>

          <Label>WhatsAppButton</Label>
          <Row>
            <WhatsAppButton />
            <WhatsAppButton size="sm">Orçamento</WhatsAppButton>
            <WhatsAppButton message="Olá! Mensagem customizada.">Mensagem própria</WhatsAppButton>
          </Row>

          <Label>Cards · repouso, hover, foco, pressionado</Label>
          <Cols $min="260px">
            <ServiceCard
              icon="tree"
              title="Recreação em restaurantes"
              description="Monitores treinados cuidam das crianças enquanto a família almoça."
              href="/restaurantes"
            />
            <ServiceCard
              icon="tree"
              title="Recreação em restaurantes"
              description="Hover."
              href="/restaurantes"
              data-state="hover"
            />
            <ServiceCard
              icon="tree"
              title="Recreação em restaurantes"
              description="Foco."
              href="/restaurantes"
              data-state="focus"
            />
            <ServiceCard
              icon="tree"
              title="Recreação em restaurantes"
              description="Pressionado."
              href="/restaurantes"
              data-state="pressed"
            />
            <ServiceCard
              image={null}
              imageAlt="Placeholder da atividade"
              icon="palette"
              overline="Oficinas manuais"
              title="Oficina de pipas"
              description="Cada criança monta e decora a própria pipa."
              tags={['A partir de 5 anos', '60 min']}
              href="/oficina"
            />
            <ServiceCard
              tone="earth"
              icon="briefcase"
              title="Tom terra"
              description="Variante surface-earth."
            />
          </Cols>

          <Cols $min="280px">
            <RestaurantCard
              name="Restaurante Exemplo"
              neighborhood="Zona Sul"
              schedule="Sáb e dom, 12h às 17h"
              address="Rua Exemplo, 000"
              ages="De 3 a 12 anos"
              mapsUrl="https://maps.google.com"
            />
            <TeamCard
              name="Capitã Exemplo"
              nickname="Capitã Trilha"
              role="Coordenação"
              bio="Cuida da equipe e do planejamento de cada aventura."
              badges={['Primeiros socorros']}
            />
            <Stat
              value="1:6"
              label="monitor por criança até 5 anos"
              description="Proporção mantida em todas as atividades."
            />
          </Cols>

          <Cols $min="260px">
            <ValuePillar
              index={0}
              tone="brand"
              icon="heart"
              title="Cuidado"
              text="Segurança visível, sempre."
            />
            <ValuePillar
              index={1}
              tone="olive"
              icon="leaf"
              title="Natureza"
              text="Ao ar livre sempre que possível."
            />
            <ValuePillar
              index={2}
              tone="earth"
              icon="compass"
              title="Aventura"
              text="Cada dia, uma missão."
            />
          </Cols>

          <Label>FilterChips · repouso, hover, foco, selecionado</Label>
          <FilterChips
            label="Filtrar por categoria"
            options={FILTERS}
            value={filter}
            onChange={setFilter}
            forceState={{ value: 'gincanas', state: 'hover' }}
          />
          <FilterChips
            label="Filtrar (foco forçado)"
            options={FILTERS}
            value={filter}
            onChange={setFilter}
            forceState={{ value: 'natureza', state: 'focus' }}
          />

          <Label>FeatureList · brand, olive, earth</Label>
          <FeatureList
            items={[
              {
                icon: 'shield',
                title: 'Equipe treinada',
                text: 'Primeiros socorros em 100% dos monitores.',
              },
              { icon: 'users', title: 'Grupos pequenos', text: 'Atenção para cada criança.' },
              { icon: 'leaf', title: 'Materiais seguros', text: 'Atóxicos e adequados à idade.' },
            ]}
          />
          <FeatureList
            tone="earth"
            columns={2}
            items={[
              { icon: 'briefcase', title: 'Para o RH', text: 'Evento organizado sem esforço.' },
              { icon: 'heart', title: 'Para os pais', text: 'Aproveitam o evento tranquilos.' },
            ]}
          />
          <FeatureList
            tone="olive"
            items={[{ icon: 'star', title: 'Selo oliva', text: 'Variante olive.' }]}
          />

          <Label>LogoStrip</Label>
          <LogoStrip />
        </Section>

        <Section
          title="Organismos"
          hint="Header em quatro estados, Hero light e forest, Trail, CTA, QuoteForm, Footer, Galeria e WhatsAppFloat."
        >
          <Label>Header · normal, rolado</Label>
          <Frame $bg="var(--surface-sunken)">
            <Header static current="/oficina" items={NAV_DEMO} />
          </Frame>
          <Frame $bg="var(--surface-sunken)">
            <Header static scrolled current="/oficina" items={NAV_DEMO} />
          </Frame>
          <Label>Header · mobile fechado e aberto (390px)</Label>
          <Row>
            <Frame $w={390}>
              <Header static current="/" items={NAV_DEMO} />
            </Frame>
            <Frame $w={390}>
              <Header static defaultOpen current="/oficina" items={NAV_DEMO} />
            </Frame>
          </Row>

          <Label>Hero · light</Label>
          <Frame>
            <Hero
              overline="Recreação infantil"
              title="Bora pra aventura?"
              lead="Recreação que transforma qualquer espaço em trilha."
              secondary={{ label: 'Conhecer a Oficina', href: '/oficina' }}
              highlights={['De 3 a 12 anos', 'Monitores treinados', 'Orçamento sob medida']}
              imageAlt="Crianças em atividade ao ar livre"
            />
          </Frame>
          <Label>Hero · forest</Label>
          <Frame>
            <Hero
              variant="forest"
              overline="Para empresas"
              title="Eventos corporativos"
              lead="Os pais participam do evento enquanto as crianças ficam com monitores treinados."
              secondary={{ label: 'Ver formatos', href: '#formatos' }}
              imageAlt="Evento corporativo com crianças"
            />
          </Frame>

          <Label>Trail · 3 e 4 etapas</Label>
          <Frame $bg="var(--surface-sunken)">
            <Pad>
              <Trail
                steps={[
                  { title: 'Conversa', text: 'Você conta o que precisa.', icon: 'whatsapp' },
                  { title: 'Proposta', text: 'Montamos a expedição.', icon: 'compass' },
                  { title: 'Aventura', text: 'A Turma chega e brinca.', icon: 'tent' },
                ]}
              />
            </Pad>
          </Frame>
          <Frame $bg="var(--surface-sunken)" $w={390}>
            <Pad>
              <Trail
                steps={[
                  { title: 'Briefing', text: 'Entendemos o evento.' },
                  { title: 'Proposta', text: 'Formato e equipe.' },
                  { title: 'Montagem', text: 'Preparamos o espaço.' },
                  { title: 'Operação', text: 'Monitores em ação.' },
                ]}
              />
            </Pad>
          </Frame>

          <Label>CTABanner</Label>
          <CTABanner text="Cada aventura é montada sob medida — chama a gente no WhatsApp." />

          <Label>QuoteForm · vazio (tipo pré-selecionado), com erro, preenchido</Label>
          <Cols $min="420px">
            <QuoteForm defaultType="Oficina" />
            <QuoteForm
              defaultErrors={{
                nome: 'Conta pra gente seu nome.',
                tipo: 'Escolha o tipo de evento.',
              }}
            />
            <QuoteForm
              title="Pedir proposta"
              nameLabel="Seu nome e empresa"
              defaultType="Evento corporativo"
              defaultValues={{
                nome: 'Maria Souza — Empresa Exemplo',
                data: '2026-12-05',
                criancas: '30',
                idades: '4 a 10 anos',
                cidade: 'São Paulo',
              }}
            />
          </Cols>

          <Label>Gallery</Label>
          <Gallery
            images={[
              { alt: 'Crianças correndo em gincana', icon: 'flag' },
              { alt: 'Oficina de pintura', icon: 'palette' },
              { alt: 'Trilha na mata', icon: 'tree' },
              { alt: 'Monitor com grupo', icon: 'users' },
              { alt: 'Acampamento montado', icon: 'tent' },
              { alt: 'Brincadeira com bolas', icon: 'star' },
            ]}
          />

          <Label>Footer</Label>
          <Frame>
            <Footer
              instagram="@turmadaaventura"
              email="contato@exemplo.com.br"
              city="São Paulo, SP"
            />
          </Frame>

          <Label>WhatsAppFloat · inline (o real é fixo e aparece após 1,5s)</Label>
          <Row>
            <WhatsAppFloat inline label="Falar no WhatsApp" />
            <WhatsAppFloat inline pulse={false} />
          </Row>
        </Section>
      </Wrap>
    </Page>
  );
}
