import { expect, test, type Page } from '@playwright/test';

/**
 * Menu com 7 itens (Início · Oficinas · Festas · Restaurantes · Eventos · Produtos · Quem somos).
 * Menu completo só a partir de 1180px de largura do cabeçalho; abaixo disso vira sanfona.
 */
const MIN_GAP = 16; // folga mínima entre o último item e o botão Orçamento

async function measure(page: Page) {
  const nav = page.getByRole('navigation', { name: 'Principal' });
  const links = nav.getByRole('link');
  const boxes = [];
  for (let i = 0; i < (await links.count()); i++) boxes.push(await links.nth(i).boundingBox());
  const cta = page
    .locator('header')
    .getByRole('link', { name: /Orçamento/ })
    .first();
  return { links, boxes, ctaBox: await cta.boundingBox(), count: await links.count() };
}

for (const width of [1180, 1280, 1440]) {
  test(`${width}px: menu completo em uma linha, sem encostar no botão`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await expect(page.getByRole('button', { name: /menu/i })).toBeHidden();

    const { boxes, ctaBox, count } = await measure(page);
    expect(count).toBe(7);
    const ys = boxes.map((b) => Math.round(b!.y));
    expect(new Set(ys).size).toBe(1); // todos na mesma linha
    const heights = boxes.map((b) => b!.height);
    expect(Math.max(...heights)).toBeLessThan(60); // nenhum item quebrou em duas linhas

    const last = boxes[boxes.length - 1]!;
    expect(ctaBox!.x - (last.x + last.width)).toBeGreaterThanOrEqual(MIN_GAP);
    // e o menu não passa da borda da janela
    expect(ctaBox!.x + ctaBox!.width).toBeLessThanOrEqual(width);
  });
}

for (const width of [1024, 1179]) {
  test(`${width}px: vira sanfona; o menu abre com os 7 itens`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Abrir menu' });
    await expect(toggle).toBeVisible();

    await toggle.click();
    await expect(page.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    const nav = page.getByRole('navigation', { name: 'Principal' });
    await expect(nav.getByRole('link')).toHaveCount(7);
    for (const name of [
      'Início',
      'Oficinas',
      'Festas',
      'Restaurantes',
      'Eventos',
      'Produtos',
      'Quem somos',
    ]) {
      await expect(nav.getByRole('link', { name, exact: true })).toBeVisible();
    }
    // alvos de 52px no menu aberto
    const box = await nav.getByRole('link', { name: 'Festas', exact: true }).boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
}

test('1280px: o sublinhado animado acompanha "Festas" e a página ativa', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/festas-e-aniversarios');
  const nav = page.getByRole('navigation', { name: 'Principal' });
  const festas = nav.getByRole('link', { name: 'Festas', exact: true });
  await expect(festas).toHaveAttribute('aria-current', 'page');
  const indicator = nav.locator('[data-phase]');
  await expect(indicator).toHaveAttribute('data-phase', 'on');
  const f = (await festas.boundingBox())!;
  const i = (await indicator.boundingBox())!;
  expect(Math.abs(i.x - (f.x + 12))).toBeLessThan(3);
});

test('no rodapé, os nomes por extenso: "Festas e aniversários" e "Eventos corporativos"', async ({
  page,
}) => {
  await page.goto('/');
  const footer = page.getByRole('navigation', { name: 'Rodapé' });
  await expect(footer.getByRole('link', { name: 'Festas e aniversários' })).toHaveAttribute(
    'href',
    '/festas-e-aniversarios',
  );
  await expect(footer.getByRole('link', { name: 'Eventos corporativos' })).toHaveAttribute(
    'href',
    '/eventos-corporativos',
  );
  await expect(footer.getByRole('link', { name: 'Produtos' })).toHaveAttribute('href', '/produtos');
});
