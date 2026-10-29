import { z } from 'zod';
import { ICON_NAMES } from '@/lib/iconNames';

/**
 * Blocos de campo dos schemas de seção. Cada campo leva metadados (`.meta`) que o painel do
 * editor (Etapa 5) usa para montar o formulário: rótulo, limite de caracteres, dica, multilinha.
 */
export interface FieldMeta {
  label: string;
  max?: number;
  hint?: string;
  multiline?: boolean;
}

/** Texto puro, com limite de caracteres. `optional` aceita vazio ("" = ausente). */
export const text = (
  label: string,
  max: number,
  o: { hint?: string; multiline?: boolean; optional?: boolean } = {},
) =>
  z
    .string()
    .trim()
    .min(o.optional ? 0 : 1, `${label}: preencha o campo`)
    .max(max, `${label}: no máximo ${max} caracteres`)
    .meta({ label, max, hint: o.hint, multiline: o.multiline } satisfies FieldMeta);

export const icon = (label = 'Ícone') => z.enum(ICON_NAMES).meta({ label } satisfies FieldMeta);

export const tone = (label = 'Cor do selo') =>
  z.enum(['brand', 'olive', 'earth']).meta({ label } satisfies FieldMeta);

/** Referência a uma foto da biblioteca (Media). `null` = placeholder de camuflagem. */
export const mediaId = (label = 'Foto') =>
  z
    .string()
    .min(1)
    .nullable()
    .meta({ label } satisfies FieldMeta);

/** Link interno (/pagina), âncora (#id) ou externo (https://…). */
export const href = (label = 'Link') =>
  z
    .string()
    .trim()
    .max(200)
    .regex(/^(\/|#|https?:\/\/)/, `${label}: use /pagina, #ancora ou https://…`)
    .meta({ label, max: 200 } satisfies FieldMeta);

/** Cabeçalho padrão de seção (SectionHeader). */
export const header = {
  overline: text('Sobre-título', 40, { optional: true }),
  title: text('Título', 80),
  description: text('Descrição', 240, { optional: true, multiline: true }),
};
