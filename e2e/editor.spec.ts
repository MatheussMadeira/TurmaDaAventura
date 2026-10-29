import { expect, test, type Page } from '@playwright/test';
import sharp from 'sharp';
import { GOOD, cleanup, makeUser, restoreSections, sectionRow, snapshotSections } from './fixtures';

// mexem no mesmo banco de dev: um de cada vez; o conteúdo do Início é devolvido ao final
test.describe.configure({ mode: 'serial' });

let snapshot: Awaited<ReturnType<typeof snapshotSections>>;
test.beforeAll(async () => {
  snapshot = await snapshotSections('inicio');
});
test.afterAll(async () => {
  await restoreSections(snapshot);
  await cleanup();
});

async function login(page: Page, email: string) {
  await page.goto('/admin/login');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(GOOD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

const preview = (page: Page) => page.frameLocator('iframe[title^="Prévia"]');
const saved = (page: Page) =>
  expect(page.getByText('Rascunho salvo')).toBeVisible({ timeout: 10_000 });

const TITLE = 'Título de teste E2E';
const INLINE = 'Edição no lugar';

test.describe('editor visual', () => {
  test('sem sessão, editor e prévia mandam para o login', async ({ page }) => {
    await page.goto('/admin/editor?pagina=inicio');
    await expect(page).toHaveURL(/\/admin\/login\?next=/);
    await page.goto('/admin/preview/inicio');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('Equipe abre o editor: prévia real com áreas editáveis e lista de seções', async ({
    page,
  }) => {
    const u = await makeUser('editor', { role: 'EQUIPE' });
    await login(page, u.email);
    await page.goto('/admin/editor?pagina=inicio');

    const sections = page.getByRole('list', { name: 'Seções da página' });
    await expect(sections.getByRole('button', { name: 'Abertura', exact: true })).toBeVisible();
    await expect(sections.getByRole('listitem')).toHaveCount(7);

    const frame = preview(page);
    await expect(frame.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      frame.locator('[data-editor-section="hero"] [data-edit-path="title"]'),
    ).toHaveCount(1);
    expect(await frame.locator('[data-edit-path]').count()).toBeGreaterThan(8);
    await expect(page.getByText('Tudo publicado')).toBeVisible();
  });

  test('editar no painel aparece na prévia, salva sozinho e NÃO vai ao ar', async ({
    page,
    request,
  }) => {
    const u = await makeUser('editor2', { role: 'EQUIPE' });
    await login(page, u.email);
    await page.goto('/admin/editor?pagina=inicio');
    await page.getByRole('button', { name: 'Abertura', exact: true }).click();

    await page.locator('#ed-title').fill(TITLE);
    await expect(preview(page).getByRole('heading', { level: 1 })).toHaveText(TITLE);
    await saved(page);
    await expect(page.getByText('1 alteração não publicada')).toBeVisible();

    expect((await sectionRow('inicio', 'hero')).draft.title).toBe(TITLE);
    const site = await (await request.get('/')).text();
    expect(site).not.toContain(TITLE);

    // Desfazer e Refazer
    await page.getByRole('button', { name: 'Desfazer' }).click();
    await expect(preview(page).getByRole('heading', { level: 1 })).not.toHaveText(TITLE);
    await page.getByRole('button', { name: 'Refazer' }).click();
    await expect(preview(page).getByRole('heading', { level: 1 })).toHaveText(TITLE);
  });

  test('campo vazio ou acima do limite: erro no painel e nada inválido é salvo', async ({
    page,
  }) => {
    const u = await makeUser('editor3', { role: 'EQUIPE' });
    await login(page, u.email);
    await page.goto('/admin/editor?pagina=inicio');
    await page.getByRole('button', { name: 'Abertura', exact: true }).click();
    const before = (await sectionRow('inicio', 'hero')).draft.title;

    await page.locator('#ed-title').fill('');
    await expect(page.getByText('Título: preencha o campo')).toBeVisible();
    await expect(page.getByText('Corrija os campos marcados para salvar')).toBeVisible({
      timeout: 10_000,
    });
    expect((await sectionRow('inicio', 'hero')).draft.title).toBe(before);
    await expect(page.getByRole('img', { name: 'Há campos para corrigir' })).toBeVisible();
  });

  test('edição no lugar: segundo clique abre o texto; o painel e o rascunho acompanham', async ({
    page,
  }) => {
    const u = await makeUser('editor4', { role: 'EQUIPE' });
    await login(page, u.email);
    await page.goto('/admin/editor?pagina=inicio');

    const title = preview(page).locator('[data-editor-section="hero"] [data-edit-path="title"]');
    await expect(title).toBeVisible();
    await title.click(); // 1º clique: seleciona
    await expect(title).toHaveClass(/is-selected/);
    await expect(page.locator('#ed-title')).toBeVisible();
    await title.click(); // 2º clique: edita
    await expect(title).toHaveAttribute('contenteditable', 'true');

    await page.keyboard.press('Control+A');
    await page.keyboard.type(INLINE);
    await expect(page.locator('#ed-title')).toHaveValue(INLINE);
    await page.keyboard.press('Escape'); // sai da edição
    await expect(title).not.toHaveAttribute('contenteditable', 'true');
    await expect(title).toHaveText(INLINE);

    await saved(page);
    expect((await sectionRow('inicio', 'hero')).draft.title).toBe(INLINE);
  });

  test('esconder e reordenar seções valem no rascunho, não no ar', async ({ page, request }) => {
    const siteBefore = await (await request.get('/')).text();
    const u = await makeUser('editor5', { role: 'EQUIPE' });
    await login(page, u.email);
    await page.goto('/admin/editor?pagina=inicio');

    await page.getByRole('button', { name: 'Esconder a seção Galeria de fotos' }).click();
    await expect(preview(page).getByText('Galeria de fotos — seção oculta')).toBeVisible();
    await page.getByRole('button', { name: 'Descer a seção Pilares' }).click();
    await saved(page);

    expect((await sectionRow('inicio', 'galeria')).visible).toBe(false);
    const hero = (await sectionRow('inicio', 'pilares')).order;
    const comoFunciona = (await sectionRow('inicio', 'como-funciona')).order;
    expect(hero).toBeGreaterThan(comoFunciona);
    // o site público não mudou com o rascunho
    expect(await (await request.get('/')).text()).toBe(siteBefore);
  });

  test('foto: o diálogo só deixa enviar com descrição e autorização', async ({ page }) => {
    const u = await makeUser('editor6', { role: 'EQUIPE' });
    await login(page, u.email);
    await page.goto('/admin/editor?pagina=inicio');
    await page.getByRole('button', { name: 'Abertura', exact: true }).click();
    await page
      .getByRole('button', { name: /(Trocar|Escolher) foto/ })
      .first()
      .click();

    const dialog = page.getByRole('dialog', { name: /Trocar foto/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('tab', { name: /Biblioteca/ })).toBeVisible();

    const png = await sharp({
      create: { width: 320, height: 240, channels: 3, background: '#7a8c5a' },
    })
      .png()
      .toBuffer();
    await dialog
      .locator('input[type="file"]')
      .setInputFiles({ name: 'pequena.png', mimeType: 'image/png', buffer: png });

    const send = dialog.getByRole('button', { name: 'Recortar e usar' });
    await expect(send).toBeDisabled();
    await expect(dialog.getByText(/pequena e pode ficar borrada/)).toBeVisible(); // aviso, não bloqueio
    await dialog.getByLabel(/Descrição da foto/).fill('Crianças brincando na mata');
    await expect(send).toBeDisabled(); // falta a autorização
    await dialog.getByLabel(/Tenho autorização/).check();
    await expect(send).toBeEnabled();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('publicar leva o rascunho ao ar e zera o contador', async ({ page, request }) => {
    const u = await makeUser('editor7', { role: 'EQUIPE' });
    await login(page, u.email);
    await page.goto('/admin/editor?pagina=inicio');
    await expect(page.getByText(/alterações? não publicadas?/)).toBeVisible();

    await page.getByRole('button', { name: 'Publicar alterações' }).click();
    await expect(page.getByText('Alterações publicadas. Já estão no site.')).toBeVisible();
    await expect(page.getByText('Tudo publicado')).toBeVisible();

    expect((await sectionRow('inicio', 'hero')).published.title).toBe(INLINE);
    expect(await (await request.get('/')).text()).toContain(INLINE);
  });
});

test.describe('editor no celular', () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test('prévia em tamanho real; tocar num texto abre a folha com o campo', async ({ page }) => {
    const u = await makeUser('editor8', { role: 'EQUIPE' });
    await login(page, u.email);
    await page.goto('/admin/editor?pagina=inicio');

    await expect(page.getByRole('button', { name: 'Seções' })).toBeVisible();
    const title = preview(page).locator('[data-editor-section="hero"] [data-edit-path="title"]');
    await expect(title).toBeVisible();
    await title.click();

    const sheet = page.getByRole('dialog', { name: 'Título' });
    await expect(sheet).toBeVisible();
    await sheet.getByLabel(/^Título/).fill('Texto pelo celular');
    await expect(title).toHaveText('Texto pelo celular');
    await sheet.getByRole('button', { name: 'Aplicar' }).click();
    await expect(sheet).toBeHidden();
  });
});
