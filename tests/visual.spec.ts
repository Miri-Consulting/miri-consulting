import { test, expect } from '@playwright/test';

const pages = [
  { name: 'home', path: '/' },
  { name: 'aspire-landscape', path: '/aspire-consulting-for-landscape-companies' },
  { name: 'privacy', path: '/privacy-policy' },
  { name: 'terms', path: '/terms-of-service' },
];

for (const pageInfo of pages) {
  test(`${pageInfo.name} matches baseline`, async ({ page }) => {
    await page.route('**/haqt6iy0yx2eNjRmMzYzYjRiYTBmYzEzNjIzNjI4MjRm/**', (route) => route.abort());
    await page.goto(pageInfo.path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // .spline-scene and #cookieyes are the only remaining masks. Both involve
    // non-deterministic external state (3D scene render, third-party cookie
    // banner). The logo marquee unmasked at Phase 12.1; the testimonial
    // slider unmasked at Phase 12.2 — Webflow's slider auto-advances when
    // data-autoplay="true" but our data-autoplay="false" + Playwright's
    // animations: 'disabled' keeps it on slide 1 deterministically.
    const masks = [page.locator('.spline-scene'), page.locator('#cookieyes')];
    await expect(page).toHaveScreenshot(`${pageInfo.name}.png`, {
      fullPage: true,
      mask: masks,
      maxDiffPixelRatio: pageInfo.name === 'home' ? 0.04 : 0.001,
    });
  });
}
