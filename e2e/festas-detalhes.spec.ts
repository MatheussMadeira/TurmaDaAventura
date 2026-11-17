import { expect, test, type Page } from '@playwright/test';
import { GOOD, cleanup, deleteTestThemes, makeUser } from './fixtures';

test.afterAll(async () => {
  await deleteTestThemes();
  await cleanup();
});

const URL_FESTAS = '/festas-e-aniversarios';

async function entrar(page: Page, tag: string) {
  const u = await makeUser(tag, { role: 'EQUIPE' });
  await page.goto('/admin/login');
  await page.getByLabel('E-mail').fill(u.email);
  await page.getByLabel('Senha').fill(GOOD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

async function criarTema(page: Page, titulo: string, detalhes?: string) {
  await page.goto('/admin/temas/novo');
  await page.getByLabel(/^Título/).fill(titulo);
  await page.getByLabel(/^Descrição(\s\*)?$/).fill('Descrição curta com menos de 160 caracteres.');
  if (detalhes) await page.getByLabel(/^Detalhes da festa/).fill(detalhes);
  await page.getByRole('button', { name: 'Salvar e publicar' }).click();
  await expect(page).toHaveURL(/\/admin\/temas\/(?!novo)/);
}

test.describe('Festas: detalhes do tema em modal', () => {
  test('o admin escreve os detalhes; o card abre o modal; sem detalhes, sem botão', async ({
    page,
  }) => {
    await entrar(page, 'festa-detalhes');
    await criarTema(
      page,
      'E2E Tema Detalhado',
      'Primeiro parágrafo: o que acontece na festa.\n\nSegundo parágrafo: monitores, tempo e materiais.',
    );
    await criarTema(page, 'E2E Tema Simples');

    await page.goto(URL_FESTAS);
    const temas = page.locator('[data-section="Festas/Temas"]');
    const detalhado = temas.getByRole('article').filter({ hasText: 'E2E Tema Detalhado' });
    const simples = temas.getByRole('article').filter({ hasText: 'E2E Tema Simples' });
    await expect(simples).toBeVisible();
    await expect(simples.getByRole('button', { name: /Ver detalhes/ })).toHaveCount(0);

    const botao = detalhado.getByRole('button', { name: /Ver detalhes/ });
    await botao.scrollIntoViewIfNeeded();
    await botao.click();
    const modal = page.getByRole('dialog', { name: 'E2E Tema Detalhado' });
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Primeiro parágrafo: o que acontece na festa.')).toBeVisible();
    await expect(modal.getByText('Segundo parágrafo: monitores, tempo e materiais.')).toBeVisible();
    const wa = await modal
      .getByRole('link', { name: 'Pedir orçamento deste tema' })
      .getAttribute('href');
    expect(decodeURIComponent(wa!)).toContain('tema “E2E Tema Detalhado”');

    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
    await expect(botao).toBeFocused();

    // clicar fora também fecha
    await botao.click();
    await expect(modal).toBeVisible();
    await page.mouse.click(4, 4);
    await expect(modal).toBeHidden();
  });

  test('celular: o modal vira folha inferior, sem rolagem horizontal', async ({ page }) => {
    await entrar(page, 'festa-detalhes-m');
    await criarTema(page, 'E2E Tema Mobile', 'Texto longo da festa.\n\nMais um parágrafo.');

    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto(URL_FESTAS);
    const botao = page.getByRole('button', { name: /Ver detalhes.*E2E Tema Mobile/ });
    await botao.scrollIntoViewIfNeeded();
    await botao.click();
    const modal = page.getByRole('dialog', { name: 'E2E Tema Mobile' });
    await expect(modal).toBeVisible();
    await page.waitForTimeout(500); // fim da entrada
    const box = (await modal.boundingBox())!;
    expect(Math.round(box.width)).toBe(390);
    expect(Math.round(box.y + box.height)).toBe(800);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
});
