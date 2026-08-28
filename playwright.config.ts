import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 120_000,
  workers: 1,
  // The service-modal tab test drives Finsweet's modal script, which CI pulls
  // from cdn.jsdelivr.net; a slow or failed fetch times out the click and fails
  // the run for reasons that have nothing to do with the site. Retry on CI
  // only — a real regression still fails all three attempts, while locally a
  // failure stays a failure so it can't hide during development.
  retries: process.env.CI ? 2 : 0,
  testDir: './tests',
  expect: {
    timeout: 60_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.001,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:4321',
  },
  projects: [
    {
      name: 'mobile-portrait',
      testMatch: /visual\.spec\.ts/,
      use: { ...devices['Pixel 5'], viewport: { width: 375, height: 800 } },
    },
    {
      name: 'mobile-landscape',
      testMatch: /visual\.spec\.ts/,
      use: { viewport: { width: 640, height: 480 } },
    },
    {
      name: 'tablet',
      testMatch: /visual\.spec\.ts/,
      use: { viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'tablet-large',
      testMatch: /visual\.spec\.ts/,
      use: { viewport: { width: 991, height: 1280 } },
    },
    {
      name: 'desktop',
      testMatch: /visual\.spec\.ts/,
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'desktop-large',
      testMatch: /visual\.spec\.ts/,
      use: { viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'dom',
      testIgnore: /visual\.spec\.ts/,
      use: { viewport: { width: 1440, height: 900 } },
    },
  ],
});
