import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 120_000,
  workers: 1,
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
      use: { ...devices['Pixel 5'], viewport: { width: 375, height: 800 } },
    },
    { name: 'mobile-landscape', use: { viewport: { width: 640, height: 480 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'tablet-large', use: { viewport: { width: 991, height: 1280 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'desktop-large', use: { viewport: { width: 1920, height: 1080 } } },
  ],
});
