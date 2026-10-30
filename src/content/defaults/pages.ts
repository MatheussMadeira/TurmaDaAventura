import type { SectionContent, SectionType } from '../sections/schemas';

/**
 * Textos iniciais de cada seção (copy dos canvases). São a fonte do seed e o fallback do site
 * enquanto uma seção não tem versão publicada. Validados contra os schemas por um teste.
 * Nenhum preço, pacote ou "a partir de R$".
 */
type Defaults = {
  [slug: string]: { [key: string]: { type: SectionType; content: unknown } };
};

const hero = (c: SectionContent<'hero'>) => ({ type: 'hero' as const, content: c });
const cta = (c: SectionContent<'cta'>) => ({ type: 'cta' as const, content: c });

const PILARES = {
  overline: 'Nosso jeito',
  title: 'Brincar / Aprender / Ensinar',
  description: '',
  pillars: [
    {
      icon: 'compass',
      tone: 'brand',
      number: '01',
      title: 'Brincar',
      text: 'Brincadeira livre e dirigida, ao ar livre sempre que dá. Criança precisa correr, sujar a mão e rir alto.',
    },
    {
      icon: 'leaf',
      tone: 'olive',
      number: '02',
      title: 'Aprender',
      text: 'Cada atividade traz uma descoberta: sobre a natureza, sobre o grupo e sobre si mesmo.',
    },
    {
      icon: 'heart',
      tone: 'earth',
      number: '03',
      title: 'Ensinar',
      text: 'As crianças ensinam umas às outras — e a gente aprende junto com elas.',
    },
  ],
} satisfies SectionContent<'pillars'>;

export const DEFAULT_PAGES: Defaults = {
  inicio: {
    hero: hero({
      overline: 'Recreação infantil',
      title: 'Bora pra aventura?',
      lead: 'A gente leva brincadeiras, oficinas e gincanas para festas, restaurantes, empresas e escolas. Monitores treinados, atividades por idade e muita natureza — você só curte.',
      imageId: null,
      imageAlt: 'Crianças de costas correndo num gramado ao fim da tarde, com monitores por perto',
      ctaLabel: '',
      secondary: { label: 'Conhecer as Oficinas', href: '/oficinas' },
      highlights: ['Monitores treinados', 'Atividades por faixa etária', 'Montamos tudo no local'],
    }),
    'quatro-jeitos': {
      type: 'cards',
      content: {
        overline: 'Onde a Turma aparece',
        title: 'Quatro jeitos de viver a aventura',
        description:
          'Escolha o seu ponto de partida. Em todos eles, quem cuida das crianças é a nossa equipe.',
        cards: [
          {
            icon: 'star',
            tone: 'default',
            overline: 'Para aniversários',
            title: 'Festas e aniversários',
            description:
              'Uma aventura temática na festa do seu filho, em casa, no prédio ou no buffet.',
            href: '/festas-e-aniversarios',
            linkLabel: 'Ver festas',
          },
          {
            icon: 'utensils',
            tone: 'default',
            overline: 'Para famílias',
            title: 'Restaurantes',
            description:
              'Recreação fixa nos fins de semana. As crianças brincam por perto e você come com calma.',
            href: '/restaurantes',
            linkLabel: 'Ver restaurantes',
          },
          {
            icon: 'briefcase',
            tone: 'earth',
            overline: 'Para empresas',
            title: 'Eventos corporativos',
            description:
              'Espaço kids em confraternizações, Dia da Família, convenções e férias na empresa.',
            href: '/eventos-corporativos',
            linkLabel: 'Ver eventos corporativos',
          },
          {
            icon: 'scissors',
            tone: 'default',
            overline: 'Para escolas e grupos',
            title: 'Oficinas',
            description:
              'Pipas, mini horta, tintas naturais e gincanas. Atividades manuais e de natureza.',
            href: '/oficinas',
            linkLabel: 'Conhecer as Oficinas',
          },
        ],
      } satisfies SectionContent<'cards'>,
    },
    pilares: { type: 'pillars', content: PILARES },
    'como-funciona': {
      type: 'steps',
      content: {
        overline: 'Como funciona',
        title: 'Do “oi” à aventura em três etapas',
        description: '',
        steps: [
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
        ],
      } satisfies SectionContent<'steps'>,
    },
    'onde-esta': {
      type: 'restaurants-home',
      content: {
        overline: 'Fim de semana com a Turma',
        title: 'Onde a Turma está',
        description:
          'Restaurantes parceiros com recreação fixa. Chegue, peça seu prato e deixe a aventura com a gente.',
        linkLabel: 'Ver todos os restaurantes',
      } satisfies SectionContent<'restaurants-home'>,
    },
    galeria: {
      type: 'gallery',
      content: {
        overline: 'Diário de expedição',
        title: 'Um pouco do que rola por aqui',
        description: '',
        images: [
          { mediaId: null, icon: 'flag', alt: 'Crianças de costas empinando pipas num gramado' },
          { mediaId: null, icon: 'palette', alt: 'Mãos pintando papel com tinta de urucum' },
          { mediaId: null, icon: 'tent', alt: 'Grupo de crianças montando cabana com galhos' },
          {
            mediaId: null,
            icon: 'compass',
            alt: 'Monitora mostrando um mapa do tesouro para o grupo',
          },
          { mediaId: null, icon: 'leaf', alt: 'Crianças plantando mudas na mini horta' },
          { mediaId: null, icon: 'tree', alt: 'Circuito de aventura com cordas entre árvores' },
        ],
      } satisfies SectionContent<'gallery'>,
    },
    cta: cta({
      title: 'Bora planejar a próxima aventura?',
      text: 'Conta pra gente o que você imagina. A gente monta a proposta e responde rapidinho.',
      ctaLabel: 'Pedir orçamento no WhatsApp',
    }),
  },

  oficinas: {
    hero: hero({
      overline: 'Oficinas',
      title: 'Mão na massa, pé na grama',
      lead: 'Brincadeiras, oficinas manuais, gincanas e atividades de natureza. A gente leva os materiais, monta no seu espaço e adapta tudo à idade da turma.',
      imageId: null,
      imageAlt: 'Crianças sentadas no chão do pátio montando pipas com papel de seda e varetas',
      ctaLabel: '',
      secondary: { label: 'Ver atividades', href: '#catalogo' },
      highlights: [
        'Materiais seguros e naturais',
        'Atividades de 45 a 90 min',
        'Para grupos de 8 a 40 crianças',
      ],
    }),
    catalogo: {
      type: 'intro',
      content: {
        overline: 'Catálogo de atividades',
        title: 'Escolha o roteiro da expedição',
        description:
          'Misture atividades à vontade: a gente monta a sequência certa para o tempo e o espaço que você tem.',
      } satisfies SectionContent<'intro'>,
    },
    'como-montamos': {
      type: 'steps',
      content: {
        overline: 'Passo a passo',
        title: 'Como montamos uma oficina',
        description: '',
        steps: [
          {
            icon: 'whatsapp',
            title: 'Chama no WhatsApp',
            text: 'Conta a data, o espaço e quantas crianças vêm.',
          },
          {
            icon: 'compass',
            title: 'Escolhemos o roteiro',
            text: 'Montamos a sequência de atividades por idade e tempo.',
          },
          {
            icon: 'backpack',
            title: 'Preparamos os materiais',
            text: 'Separamos tudo e conferimos o espaço antes do dia.',
          },
          {
            icon: 'tent',
            title: 'Oficina no seu espaço',
            text: 'Chegamos antes, conduzimos e deixamos tudo limpo.',
          },
        ],
      } satisfies SectionContent<'steps'>,
    },
    seguranca: {
      type: 'features',
      content: {
        overline: 'Segurança e materiais',
        title: 'Tudo pensado antes da primeira tesoura',
        description: 'Pais e escolas perguntam — e a gente gosta de mostrar.',
        items: [
          {
            icon: 'shield',
            tone: 'brand',
            title: 'Materiais atóxicos',
            text: 'Tintas naturais, colas à base d’água e tesouras sem ponta para os menores.',
          },
          {
            icon: 'leaf',
            tone: 'olive',
            title: 'Natureza e reaproveitamento',
            text: 'Sementes, folhas, papel reciclado e sucata limpa viram brinquedo.',
          },
          {
            icon: 'users',
            tone: 'earth',
            title: 'Grupos por faixa etária',
            text: 'Atividades separadas por idade, com um monitor para cada grupo pequeno.',
          },
          {
            icon: 'heart',
            tone: 'brand',
            title: 'Primeiros socorros',
            text: 'Equipe treinada e kit de primeiros socorros em toda oficina.',
          },
          {
            icon: 'backpack',
            tone: 'olive',
            title: 'A gente leva tudo',
            text: 'Materiais, forros, mesas baixas e o que mais a atividade pedir.',
          },
          {
            icon: 'check',
            tone: 'earth',
            title: 'Espaço conferido',
            text: 'Antes de começar, checamos o local, as saídas e os pontos de atenção.',
          },
        ],
      } satisfies SectionContent<'features'>,
    },
    'pre-orcamento': {
      type: 'pre-quote',
      content: {
        overline: 'Pré-orçamento',
        title: 'Monte a sua oficina',
        description: 'Conta o básico e a conversa já abre no WhatsApp com tudo preenchido.',
        checks: [
          'Só nome e tipo são obrigatórios',
          'Resposta em horário comercial',
          'Cada oficina é montada sob medida',
        ],
        note: '',
        formTitle: '',
        nameLabel: '',
      } satisfies SectionContent<'pre-quote'>,
    },
    cta: cta({
      title: 'Bora colocar a mão na massa?',
      text: 'Escolha as atividades ou deixe com a gente. Respondemos rapidinho no WhatsApp.',
      ctaLabel: 'Chamar no WhatsApp',
    }),
  },

  restaurantes: {
    intro: {
      type: 'intro',
      content: {
        overline: 'Fim de semana com a Turma',
        title: 'Onde a Turma está',
        description:
          'Restaurantes parceiros com recreação fixa e monitores treinados. Você escolhe a mesa, as crianças escolhem a aventura — e todo mundo come em paz.',
      } satisfies SectionContent<'intro'>,
    },
    lista: { type: 'data-backed', content: {} },
    'tem-um-restaurante': {
      type: 'owner-panel',
      content: {
        overline: 'Para donos de restaurante',
        title: 'Tem um restaurante?',
        description:
          'Leve a Turma para o seu salão. A gente cuida da recreação do começo ao fim — sua equipe só cuida da cozinha.',
        features: [
          {
            icon: 'clock',
            tone: 'brand',
            title: 'Famílias ficam mais tempo',
            text: 'Criança entretida é sobremesa pedida e mesa sem pressa.',
          },
          {
            icon: 'utensils',
            tone: 'earth',
            title: 'Pais comem com calma',
            text: 'Monitores por perto, à vista da mesa, e a refeição volta a ser programa.',
          },
          {
            icon: 'star',
            tone: 'olive',
            title: 'Diferencial no fim de semana',
            text: 'Um motivo a mais para as famílias escolherem o seu endereço.',
          },
          {
            icon: 'backpack',
            tone: 'brand',
            title: 'Zero trabalho para a sua equipe',
            text: 'Levamos materiais, montamos o espaço e organizamos tudo ao final.',
          },
        ],
        ctaLabel: 'Chamar a Turma para o meu restaurante',
        ctaMessage: 'Olá! Tenho um restaurante e quero recreação para as famílias.',
        imageId: null,
        imageAlt: 'Monitora brincando com crianças ao lado das mesas de um restaurante',
      } satisfies SectionContent<'owner-panel'>,
    },
    cta: cta({
      title: 'Quer a Turma no seu evento também?',
      text: 'Além dos restaurantes, a gente monta recreação para empresas, escolas e festas.',
      ctaLabel: 'Pedir orçamento no WhatsApp',
    }),
  },

  'eventos-corporativos': {
    hero: hero({
      overline: 'Eventos corporativos',
      title: 'Espaço kids para o seu evento',
      lead: 'Os pais participam do evento enquanto as crianças ficam com monitores treinados, em atividades por faixa etária. Montagem, operação e desmontagem por nossa conta.',
      imageId: null,
      imageAlt: 'Espaço kids montado num salão de eventos, com crianças em atividade de pintura',
      ctaLabel: 'Pedir proposta no WhatsApp',
      secondary: { label: 'Ver formatos', href: '#formatos' },
      highlights: [
        'Monitores treinados',
        'Seguro para cada criança',
        'Montagem e desmontagem inclusas',
      ],
    }),
    formatos: {
      type: 'cards',
      content: {
        overline: 'Formatos',
        title: 'Para cada tipo de encontro',
        description:
          'Do almoço de fim de ano à convenção de três dias: a estrutura acompanha o tamanho do evento.',
        cards: [
          {
            icon: 'star',
            tone: 'default',
            overline: '',
            title: 'Confraternização de fim de ano',
            description:
              'Espaço kids durante a festa, com atividades para todas as idades e horário estendido.',
            linkLabel: '',
          },
          {
            icon: 'heart',
            tone: 'earth',
            overline: '',
            title: 'Dia da Família',
            description: 'Gincanas, oficinas e circuitos que aproximam as famílias da empresa.',
            linkLabel: '',
          },
          {
            icon: 'briefcase',
            tone: 'default',
            overline: '',
            title: 'Convenções e feiras',
            description: 'Espaço kids em estandes e congressos, com controle de entrada e saída.',
            linkLabel: '',
          },
          {
            icon: 'calendar',
            tone: 'earth',
            overline: '',
            title: 'Férias na empresa',
            description: 'Programação para os filhos de colaboradores durante as férias escolares.',
            linkLabel: '',
          },
        ],
      } satisfies SectionContent<'cards'>,
    },
    empresas: {
      type: 'companies',
      content: {
        label: 'Empresas que já levaram a Turma',
        caption: 'Logos exibidos com autorização de cada empresa.',
        count: 6,
      } satisfies SectionContent<'companies'>,
    },
    'como-funciona': {
      type: 'steps',
      content: {
        overline: 'Como funciona',
        title: 'Do briefing à operação em quatro etapas',
        description: '',
        steps: [
          {
            icon: 'whatsapp',
            title: 'Briefing',
            text: 'Data, local, público e número estimado de crianças.',
          },
          {
            icon: 'mail',
            title: 'Proposta',
            text: 'Formato, equipe e cronograma em PDF para aprovação.',
          },
          { icon: 'tent', title: 'Montagem', text: 'Chegamos antes e entregamos o espaço pronto.' },
          {
            icon: 'shield',
            title: 'Operação',
            text: 'Check-in, atividades e entrega segura para os pais.',
          },
        ],
      } satisfies SectionContent<'steps'>,
    },
    beneficios: {
      type: 'benefits',
      content: {
        overline: 'Benefícios',
        title: 'Bom para o RH, tranquilo para os pais',
        description: '',
        panels: [
          {
            title: 'Para o RH',
            icon: 'briefcase',
            tone: 'brand',
            items: [
              'Mais adesão: colaboradores com filhos conseguem participar do evento.',
              'Um único fornecedor para montagem, equipe, materiais e seguro.',
              'Proposta formal, contrato e nota fiscal para o seu processo de compras.',
              'Relatório pós-evento com número de crianças atendidas.',
            ],
          },
          {
            title: 'Para os pais',
            icon: 'users',
            tone: 'earth',
            items: [
              'Check-in com pulseira de identificação e retirada só pelo responsável.',
              'Monitores treinados em primeiros socorros, com proporção por idade.',
              'Atividades separadas por faixa etária, dos 3 aos 12 anos.',
              'Espaço à vista, perto do evento — sem perder o filho de vista.',
            ],
          },
        ],
      } satisfies SectionContent<'benefits'>,
    },
    'pre-orcamento': {
      type: 'pre-quote',
      content: {
        overline: 'Proposta',
        title: 'Conte sobre o seu evento',
        description:
          'Com data, local e número estimado de crianças, a gente devolve uma proposta sob medida.',
        checks: [],
        note: 'Prefere e-mail? Peça no WhatsApp e enviamos a proposta em PDF para o seu time de compras.',
        formTitle: 'Pedir proposta',
        nameLabel: 'Seu nome e empresa',
      } satisfies SectionContent<'pre-quote'>,
    },
    cta: cta({
      title: 'Seu próximo evento com espaço kids',
      text: 'Fale com a gente e receba uma proposta para o seu formato e o seu público.',
      ctaLabel: 'Pedir proposta no WhatsApp',
    }),
  },

  'quem-somos': {
    historia: {
      type: 'history',
      content: {
        overline: 'Quem somos',
        title: 'A turma por trás da aventura',
        lead: 'A Turma nasceu de um quintal: amigos educadores que levavam as próprias crianças para brincar ao ar livre todo fim de semana — e, de repente, os filhos dos vizinhos também queriam ir.',
        body: 'Hoje somos uma equipe de monitores, pedagogos e arte-educadores que leva essa mesma expedição para restaurantes, empresas e escolas. Mudou o tamanho, não o jeito: brincadeira de verdade, natureza sempre que dá e um adulto atento para cada grupo pequeno.',
        tagline: 'Brincar / Aprender / Ensinar',
        imageId: null,
        imageAlt: 'Equipe de monitores sentada em roda com as crianças no gramado',
      } satisfies SectionContent<'history'>,
    },
    pilares: {
      type: 'pillars',
      content: { ...PILARES, overline: 'Nosso jeito', title: 'O que guia cada expedição' },
    },
    equipe: {
      type: 'intro',
      content: {
        overline: 'Equipe',
        title: 'Quem cuida da sua turma',
        description:
          'Todos os monitores passam por formação própria, checagem de antecedentes e reciclagem de primeiros socorros todo ano.',
      } satisfies SectionContent<'intro'>,
    },
    seguranca: {
      type: 'stats',
      content: {
        overline: 'Segurança',
        title: 'Confiança se constrói com cuidado visível',
        description: 'Os números que os pais perguntam — e que a gente faz questão de cumprir.',
        stats: [
          {
            icon: 'users',
            tone: 'brand',
            value: '1 : 6',
            label: 'Monitor por criança até 5 anos',
            description: 'De 6 a 12 anos, um monitor para cada 10 crianças.',
          },
          {
            icon: 'heart',
            tone: 'earth',
            value: '100%',
            label: 'Da equipe com primeiros socorros',
            description: 'Certificação renovada todo ano e kit completo em todo evento.',
          },
          {
            icon: 'shield',
            tone: 'olive',
            value: 'Seguro',
            label: 'Para cada criança atendida',
            description: 'Seguro de acidentes pessoais válido durante toda a atividade.',
          },
        ],
      } satisfies SectionContent<'stats'>,
    },
    cta: cta({
      title: 'Bora conversar?',
      text: 'Conta o que você imagina e a gente responde no WhatsApp, em horário comercial.',
      ctaLabel: 'Chamar no WhatsApp',
    }),
  },
};
