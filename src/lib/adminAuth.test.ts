import { describe, expect, it } from 'vitest';
import { can, ROLE_LABEL } from './permissions';
import { LOGIN_ERROR, safeNext } from './adminAuth';
import { generateTempPassword, validateNewPassword } from '@/server/auth/password';

describe('safeNext (redirecionamento pós-login)', () => {
  it('aceita só caminhos internos do admin', () => {
    expect(safeNext('/admin/restaurantes')).toBe('/admin/restaurantes');
    expect(safeNext('/admin')).toBe('/admin');
  });
  it.each([
    'https://evil.com',
    '//evil.com',
    '/outra-coisa',
    '/admin/login',
    '/admin/trocar-senha',
    '/admin\\..\\evil',
    null,
    undefined,
    42,
  ])('recusa %s', (v) => {
    expect(safeNext(v)).toBeNull();
  });
});

describe('permissões', () => {
  it('Administração faz tudo; Equipe não vê Usuários nem Contato', () => {
    for (const p of [
      'site',
      'photos',
      'restaurants',
      'activities',
      'team',
      'users',
      'contact',
    ] as const) {
      expect(can('ADMIN', p)).toBe(true);
    }
    expect(can('EQUIPE', 'users')).toBe(false);
    expect(can('EQUIPE', 'contact')).toBe(false);
    expect(can('EQUIPE', 'restaurants')).toBe(true);
    expect(ROLE_LABEL.ADMIN).toBe('Administração');
  });
});

describe('mensagens e senhas', () => {
  it('erro de login é uma mensagem só, sem dizer qual campo', () => {
    expect(LOGIN_ERROR).toBe('E-mail ou senha incorretos.');
  });

  it('política da senha definitiva', () => {
    expect(validateNewPassword('curta1')).toMatch(/10 caracteres/);
    expect(validateNewPassword('apenasletrasaqui')).toMatch(/letras e números/);
    expect(validateNewPassword('1234567890123')).toMatch(/letras e números/);
    expect(validateNewPassword('Aventura-2026')).toBeNull();
    expect(validateNewPassword('Aventura-2026', { current: 'Aventura-2026' })).toMatch(/diferente/);
    expect(validateNewPassword('maria-silva-123', { email: 'maria-silva@exemplo.com' })).toMatch(
      /e-mail/,
    );
  });

  it('senha temporária: 12 caracteres sem ambíguos, diferente a cada vez', () => {
    const a = generateTempPassword();
    expect(a).toMatch(/^[A-HJ-NP-Z2-9]{4}(-[A-HJ-NP-Z2-9]{4}){2}$/);
    expect(a).not.toBe(generateTempPassword());
  });
});
