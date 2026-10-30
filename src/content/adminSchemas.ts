import { z } from 'zod';
import { ICON_NAMES } from '@/lib/iconNames';

/**
 * Schemas dos formulários do painel (restaurantes, atividades, equipe, contato).
 * Mesmos limites do que cabe nos cards do site. Nenhum campo de preço.
 */
const req = (label: string, max: number, min = 1) =>
  z
    .string()
    .trim()
    .min(min, `${label}: preencha o campo.`)
    .max(max, `${label}: no máximo ${max} caracteres.`);

const opt = (label: string, max: number) =>
  z.string().trim().max(max, `${label}: no máximo ${max} caracteres.`);

const optionalUrl = z
  .string()
  .trim()
  .max(300, 'Link do mapa: no máximo 300 caracteres.')
  .refine(
    (v) => v === '' || /^https?:\/\//i.test(v),
    'Link do mapa: use um endereço que comece com https://',
  );

const mediaRef = z.string().min(1).nullable();

export const restaurantSchema = z.object({
  name: req('Nome', 60, 2),
  neighborhood: req('Bairro', 40),
  address: req('Endereço', 80),
  mapsUrl: optionalUrl,
  schedule: req('Dias e horários', 50),
  ages: req('Faixa etária', 30),
  destaqueHome: z.boolean(),
  /** "Mostrar no site": ao publicar, liga (PUBLICADO) ou pausa (PAUSADO) */
  visible: z.boolean(),
  imageId: mediaRef,
  imageAlt: opt('Descrição da foto', 160),
});
export type RestaurantInput = z.infer<typeof restaurantSchema>;

export const activitySchema = z.object({
  category: req('Categoria', 30),
  icon: z.enum(ICON_NAMES, { message: 'Ícone: escolha uma opção.' }),
  title: req('Título', 40, 2),
  description: req('Descrição', 160),
  tags: z.array(req('Etiqueta', 24)).max(4, 'Etiquetas: no máximo 4.'),
  imageId: mediaRef,
  imageAlt: opt('Descrição da foto', 160),
  visible: z.boolean(),
});
export type ActivityInput = z.infer<typeof activitySchema>;

export const themeSchema = z.object({
  icon: z.enum(ICON_NAMES, { message: 'Ícone: escolha uma opção.' }),
  title: req('Título', 40, 2),
  description: req('Descrição', 160),
  tags: z.array(req('Etiqueta', 24)).max(4, 'Etiquetas: no máximo 4.'),
  imageId: mediaRef,
  imageAlt: opt('Descrição da foto', 160),
  visible: z.boolean(),
});
export type ThemeInput = z.infer<typeof themeSchema>;

export const teamSchema = z.object({
  nickname: req('Apelido', 30),
  name: req('Nome', 40, 2),
  role: req('Função', 50),
  bio: req('Bio', 140),
  badges: z.array(req('Selo', 30)).max(3, 'Selos: no máximo 3.'),
  photoId: mediaRef,
  visible: z.boolean(),
});
export type TeamInput = z.infer<typeof teamSchema>;

export const MESSAGE_KEYS = [
  ['inicio', 'Início'],
  ['oficinas', 'Oficinas'],
  ['festas-e-aniversarios', 'Festas e aniversários'],
  ['restaurantes', 'Restaurantes'],
  ['eventos-corporativos', 'Eventos corporativos'],
  ['quem-somos', 'Quem somos'],
  ['float', 'Botão flutuante (outras páginas)'],
] as const;

const message = (label: string) =>
  z
    .string()
    .trim()
    .min(5, `${label}: escreva a mensagem.`)
    .max(300, `${label}: no máximo 300 caracteres.`);

export const settingsSchema = z.object({
  whatsapp: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine(
      (v) => v.length >= 12 && v.length <= 15,
      'WhatsApp: use DDI + DDD + número (ex.: 5511999999999).',
    ),
  instagram: z
    .string()
    .trim()
    .regex(/^@?[A-Za-z0-9._]{1,30}$/, 'Instagram: use o @ do perfil.')
    .transform((v) => (v.startsWith('@') ? v : `@${v}`)),
  email: z
    .string()
    .trim()
    .max(120)
    .refine(
      (v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
      'E-mail: informe um e-mail válido.',
    ),
  city: req('Cidade', 60),
  hours: req('Horário', 60),
  messages: z.object(
    Object.fromEntries(MESSAGE_KEYS.map(([k, label]) => [k, message(label)])) as Record<
      (typeof MESSAGE_KEYS)[number][0],
      ReturnType<typeof message>
    >,
  ),
});
export type SettingsInput = z.input<typeof settingsSchema>;
export type SettingsParsed = z.output<typeof settingsSchema>;
