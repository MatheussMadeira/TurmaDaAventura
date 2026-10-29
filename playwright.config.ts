import { defineConfig, devices } from '@playwright/test';

/**
 * E2E rápido contra o build de produção. Usa o Chrome instalado na máquina (channel: 'chrome'),
 * sem baixar navegador. PLAYWRIGHT_BASE_URL aponta para um servidor já no ar; sem ele,
 * sobe `next build && next start` na porta 3300.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3300';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run build && npm run start -- -p 3300',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 240_000,
      },
});
