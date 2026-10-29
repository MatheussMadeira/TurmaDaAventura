import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('react', async (orig) => ({
  ...(await orig<typeof import('react')>()),
  cache: <F>(fn: F) => fn,
}));
const redirect = vi.fn((to: string) => {
  throw new Error(`REDIRECT:${to}`);
});
vi.mock('next/navigation', () => ({ redirect }));

const auth = vi.fn();
vi.mock('./index', () => ({ auth }));

type DbUser = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EQUIPE';
  active: boolean;
  mustChangePassword: boolean;
  tokenVersion: number;
};
let user: DbUser | null;
const db = { user: { findUnique: vi.fn(async () => user) } };
vi.mock('../db', () => ({ db }));

const { authorize, requirePageUser, validateClaims, AuthzError, SHORT_SESSION_MS } =
  await import('./session');

const base: DbUser = {
  id: 'u1',
  name: 'Ana',
  email: 'ana@exemplo.com',
  role: 'EQUIPE',
  active: true,
  mustChangePassword: false,
  tokenVersion: 0,
};
const session = (over: Record<string, unknown> = {}) =>
  auth.mockResolvedValue({ user: { id: 'u1', tv: 0, remember: true, iat: 0, ...over } });

beforeEach(() => {
  vi.clearAllMocks();
  user = { ...base };
  session();
});

describe('validateClaims — o banco manda, não o token', () => {
  it('conta desativada perde o acesso na hora', async () => {
    user!.active = false;
    expect(await validateClaims({ uid: 'u1', tv: 0, remember: true })).toBeNull();
  });

  it('tokenVersion diferente (senha trocada/redefinida) invalida a sessão', async () => {
    user!.tokenVersion = 3;
    expect(await validateClaims({ uid: 'u1', tv: 0, remember: true })).toBeNull();
  });

  it('o papel vem do banco: rebaixar vale na hora', async () => {
    user!.role = 'ADMIN';
    expect((await validateClaims({ uid: 'u1', tv: 0, remember: true }))?.role).toBe('ADMIN');
    user!.role = 'EQUIPE';
    expect((await validateClaims({ uid: 'u1', tv: 0, remember: true }))?.role).toBe('EQUIPE');
  });

  it('sem "manter conectado" a sessão vale 12 h; com ele, não expira nesse prazo', async () => {
    const now = 1_000_000_000_000;
    const iat = Math.floor((now - SHORT_SESSION_MS - 1000) / 1000);
    expect(await validateClaims({ uid: 'u1', tv: 0, remember: false, iat }, now)).toBeNull();
    expect(await validateClaims({ uid: 'u1', tv: 0, remember: true, iat }, now)).not.toBeNull();
  });

  it('usuário inexistente ou token sem uid', async () => {
    user = null;
    expect(await validateClaims({ uid: 'u1', tv: 0, remember: true })).toBeNull();
    expect(await validateClaims({})).toBeNull();
  });
});

describe('authorize — permissões conferidas no servidor', () => {
  it('sem sessão: unauthenticated', async () => {
    auth.mockResolvedValue(null);
    await expect(authorize()).rejects.toMatchObject({ code: 'unauthenticated' });
  });

  it('senha temporária: bloqueia tudo, exceto a própria troca', async () => {
    user!.mustChangePassword = true;
    await expect(authorize({ permission: 'restaurants' })).rejects.toMatchObject({
      code: 'must-change-password',
    });
    await expect(authorize({ allowMustChange: true })).resolves.toMatchObject({ id: 'u1' });
  });

  it.each([
    ['EQUIPE', 'users', false],
    ['EQUIPE', 'contact', false],
    ['EQUIPE', 'restaurants', true],
    ['EQUIPE', 'activities', true],
    ['EQUIPE', 'team', true],
    ['EQUIPE', 'photos', true],
    ['EQUIPE', 'site', true],
    ['ADMIN', 'users', true],
    ['ADMIN', 'contact', true],
    ['ADMIN', 'restaurants', true],
  ] as const)('%s × %s → %s', async (role, permission, allowed) => {
    user!.role = role;
    const result = authorize({ permission });
    if (allowed) await expect(result).resolves.toMatchObject({ role });
    else await expect(result).rejects.toMatchObject({ code: 'forbidden' });
  });
});

describe('requirePageUser', () => {
  it('sem sessão vai para o login', async () => {
    auth.mockResolvedValue(null);
    await expect(requirePageUser()).rejects.toThrow('REDIRECT:/admin/login');
  });

  it('senha temporária vai para a troca obrigatória antes de qualquer tela', async () => {
    user!.mustChangePassword = true;
    await expect(requirePageUser('restaurants')).rejects.toThrow('REDIRECT:/admin/trocar-senha');
  });

  it('Equipe em Usuários: allowed=false (a página mostra "sem permissão")', async () => {
    expect((await requirePageUser('users')).allowed).toBe(false);
    user!.role = 'ADMIN';
    expect((await requirePageUser('users')).allowed).toBe(true);
  });
});

it('AuthzError carrega o código', () => {
  expect(new AuthzError('forbidden').code).toBe('forbidden');
});
