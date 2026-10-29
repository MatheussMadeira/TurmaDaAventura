import { useState, type ReactElement } from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '@/test/a11y';
import { renderWithProviders } from '@/test/render';
import {
  Button,
  CTABanner,
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
} from '@/components';

const stories: Record<string, () => ReactElement> = {
  Icon: () => <Icon name="check" label="Confirmado" />,
  Button: () => <Button iconRight="arrow-right">Ver todos</Button>,
  'Button (link)': () => <Button href="/oficina">Conhecer a Oficina</Button>,
  Tag: () => <Tag icon="shield">Primeiros socorros</Tag>,
  Logo: () => <Logo variant="compact" tone="auto" href="/" />,
  Media: () => <Media alt="Crianças em atividade" />,
  TextField: () => <TextField label="Seu nome" required error="Conta pra gente seu nome." />,
  Select: () => <Select label="Tipo" options={['Oficina', 'Outro']} placeholder="Escolha" />,
  SectionHeader: () => (
    <SectionHeader level={1} overline="Missão 01" title="Título" description="Texto" />
  ),
  WhatsAppButton: () => <WhatsAppButton />,
  ServiceCard: () => (
    <ServiceCard title="Oficina" description="Texto" href="/oficina" tags={['3 a 6 anos']} />
  ),
  RestaurantCard: () => (
    <RestaurantCard
      name="Restaurante"
      schedule="Sáb, 12h"
      address="Rua, 000"
      mapsUrl="https://maps.google.com"
    />
  ),
  TeamCard: () => (
    <TeamCard
      name="Ana Souza"
      nickname="Capitã"
      role="Coordenação"
      badges={['Primeiros socorros']}
    />
  ),
  ValuePillar: () => <ValuePillar title="Cuidado" text="Texto" number="01" />,
  Stat: () => <Stat value="1:6" label="monitor por criança" description="Até 5 anos" />,
  FeatureList: () => (
    <FeatureList items={[{ icon: 'shield', title: 'Equipe', text: 'Treinada' }]} />
  ),
  LogoStrip: () => <LogoStrip />,
  Header: () => <Header static current="/oficina" />,
  Hero: () => (
    <Hero title="Bora pra aventura?" lead="Lead" imageAlt="Foto do hero" highlights={['A', 'B']} />
  ),
  'Hero forest': () => <Hero variant="forest" title="Eventos" imageAlt="Foto" />,
  Trail: () => <Trail steps={[{ title: 'Um' }, { title: 'Dois' }, { title: 'Três' }]} />,
  CTABanner: () => <CTABanner text="Texto" />,
  QuoteForm: () => <QuoteForm defaultType="Oficina" />,
  'QuoteForm com erro': () => <QuoteForm defaultErrors={{ nome: 'Conta pra gente seu nome.' }} />,
  Footer: () => <Footer instagram="@turma" email="a@b.com" city="São Paulo" />,
  Gallery: () => (
    <Gallery images={Array.from({ length: 6 }, (_, i) => ({ alt: `Foto ${i + 1}` }))} />
  ),
  WhatsAppFloat: () => <WhatsAppFloat inline label="Falar" />,
};

describe('acessibilidade (axe)', () => {
  it.each(Object.entries(stories))('%s não tem violações', async (_name, story) => {
    const { container } = renderWithProviders(story());
    await expectNoA11yViolations(container);
  });
});

describe('Button', () => {
  it('renderiza <a> com href e <button type=button> sem href', () => {
    renderWithProviders(
      <>
        <Button href="/oficina">Link</Button>
        <Button>Botão</Button>
      </>,
    );
    expect(screen.getByRole('link', { name: 'Link' })).toHaveAttribute('href', '/oficina');
    expect(screen.getByRole('button', { name: 'Botão' })).toHaveAttribute('type', 'button');
  });
});

describe('WhatsAppButton', () => {
  it('abre o wa.me em nova aba com a mensagem da página', () => {
    renderWithProviders(<WhatsAppButton message="Olá! Teste." phone="5511999999999" />);
    const link = screen.getByRole('link', { name: /pedir orçamento no whatsapp/i });
    expect(link).toHaveAttribute('href', 'https://wa.me/5511999999999?text=Ol%C3%A1!%20Teste.');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('Header', () => {
  it('marca a página atual e abre/fecha o menu mobile', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header static current="/oficina" />);
    expect(screen.getByRole('link', { name: 'Oficina' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Início' })).not.toHaveAttribute('aria-current');

    /* o botão só aparece dentro da container query (< 1024px), que o jsdom não avalia */
    const toggle = document.querySelector('button[aria-controls]') as HTMLButtonElement;
    expect(toggle).toHaveAttribute('aria-label', 'Abrir menu');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-label', 'Fechar menu');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(toggle, { key: 'Escape' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('tem o botão Orçamento e o logo com nome acessível', () => {
    renderWithProviders(<Header static />);
    expect(screen.getByRole('link', { name: 'Orçamento' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /turma da aventura — início/i })).toBeInTheDocument();
  });
});

describe('FilterChips', () => {
  function Demo() {
    const [v, setV] = useState('todas');
    return (
      <FilterChips
        label="Filtrar por categoria"
        value={v}
        onChange={setV}
        options={[
          { value: 'todas', label: 'Todas', count: 5 },
          { value: 'natureza', label: 'Natureza', count: 2 },
        ]}
      />
    );
  }

  it('usa aria-pressed e troca a seleção ao clicar', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Demo />);
    const todas = screen.getByRole('button', { name: /todas/i });
    const natureza = screen.getByRole('button', { name: /natureza/i });
    expect(todas).toHaveAttribute('aria-pressed', 'true');
    expect(natureza).toHaveAttribute('aria-pressed', 'false');
    await user.click(natureza);
    expect(natureza).toHaveAttribute('aria-pressed', 'true');
    expect(todas).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('Reveal', () => {
  it('em listas escalonadas usa <li> como item', () => {
    const { container } = renderWithProviders(
      <Reveal as="ul" stagger>
        <span>a</span>
        <span>b</span>
      </Reveal>,
    );
    expect(container.querySelectorAll('ul > li')).toHaveLength(2);
  });
});

describe('QuoteForm', () => {
  it('pré-seleciona o tipo e usa o rótulo de nome pedido', () => {
    renderWithProviders(<QuoteForm defaultType="Oficina" nameLabel="Seu nome e empresa" />);
    expect(screen.getByLabelText(/seu nome e empresa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo de evento/i)).toHaveValue('Oficina');
  });

  it('erro → alerta no topo → corrige → entrega o link do WhatsApp', async () => {
    const user = userEvent.setup();
    const received: { url: string }[] = [];
    renderWithProviders(
      <QuoteForm phone="5511999999999" onSubmit={(url) => received.push({ url })} />,
    );

    await user.click(screen.getByRole('button', { name: /continuar no whatsapp/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Revise 2 campos');
    expect(screen.getByLabelText(/seu nome/i)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Conta pra gente seu nome.')).toBeInTheDocument();
    expect(screen.getByText('Escolha o tipo de evento.')).toBeInTheDocument();
    expect(received).toHaveLength(0);

    await user.type(screen.getByLabelText(/seu nome/i), 'Maria');
    expect(screen.getByRole('alert')).toHaveTextContent('Revise 1 campo');
    await user.selectOptions(screen.getByLabelText(/tipo de evento/i), 'Oficina');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /continuar no whatsapp/i }));
    await waitFor(() => expect(received).toHaveLength(1), { timeout: 3000 });
    const url = received[0]!.url;
    expect(url).toMatch(/^https:\/\/wa\.me\/5511999999999\?text=/);
    expect(decodeURIComponent(url)).toContain('• Nome: Maria');
    expect(decodeURIComponent(url)).toContain('• Tipo: Oficina');
  });
});
