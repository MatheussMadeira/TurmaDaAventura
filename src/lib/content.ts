/**
 * Conteúdo do site. Por enquanto lido dos JSON em src/content (cópia de _handoff/content);
 * na Etapa 4 estas funções passam a ler só o conteúdo PUBLICADO do banco, com a mesma forma de retorno.
 * Nenhum campo de preço em nenhum tipo.
 */
import restaurantesJson from '@/content/restaurantes.json';
import atividadesJson from '@/content/atividades.json';
import equipeJson from '@/content/equipe.json';
import contatoJson from '@/content/contato.json';
import type { IconName } from '@/components/atoms/Icon';

export interface Restaurant {
  slug: string;
  name: string;
  neighborhood: string;
  schedule: string;
  address: string;
  ages: string;
  mapsUrl: string;
  image: string | null;
  imageAlt: string;
  destaqueHome: boolean;
}

export interface RestaurantGroup {
  id: string;
  name: string;
  restaurants: Restaurant[];
}

export interface Activity {
  slug: string;
  categoria: string;
  icon: IconName;
  title: string;
  description: string;
  tags: string[];
  image: string | null;
  imageAlt: string;
}

export interface TeamMember {
  nickname: string;
  name: string;
  role: string;
  bio: string;
  badges: string[];
  photo: string | null;
}

export interface Contact {
  whatsapp: string;
  instagram: string;
  email: string;
  cidade: string;
  horario: string;
}

/** Sem link do Maps cadastrado, "Como chegar" abre a busca do Google Maps pelo endereço. */
const mapsLink = (r: { name: string; address: string; mapsUrl: string }) =>
  r.mapsUrl ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.name}, ${r.address}`)}`;

export function getRestaurantGroups(): RestaurantGroup[] {
  return restaurantesJson.regioes
    .map((g) => ({
      id: g.id,
      name: g.nome,
      restaurants: g.restaurantes
        .filter((r) => r.publicado)
        .map((r) => ({
          slug: r.slug,
          name: r.name,
          neighborhood: r.neighborhood,
          schedule: r.schedule,
          address: r.address,
          ages: r.ages,
          mapsUrl: mapsLink(r),
          image: r.image,
          imageAlt: r.imageAlt,
          destaqueHome: r.destaqueHome,
        })),
    }))
    .filter((g) => g.restaurants.length > 0);
}

export const getHomeRestaurants = (): Restaurant[] =>
  getRestaurantGroups()
    .flatMap((g) => g.restaurants)
    .filter((r) => r.destaqueHome)
    .slice(0, 3);

export const getActivityCategories = (): string[] => atividadesJson.categorias;

export const getActivities = (): Activity[] =>
  atividadesJson.atividades
    .filter((a) => a.publicado)
    .map((a) => ({
      slug: a.slug,
      categoria: a.categoria,
      icon: a.icon as IconName,
      title: a.title,
      description: a.description,
      tags: a.tags,
      image: a.image,
      imageAlt: a.imageAlt,
    }));

export const getTeam = (): TeamMember[] =>
  equipeJson.equipe
    .filter((m) => m.visivel)
    .map((m) => ({
      nickname: m.nickname,
      name: m.name,
      role: m.role,
      bio: m.bio,
      badges: m.badges,
      photo: m.photo,
    }));

export const getContact = (): Contact => contatoJson;
