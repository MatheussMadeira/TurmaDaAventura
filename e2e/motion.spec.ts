import { expect, test, type Locator } from '@playwright/test';

const box = async (l: Locator) => {
  const b = await l.boundingBox();
  if (!b) throw new Error('elemento sem caixa (invisível?)');
  return b;
};

test.describe('Oficina — filtro', () => {
  test('a pílula desliza do chip antigo para o novo (layoutId)', async ({ page }) => {
    await page.goto('/oficina');
    const group = page.getByRole('group', { name: 'Filtrar atividades por categoria' });
    const todas = group.getByRole('button', { name: /^Todas/ });
    const natureza = group.getByRole('button', { name: /^Natureza/ });
    const pill = group.locator('button[aria-pressed="true"] > span[aria-hidden="true"]');

    await expect(todas).toHaveAttribute('aria-pressed', 'true');
    // o domMax carrega sob demanda nesta rota: espera a pílula assentar antes de medir
    await expect(pill).toBeVisible();
    await page.waitForTimeout(400);
    const before = await box(pill);
    const to = await box(natureza);
    expect(Math.abs(before.x - to.x)).toBeGreaterThan(50);

    // amostra a posição da pílula a cada frame durante a troca
    const samples = await page.evaluate(async () => {
      const read = () =>
        document
          .querySelector('[role="group"] button[aria-pressed="true"] > span[aria-hidden="true"]')
          ?.getBoundingClientRect().x ?? NaN;
      const out: number[] = [];
      const chip = [...document.querySelectorAll('[role="group"] button')].find((b) =>
        /^Natureza/.test(b.textContent ?? ''),
      ) as HTMLButtonElement;
      chip.click();
      const start = performance.now();
      await new Promise<void>((resolve) => {
        const tick = () => {
          out.push(read());
          if (performance.now() - start < 700) requestAnimationFrame(tick);
          else resolve();
        };
        tick();
      });
      return out;
    });

    await expect(natureza).toHaveAttribute('aria-pressed', 'true');
    const after = await box(pill);

    // mudou de posição: terminou em cima do chip novo, longe de onde começou
    expect(Math.abs(after.x - before.x)).toBeGreaterThan(50);
    expect(Math.abs(after.x - (await box(natureza)).x)).toBeLessThan(2);
    // e deslizou: houve ao menos uma posição intermediária (nem a inicial, nem a final)
    const lo = Math.min(before.x, after.x);
    const hi = Math.max(before.x, after.x);
    expect(samples.some((x) => x > lo + 4 && x < hi - 4)).toBe(true);

    await expect(page.getByRole('status')).toHaveText(/Mostrando 2 atividades/);
  });
});

test.describe('Header — indicador do menu', () => {
  test('acompanha o mouse entre dois links', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Principal' });
    const indicator = nav.locator('[data-phase]');
    const oficina = nav.getByRole('link', { name: 'Oficina', exact: true });
    const restaurantes = nav.getByRole('link', { name: 'Restaurantes', exact: true });

    await expect(indicator).toHaveAttribute('data-phase', 'on'); // já desenhado na página ativa

    await oficina.hover();
    await expect
      .poll(async () => Math.round((await box(indicator)).x), { timeout: 3000 })
      .toBe(Math.round((await box(oficina)).x + 12));
    const first = await box(indicator);

    await restaurantes.hover();
    const target = await box(restaurantes);
    await expect
      .poll(async () => Math.round((await box(indicator)).x), { timeout: 3000 })
      .toBe(Math.round(target.x + 12));
    const second = await box(indicator);

    expect(second.x).toBeGreaterThan(first.x + 20); // se moveu
    expect(second.width).toBeGreaterThan(first.width); // "Restaurantes" é mais largo que "Oficina"
    expect(Math.abs(second.width - (target.width - 24))).toBeLessThan(2);
  });

  test('volta para a página ativa quando o mouse sai', async ({ page }) => {
    await page.goto('/oficina');
    const nav = page.getByRole('navigation', { name: 'Principal' });
    const indicator = nav.locator('[data-phase]');
    const oficina = nav.getByRole('link', { name: 'Oficina', exact: true });
    const quem = nav.getByRole('link', { name: 'Quem somos', exact: true });

    await quem.hover();
    await expect
      .poll(async () => Math.round((await box(indicator)).x))
      .toBe(Math.round((await box(quem)).x + 12));
    await page.mouse.move(600, 400);
    await expect
      .poll(async () => Math.round((await box(indicator)).x))
      .toBe(Math.round((await box(oficina)).x + 12));
  });
});
