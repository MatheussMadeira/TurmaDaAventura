import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { GOOD, cleanup, deleteTestProducts, makeUser } from './fixtures';

test.afterAll(async () => {
  await deleteTestProducts();
  await cleanup();
});

/** Nada sai para a internet: o wa.me é interceptado. */
async function stubWhatsapp(context: BrowserContext) {
  await context.route(/^https:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//, (r) =>
    r.fulfill({ status: 200, contentType: 'text/html', body: 'ok' }),
  );
}

const add = (page: Page, name: string) =>
  page.getByRole('button', { name: new RegExp(`Adicionar à sacola.*${name}`) }).click();

const card = (page: Page, name: string) => page.getByRole('article', { name });

test.describe('página Produtos', () => {
  test('um H1, 9 produtos, filtro por categoria e nenhum preço', async ({ page, request }) => {
    await page.goto('/produtos');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Lembrancinhas e kits da Turma',
    );
    await expect(page.locator('[data-section="Produtos/Catalogo"] article')).toHaveCount(9);
    await expect(page.getByText('Nenhum pagamento é feito no site').first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/R\$|reais/);

    await page.getByRole('button', { name: /Kits de atividade/ }).click();
    await expect(page.getByText(/^Mostrando \d+ produtos?$/)).toHaveText('Mostrando 3 produtos');

    // JSON-LD: ItemList/Product e nenhum offers/price
    const html = await (await request.get('/produtos')).text();
    const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => m[1]!)
      .find((t) => t.includes('"ItemList"'));
    expect(ld).toBeTruthy();
    expect(ld).not.toMatch(/offers|price/i);

    // menu e sitemap
    expect(await (await request.get('/sitemap.xml')).text()).toContain('/produtos');
    await expect(
      page.getByRole('navigation', { name: 'Principal' }).getByRole('link', {
        name: 'Produtos',
        exact: true,
      }),
    ).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('sacola', () => {
  test('adicionar 2 produtos → ajustar quantidade → abrir sacola → enviar', async ({
    page,
    context,
  }) => {
    await stubWhatsapp(context);
    await page.goto('/produtos');

    // sem itens: o WhatsApp flutuante
    await expect(page.getByRole('button', { name: /Ver sacola/ })).toHaveCount(0);

    await add(page, 'Kit mini horta'); // mínimo 10
    await add(page, 'Massinha natural'); // mínimo 1
    const horta = card(page, 'Kit mini horta');
    await expect(horta.getByRole('group', { name: /Quantidade/ })).toContainText('10');
    await horta.getByRole('button', { name: 'Aumentar' }).click();
    await horta.getByRole('button', { name: 'Aumentar' }).click();
    await expect(horta.getByRole('group')).toContainText('12');
    const massinha = card(page, 'Massinha natural');
    await massinha.getByRole('button', { name: 'Aumentar' }).click();

    const fab = page.getByRole('button', { name: 'Ver sacola, 2 produtos' });
    await expect(fab).toBeVisible();
    // o WhatsApp flutuante não aparece junto
    await expect(page.locator('a[aria-label^="Falar com a Turma"]')).toHaveCount(0);

    await fab.click();
    const drawer = page.getByRole('dialog', { name: 'Sua sacola' });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('group', { name: 'Quantidade de Kit mini horta' })).toContainText(
      '12',
    );
    await drawer.getByLabel('Seu nome').fill('Mariana');
    await drawer.getByLabel(/Para quando/).fill('2026-12-12');
    await drawer.getByLabel(/Personalização e observações/).fill('Nome da Laura nas plaquinhas.');

    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      drawer.getByRole('button', { name: 'Enviar pedido no WhatsApp' }).click(),
    ]);
    await popup.waitForURL(/wa\.me\//, { timeout: 10_000 });
    const text = new URL(popup.url()).searchParams.get('text')!;
    expect(text).toBe(
      [
        'Olá, Turma da Aventura! Quero fazer um pedido pelo site:',
        '',
        '• 12 × Kit mini horta',
        '• 2 × Massinha natural',
        '',
        'Nome: Mariana',
        'Para quando: 12/12/2026',
        'Observações: Nome da Laura nas plaquinhas.',
      ].join('\n'),
    );
    expect(text).not.toMatch(/R\$|total|frete|pagamento/i);

    // esvaziou, o WhatsApp flutuante voltou e dá para desfazer
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Ver sacola/ })).toHaveCount(0);
    await expect(page.getByText('Pedido enviado.')).toBeVisible();
    await page.getByRole('button', { name: 'Desfazer' }).click();
    await expect(page.getByRole('button', { name: 'Ver sacola, 2 produtos' })).toBeVisible();
  });

  test('sobrevive a recarregar e vale em todas as páginas do site', async ({ page }) => {
    await page.goto('/produtos');
    await add(page, 'Saquinho do explorador');
    await expect(page.getByRole('button', { name: 'Ver sacola, 1 produto' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: 'Ver sacola, 1 produto' })).toBeVisible();
    await expect(card(page, 'Saquinho do explorador').getByText('Na sacola')).toBeVisible();

    await page.goto('/restaurantes');
    await expect(page.getByRole('button', { name: 'Ver sacola, 1 produto' })).toBeVisible();
  });

  test('o botão da sacola some enquanto o formulário de orçamento está na tela', async ({
    page,
  }) => {
    await page.goto('/produtos');
    await add(page, 'Massinha natural');
    await page.goto('/oficinas');
    const fab = page.getByRole('button', { name: /Ver sacola/ });
    await expect(fab).toBeVisible();
    await page.getByRole('button', { name: /Continuar no WhatsApp/ }).scrollIntoViewIfNeeded();
    await expect(fab).toBeHidden();
  });

  test('gaveta: Esc fecha, o foco fica preso e volta ao botão', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/produtos');
    await add(page, 'Massinha natural');
    const fab = page.getByRole('button', { name: /Ver sacola/ });
    await fab.click();
    const drawer = page.getByRole('dialog', { name: 'Sua sacola' });
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAttribute('aria-modal', 'true');

    // gaveta lateral de 440px, colada à direita (depois da entrada de 24px)
    await page.waitForTimeout(400);
    const box = (await drawer.boundingBox())!;
    expect(Math.round(box.width)).toBe(440);
    expect(Math.round(box.x + box.width)).toBe(1440);

    // Tab circula dentro da gaveta
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab');
      expect(await drawer.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(drawer).toHaveCount(0);
    await expect(fab).toBeFocused();
  });

  test('celular: a gaveta vira folha inferior, de ponta a ponta', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/produtos');
    await add(page, 'Massinha natural');
    await page.getByRole('button', { name: /Ver sacola/ }).click();
    const drawer = page.getByRole('dialog', { name: 'Sua sacola' });
    await expect(drawer).toBeVisible();
    await page.waitForTimeout(400); // fim da entrada
    const box = (await drawer.boundingBox())!;
    expect(Math.round(box.width)).toBe(390);
    expect(Math.round(box.y + box.height)).toBe(800);
    await expect(drawer.getByRole('button', { name: 'Enviar pedido no WhatsApp' })).toBeVisible();
    // sem rolagem horizontal
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
});

test.describe('Produtos no admin', () => {
  test('Equipe cria um produto esgotado: aparece no site sem o botão; e some ao excluir', async ({
    page,
    request,
  }) => {
    const u = await makeUser('prod', { role: 'EQUIPE' });
    await page.goto('/admin/login');
    await page.getByLabel('E-mail').fill(u.email);
    await page.getByLabel('Senha').fill(GOOD);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await expect(
      page.getByRole('navigation', { name: 'Painel' }).getByRole('link', { name: /Produtos/ }),
    ).toBeVisible();
    await page.goto('/admin/produtos');
    await expect(page.getByRole('link', { name: /^No site/ })).toBeVisible();
    await page.getByRole('link', { name: 'Novo produto' }).first().click();

    await page.getByLabel(/^Nome/).fill('E2E Kit do Luar');
    await page.getByLabel(/^Descrição curta/).fill('Lanterninha e mapa estrelado para a noite.');
    await page.getByLabel(/^Descrição da foto/).fill('Lanterna de papel sobre um mapa');
    await page.getByLabel(/^Quantidade mínima/).fill('5');
    // o input fica sob a trilha do switch: clica no rótulo
    await page.getByText(/^Esgotado \(aparece/).click();
    await expect(page.getByRole('switch', { name: /Esgotado/ })).toBeChecked();
    // não existe campo de preço
    await expect(page.getByLabel(/pre[çc]o|valor/i)).toHaveCount(0);
    await page.getByRole('button', { name: 'Salvar e publicar' }).click();
    await expect(page).toHaveURL(/\/admin\/produtos\/(?!novo)/);

    const html = await (await request.get('/produtos')).text();
    expect(html).toContain('E2E Kit do Luar');
    expect(html).toContain('Esgotado');

    await page.goto('/produtos');
    const c = page.getByRole('article', { name: 'E2E Kit do Luar' });
    await expect(c.getByText('Esgotado')).toBeVisible();
    await expect(c.getByRole('button', { name: /Adicionar/ })).toHaveCount(0);

    await page.goto('/admin/produtos?aba=esgotados');
    await page.getByRole('button', { name: 'Excluir E2E Kit do Luar' }).click();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Excluir', exact: true })
      .click();
    await expect(page.getByRole('button', { name: 'Excluir E2E Kit do Luar' })).toHaveCount(0);
    const after = await (await request.get('/produtos')).text();
    expect(after).not.toContain('E2E Kit do Luar');
  });

  test('Contato e WhatsApp tem o início da mensagem da sacola (só Administração)', async ({
    page,
  }) => {
    const u = await makeUser('prod-adm', { role: 'ADMIN' });
    await page.goto('/admin/login');
    await page.getByLabel('E-mail').fill(u.email);
    await page.getByLabel('Senha').fill(GOOD);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto('/admin/contato');
    await expect(page.getByLabel(/Produtos · início da mensagem da sacola/)).toHaveValue(
      /Quero fazer um pedido pelo site/,
    );
  });
});
