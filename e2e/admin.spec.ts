import { expect, test, type Page } from '@playwright/test';
import { GOOD, cleanup, getUser, makeUser, setUser } from './fixtures';

// os testes mexem no mesmo banco de dev: um de cada vez
test.describe.configure({ mode: 'serial' });
test.afterAll(cleanup);

async function login(page: Page, email: string, password: string) {
  await page.goto('/admin/login');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

test.describe('login', () => {
  test('senha errada e e-mail inexistente dão a MESMA mensagem genérica', async ({ page }) => {
    const u = await makeUser('generico');
    await login(page, u.email, 'errada-errada-1');
    await expect(page.getByRole('alert').filter({ hasText: 'incorretos' })).toContainText(
      'E-mail ou senha incorretos.',
    );
    const wrongPassword = await page
      .getByRole('alert')
      .filter({ hasText: 'incorretos' })
      .innerText();

    await login(page, `ninguem-${Date.now()}@teste.invalid`, 'qualquer-coisa-1');
    await expect(page.getByRole('alert').filter({ hasText: 'incorretos' })).toContainText(
      'E-mail ou senha incorretos.',
    );
    expect(await page.getByRole('alert').filter({ hasText: 'incorretos' }).innerText()).toBe(
      wrongPassword,
    );
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('sem sessão, qualquer tela do admin manda para o login (guardando o destino)', async ({
    page,
  }) => {
    await page.goto('/admin/restaurantes');
    await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Frestaurantes/);
  });

  test('5 tentativas erradas bloqueiam 15 min — até a senha certa é recusada', async ({ page }) => {
    const u = await makeUser('bloqueio');
    for (let i = 0; i < 5; i++) {
      await login(page, u.email, `errada-${i}-Senha1`);
      await expect(page.getByRole('alert').filter({ hasText: 'incorretos' })).toBeVisible();
    }
    const locked = await getUser(u.id);
    expect(locked.lockedUntil).not.toBeNull();
    const minutes = (locked.lockedUntil!.getTime() - Date.now()) / 60_000;
    expect(minutes).toBeGreaterThan(14);
    expect(minutes).toBeLessThanOrEqual(15);

    await login(page, u.email, GOOD); // senha CERTA
    await expect(page.getByRole('alert').filter({ hasText: 'incorretos' })).toContainText(
      'E-mail ou senha incorretos.',
    );
    await expect(page).toHaveURL(/\/admin\/login/);

    // o contador mora no banco: ao expirar o bloqueio, a senha certa volta a funcionar
    await setUser(u.id, { lockedUntil: new Date(Date.now() - 1000) });
    await login(page, u.email, GOOD);
    await expect(page).toHaveURL(/\/admin$/);
  });
});

test.describe('primeiro acesso', () => {
  test('senha temporária obriga a trocar antes de qualquer outra tela', async ({ page }) => {
    const u = await makeUser('troca', { mustChangePassword: true, password: 'Temp-Provisoria-1' });
    await login(page, u.email, 'Temp-Provisoria-1');
    await expect(page).toHaveURL(/\/admin\/trocar-senha/);

    // tentar fugir para outra tela volta para a troca
    for (const path of ['/admin', '/admin/restaurantes', '/admin/fotos']) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/trocar-senha/);
    }

    // senha fraca e confirmação diferente são recusadas, sem trocar nada
    await page.getByLabel('Senha temporária').fill('Temp-Provisoria-1');
    await page.getByLabel(/^Nova senha/).fill('curta1');
    await page.getByLabel('Repita a nova senha').fill('curta1');
    await page.getByRole('button', { name: 'Salvar e entrar' }).click();
    await expect(page.getByText('Use pelo menos 10 caracteres.')).toBeVisible();
    expect((await getUser(u.id)).mustChangePassword).toBe(true);

    await page.getByLabel(/^Nova senha/).fill('Aventura-Nova-2026');
    await page.getByLabel('Repita a nova senha').fill('Aventura-Nova-2026');
    await page.getByRole('button', { name: 'Salvar e entrar' }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Painel' })).toBeVisible();

    // a senha temporária deixou de valer
    const fresh = await page.context().browser()!.newContext();
    const other = await fresh.newPage();
    await login(other, u.email, 'Temp-Provisoria-1');
    await expect(other.getByRole('alert').filter({ hasText: 'incorretos' })).toContainText(
      'E-mail ou senha incorretos.',
    );
    await fresh.close();
  });
});

test.describe('papéis e permissões', () => {
  test('Equipe não vê Usuários/Contato no menu e o servidor nega as telas', async ({ page }) => {
    const u = await makeUser('equipe', { role: 'EQUIPE' });
    await login(page, u.email, GOOD);
    await expect(page).toHaveURL(/\/admin$/);

    const nav = page.getByRole('navigation', { name: 'Painel' });
    await expect(nav.getByRole('link', { name: 'Restaurantes' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Usuários' })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: /Contato e WhatsApp/ })).toHaveCount(0);

    // digitando a URL na mão: o servidor responde "sem permissão", não a tela
    for (const path of ['/admin/usuarios', '/admin/contato']) {
      await page.goto(path);
      await expect(page.getByText('Esta área é só da Administração')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Criar usuário' })).toHaveCount(0);
    }
    // e as telas de conteúdo continuam abertas
    await page.goto('/admin/restaurantes');
    await expect(page.getByRole('heading', { level: 1, name: 'Restaurantes' })).toBeVisible();
  });

  test('desativar ou rebaixar vale NA HORA, sem esperar a sessão acabar', async ({ page }) => {
    const admin = await makeUser('admin-promovido', { role: 'ADMIN' });
    await login(page, admin.email, GOOD);
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto('/admin/usuarios');
    await expect(page.getByRole('heading', { level: 1, name: 'Usuários' })).toBeVisible();

    // rebaixado por outra Administração enquanto a sessão segue aberta
    await setUser(admin.id, { role: 'EQUIPE' });
    await page.goto('/admin/usuarios');
    await expect(page.getByText('Esta área é só da Administração')).toBeVisible();

    // desativado: perde o acesso na próxima requisição
    await setUser(admin.id, { active: false });
    await page.goto('/admin/restaurantes');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('rota de upload recusa quem não está logado (401)', async ({ request }) => {
    const res = await request.post('/api/admin/media', { multipart: { alts: 'x' } });
    expect(res.status()).toBe(401);
  });
});

test.describe('usuários (Administração)', () => {
  test('cria acesso com senha temporária mostrada uma vez; a própria conta não se desativa', async ({
    page,
  }) => {
    const admin = await makeUser('admin-usuarios', { role: 'ADMIN' });
    await login(page, admin.email, GOOD);
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto('/admin/usuarios');

    // a própria conta: papel e desativação travados
    const me = page.getByRole('row', { name: new RegExp(admin.email) });
    await expect(me.getByLabel(`Papel de ${admin.name}`)).toBeDisabled();
    await expect(
      me.getByRole('button', { name: new RegExp(`Desativar o acesso de ${admin.name}`) }),
    ).toBeDisabled();

    // cria alguém
    const email = `e2e-novo-${Date.now()}@teste.invalid`;
    await page.getByLabel('Nome').fill('Pessoa Nova');
    await page.getByLabel('E-mail').fill(email);
    await page.getByRole('button', { name: 'Criar usuário' }).click();

    const temp = page.locator('code');
    await expect(temp).toHaveText(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    await page.getByRole('button', { name: 'Já anotei' }).click();
    await expect(page.locator('code')).toHaveCount(0); // some e não volta
    await page.reload();
    await expect(page.locator('code')).toHaveCount(0);
    await expect(page.getByRole('row', { name: new RegExp(email) })).toBeVisible();
  });

  test('Administração cria alguém da Equipe; a pessoa entra, cria a senha e só vê o que pode', async ({
    page,
    browser,
  }) => {
    const admin = await makeUser('admin-cria', { role: 'ADMIN' });
    await login(page, admin.email, GOOD);
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto('/admin/usuarios');

    const email = `e2e-equipe-${Date.now()}@teste.invalid`;
    await page.getByLabel('Nome').fill('Pessoa da Equipe');
    await page.getByLabel('E-mail').fill(email);
    await page.getByLabel(/^Equipe/).check();
    await page.getByRole('button', { name: 'Criar usuário' }).click();
    const temp = (await page.locator('code').innerText()).trim();

    // a pessoa nova, em outro navegador
    const ctx = await browser.newContext();
    const other = await ctx.newPage();
    await login(other, email, temp);
    await expect(other).toHaveURL(/\/admin\/trocar-senha/);
    await other.getByLabel('Senha temporária').fill(temp);
    await other.getByLabel(/^Nova senha/).fill('Equipe-Nova-2026');
    await other.getByLabel('Repita a nova senha').fill('Equipe-Nova-2026');
    await other.getByRole('button', { name: 'Salvar e entrar' }).click();
    await expect(other).toHaveURL(/\/admin$/);

    const nav = other.getByRole('navigation', { name: 'Painel' });
    await expect(nav.getByRole('link', { name: 'Restaurantes' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Usuários' })).toHaveCount(0);
    await other.goto('/admin/usuarios');
    await expect(other.getByText('Esta área é só da Administração')).toBeVisible();
    await other.goto('/admin/contato');
    await expect(other.getByText('Esta área é só da Administração')).toBeVisible();
    await ctx.close();
  });
});
