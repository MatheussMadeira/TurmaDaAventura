/** Nomes que a equipe vê na lista de seções do editor (o `name` do schema é o do canvas, técnico). */
const LABELS: Record<string, string> = {
  hero: 'Abertura',
  'tres-jeitos': 'Três jeitos de brincar',
  pilares: 'Pilares',
  'como-funciona': 'Como funciona',
  'onde-esta': 'Onde estamos',
  galeria: 'Galeria de fotos',
  cta: 'Chamada final',
  catalogo: 'Catálogo de atividades',
  'como-montamos': 'Como montamos',
  'pre-orcamento': 'Pré-orçamento',
  intro: 'Introdução',
  lista: 'Lista de restaurantes',
  'tem-um-restaurante': 'Tem um restaurante?',
  formatos: 'Formatos de evento',
  empresas: 'Empresas atendidas',
  beneficios: 'Benefícios',
  historia: 'Nossa história',
  equipe: 'Equipe',
};

const PER_PAGE: Record<string, Record<string, string>> = {
  oficina: { seguranca: 'Segurança e materiais' },
  'quem-somos': { seguranca: 'Segurança em números' },
};

export const sectionTitle = (slug: string, key: string) =>
  PER_PAGE[slug]?.[key] ?? LABELS[key] ?? key;
