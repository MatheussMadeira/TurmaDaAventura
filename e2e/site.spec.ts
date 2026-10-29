import { expect, test } from '@playwright/test';

test.describe('pedir orçamento pelo formulário', () => {
  test('erro → corrige → abre o WhatsApp com a mensagem pronta', async ({ page, context }) => {
    // nada sai para a internet: o wa.me é interceptado
    await context.route(/^https:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//, (r) =>
      r.fulfill({ status: 200, contentType: 'text/html', body: 'ok' }),
    );
    await page.goto('/oficina');

    const submit = page.getByRole('button', { name: /Continuar no WhatsApp/ });
    await submit.scrollIntoViewIfNeeded();
    await submit.click();

    // erro: diz o que falta, sem abrir nada
    await expect(page.getByText('Conta pra gente seu nome.')).toBeVisible();
    await expect(page.getByLabel(/^Seu nome/)).toBeFocused();
    expect(context.pages()).toHaveLength(1);

    // corrige e envia: abre o wa.me com o nome na mensagem
    await page.getByLabel(/^Seu nome/).fill('Maria da Silva');
    await page.getByLabel(/Nº de crianças/).fill('25');
    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /Continuar no WhatsApp/ }).click(),
    ]);
    await popup.waitForURL(/wa\.me\//, { timeout: 10_000 });
    const url = decodeURIComponent(popup.url());
    expect(url).toContain('Maria da Silva');
    expect(url).toContain('25');
    expect(url).not.toMatch(/R\$/); // nunca preço
  });
});
