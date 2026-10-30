import { expect, test, type Page } from '@playwright/test';
import { GOOD, cleanup, clearLocks, deleteTestThemes, makeUser } from './fixtures';

test.describe.configure({ mode: 'serial' });
test.afterAll(async () => {
  await clearLocks();
  await deleteTestThemes();
  await cleanup();
});

async function login(page: Page, email: string) {
  await page.goto('/admin/login');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(GOOD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test.describe('Oficina → Oficinas', () => {
  test('/oficina responde 301 para /oficinas e a página nova abre', async ({ request, page }) => {
    const res = await request.get('/oficina', { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(new URL(res.headers()['location']!, 'http://x').pathname).toBe('/oficinas');

    await page.goto('/oficina');
    await expect(page).toHaveURL(/\/oficinas$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Principal' })
        .getByRole('link', { name: 'Oficinas', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('o filtro do catálogo continua funcionando (Oficinas)', async ({ page }) => {
    await page.goto('/oficinas');
    await expect(page.getByRole('status')).toContainText('Mostrando 9 atividades');
    await page.getByRole('button', { name: /natureza/i }).click();
    await expect(page.getByRole('status')).toContainText('Mostrando 2 atividades');
  });
});

test.describe('Festas e aniversários', () => {
  test('página com os 6 temas; "Ver os temas" leva até eles', async ({ page }) => {
    await page.goto('/festas-e-aniversarios');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Aniversário com cara de expedição',
    );
    await page.getByRole('link', { name: /Ver os temas/ }).click();
    await expect(page).toHaveURL(/#temas$/);
    const temas = page.locator('[data-section="Festas/Temas"]');
    await expect(temas.locator('article')).toHaveCount(6);
    await expect(temas.getByText('Expedição na floresta')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/R\$|reais/);
  });

  test('orçamento: tipo já vem "Festa ou aniversário" e a mensagem sai com ele', async ({
    page,
    context,
  }) => {
    await context.route(/^https:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//, (r) =>
      r.fulfill({ status: 200, contentType: 'text/html', body: 'ok' }),
    );
    await page.goto('/festas-e-aniversarios');
    await expect(page.getByLabel(/tipo de evento/i)).toHaveValue('Festa ou aniversário');
    await expect(page.getByText('Monte a festa')).toBeVisible();

    await page.getByLabel(/^Seu nome/).fill('Paula');
    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /Continuar no WhatsApp/ }).click(),
    ]);
    await popup.waitForURL(/wa\.me\//, { timeout: 10_000 });
    expect(decodeURIComponent(popup.url())).toContain('Tipo: Festa ou aniversário');
  });

  test('o botão flutuante e o CTA usam a mensagem da página', async ({ page }) => {
    await page.goto('/festas-e-aniversarios');
    const hrefs = await page
      .locator('a[href^="https://wa.me/"]')
      .evaluateAll((els) => els.map((e) => decodeURIComponent((e as HTMLAnchorElement).href)));
    expect(hrefs.some((h) => h.includes('Quero orçamento para uma festa de aniversário'))).toBe(
      true,
    );
  });
});

test.describe('Restaurantes sem regiões', () => {
  test('um título "N restaurantes com a Turma", grade única e só o bairro no card', async ({
    page,
  }) => {
    await page.goto('/restaurantes');
    const lista = page.locator('[data-section="Restaurantes/Lista"]');
    const n = await lista.locator('article').count();
    expect(n).toBeGreaterThan(0);
    await expect(lista.getByRole('heading', { level: 2 })).toHaveText(
      `${n} ${n === 1 ? 'restaurante' : 'restaurantes'} com a Turma`,
    );
    await expect(lista.getByRole('heading', { level: 2 })).toHaveCount(1);
    // sem chips de âncora na introdução
    await expect(page.locator('[data-section="Restaurantes/Intro"] a')).toHaveCount(0);
    // overline = só o bairro (nada de " · ")
    const overlines = await lista.locator('article .overline').allTextContents();
    expect(overlines.every((t) => !t.includes('·'))).toBe(true);
  });

  test('admin: sem campo Região; link do mapa é opcional', async ({ page }) => {
    const u = await makeUser('v2-rest', { role: 'EQUIPE' });
    await login(page, u.email);
    await page.goto('/admin/restaurantes/novo');
    await expect(page.getByLabel(/^Bairro/)).toBeVisible();
    await expect(page.getByLabel(/^Região/)).toHaveCount(0);
    await expect(page.getByLabel(/Link do mapa \(opcional\)/)).toBeVisible();
    await page.goto('/admin/restaurantes');
    await expect(page.getByRole('columnheader', { name: 'Região' })).toHaveCount(0);
  });
});

test.describe('Temas de festa no admin', () => {
  test('Equipe cria um tema, ele aparece na página e some ao excluir', async ({
    page,
    request,
  }) => {
    const u = await makeUser('v2-tema', { role: 'EQUIPE' });
    await login(page, u.email);
    await page.goto('/admin');
    await expect(
      page
        .getByRole('navigation', { name: 'Painel' })
        .getByRole('link', { name: /Temas de festa/ }),
    ).toBeVisible();

    await page.goto('/admin/temas');
    await page.getByRole('link', { name: 'Novo tema' }).first().click();
    await page.getByLabel(/^Título/).fill('E2E Tema da Lua');
    await page.getByLabel(/^Descrição(\s\*)?$/).fill('Foguetes de papel e uma missão espacial.');
    await page.getByLabel(/^Etiquetas/).fill('5 a 9 anos, Personalizável');
    // prévia ao vivo do card
    await expect(page.getByText('Foguetes de papel e uma missão espacial.').last()).toBeVisible();
    await page.getByRole('button', { name: 'Salvar e publicar' }).click();
    await expect(page).toHaveURL(/\/admin\/temas\/(?!novo)/);

    const html = await (await request.get('/festas-e-aniversarios')).text();
    expect(html).toContain('E2E Tema da Lua');

    await page.goto('/admin/temas');
    await page.getByRole('button', { name: 'Excluir E2E Tema da Lua' }).click();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Excluir', exact: true })
      .click();
    await expect(page.getByText('E2E Tema da Lua')).toHaveCount(0);
    expect(await (await request.get('/festas-e-aniversarios')).text()).not.toContain(
      'E2E Tema da Lua',
    );
  });
});

test.describe('Editor visual', () => {
  test('Festas e aniversários está no seletor e a prévia abre com campos editáveis', async ({
    page,
  }) => {
    const u = await makeUser('v2-editor', { role: 'EQUIPE' });
    await login(page, u.email);
    await page.goto('/admin/editor?pagina=festas-e-aniversarios');
    await expect(
      page.getByLabel('Editando a página').locator('option', { hasText: 'Festas e aniversários' }),
    ).toHaveCount(1);
    const frame = page.frameLocator('iframe[title^="Prévia"]');
    await expect(frame.getByRole('heading', { level: 1 })).toHaveText(
      'Aniversário com cara de expedição',
    );
    expect(await frame.locator('[data-edit-path]').count()).toBeGreaterThan(8);
    const list = page.getByRole('list', { name: 'Seções da página' });
    await expect(list.getByRole('listitem')).toHaveCount(7);
    await expect(list.getByRole('button', { name: 'Temas de festa', exact: true })).toBeVisible();
  });
});
