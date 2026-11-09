import { expect, test } from '@playwright/test';

const trigger = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: /Trilha aberta por Matheus Madeira/ });

test.describe('assinatura do criador', () => {
  test('abre a ficha, Esc fecha e o foco volta ao gatilho', async ({ page }) => {
    await page.goto('/');
    const t = trigger(page);
    await expect(t).toHaveAttribute('aria-expanded', 'false');
    await t.scrollIntoViewIfNeeded();
    await t.click();

    const dialog = page.getByRole('dialog', { name: 'Matheus Madeira' });
    await expect(dialog).toBeVisible();
    await expect(t).toHaveAttribute('aria-expanded', 'true');
    await expect(dialog.getByRole('link', { name: 'Ver LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/matheus-madeira22/',
    );
    await expect(dialog.getByRole('link', { name: 'Ver GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/MatheussMadeira',
    );

    const wa = await dialog.getByRole('link', { name: 'Chamar no WhatsApp' }).getAttribute('href');
    expect(wa).toMatch(/^https:\/\/wa\.me\/5531996193940\?text=/);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(t).toHaveAttribute('aria-expanded', 'false');
    await expect(t).toBeFocused();
  });

  test('clicar fora fecha; o botão Fechar também', async ({ page }) => {
    await page.goto('/oficinas');
    await trigger(page).click();
    const dialog = page.getByRole('dialog', { name: 'Matheus Madeira' });
    await expect(dialog).toBeVisible();
    await page.mouse.click(4, 4); // sobre o fundo escurecido
    await expect(dialog).toBeHidden();

    await trigger(page).click();
    await dialog.getByRole('button', { name: 'Fechar' }).click();
    await expect(dialog).toBeHidden();
    await expect(trigger(page)).toBeFocused();
  });

  test('celular: o diálogo vira folha inferior, sem rolagem horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/');
    await trigger(page).click();
    const dialog = page.getByRole('dialog', { name: 'Matheus Madeira' });
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(500); // fim da entrada
    const box = (await dialog.boundingBox())!;
    expect(Math.round(box.width)).toBe(390);
    expect(Math.round(box.y + box.height)).toBe(800);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });

  test('aparece uma vez no site e não aparece no /admin', async ({ page }) => {
    await page.goto('/');
    await expect(trigger(page)).toHaveCount(1);
    await page.goto('/admin/login');
    await expect(trigger(page)).toHaveCount(0);
  });
});
