import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 3,
  outputDir: '../test-results/landing',
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:8372',
    reducedMotion: 'reduce',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'pnpm exec astro preview --host 127.0.0.1 --port 8372',
    cwd: import.meta.dirname,
    url: 'http://127.0.0.1:8372',
    reuseExistingServer: !process.env.CI,
  },
});
