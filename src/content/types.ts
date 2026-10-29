import type { IconName } from '@/lib/iconNames';
import type { SectionType } from './sections/schemas';

/** Tipos do que o SITE consome (já resolvido a partir do banco). Nenhum campo de preço. */

export interface ImageRef {
  src: string;
  /** Media.alt — obrigatório no cadastro de fotos */
  alt: string;
  width: number;
  height: number;
}

export interface PublishedSection {
  key: string;
  /** data-section do canvas: "Inicio/TresJeitos" */
  name: string;
  type: SectionType;
  content: unknown;
}

export interface PublishedPage {
  slug: string;
  sections: PublishedSection[];
  /** fotos citadas nas seções (imageId / mediaId), por id */
  media: Record<string, ImageRef>;
}

export interface Restaurant {
  slug: string;
  name: string;
  neighborhood: string;
  schedule: string;
  address: string;
  ages: string;
  mapsUrl: string;
  image: ImageRef | null;
  imageAlt: string;
  destaqueHome: boolean;
  /** nome curto da região ("Zona Oeste") */
  regionShortName: string;
}

export interface RestaurantGroup {
  id: string;
  name: string;
  shortName: string;
  restaurants: Restaurant[];
}

export interface Activity {
  slug: string;
  categoria: string;
  icon: IconName;
  title: string;
  description: string;
  tags: string[];
  image: ImageRef | null;
  imageAlt: string;
}

export interface TeamMember {
  nickname: string;
  name: string;
  role: string;
  bio: string;
  badges: string[];
  photo: ImageRef | null;
}

export interface SiteSettings {
  whatsapp: string;
  instagram: string;
  email: string;
  city: string;
  hours: string;
  /** mensagem pronta por página + "float" */
  messages: Record<string, string>;
}
