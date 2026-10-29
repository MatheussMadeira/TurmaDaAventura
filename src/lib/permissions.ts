/** Papéis e permissões do painel. Módulo neutro: usado no menu (UI) e, principalmente, no servidor. */
export type Role = 'ADMIN' | 'EQUIPE';

export type Permission =
  | 'site' // editor visual e painel
  | 'photos'
  | 'restaurants'
  | 'activities'
  | 'team'
  | 'users' // só Administração
  | 'contact'; // só Administração

const EQUIPE: Permission[] = ['site', 'photos', 'restaurants', 'activities', 'team'];

const MATRIX: Record<Role, readonly Permission[]> = {
  ADMIN: [...EQUIPE, 'users', 'contact'],
  EQUIPE,
};

export const can = (role: Role, permission: Permission) => MATRIX[role].includes(permission);

export const ROLE_LABEL: Record<Role, string> = { ADMIN: 'Administração', EQUIPE: 'Equipe' };
export const ROLE_HELP: Record<Role, string> = {
  EQUIPE: 'Edita textos, fotos, restaurantes, atividades e equipe.',
  ADMIN: 'Tudo da Equipe + usuários, contato e WhatsApp.',
};
