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
    // Block CookieYes entirely so its async-injected widgets (the main banner
    // plus the inline "Manage Settings" pill that occasionally shows up next
    // to consent-related links) can't drift the screenshot. The #cookieyes
    // mask only covers the main banner element; inline widgets fall outside
    // it. Blocking the script guarantees zero CookieYes DOM, which is the
    // only deterministic state for a static visual baseline. Production
    // behavior is unaffected — only this test environment skips the loader.
    await page.route('**/cdn-cookieyes.com/**', (route) => route.abort());
    await page.goto(pageInfo.path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // .spline-scene is the only remaining mask. The 3D scene render is
    // non-deterministic frame-to-frame. The logo marquee unmasked at Phase
    // 12.1; the testimonial slider unmasked at Phase 12.2 — Webflow's slider
    // auto-advances when data-autoplay="true" but our data-autoplay="false" +
    // Playwright's animations: 'disabled' keeps it on slide 1 deterministically.
    const masks = [page.locator('.spline-scene')];
    await expect(page).toHaveScreenshot(`${pageInfo.name}.png`, {
      fullPage: true,
      mask: masks,
      maxDiffPixelRatio: pageInfo.name === 'home' ? 0.04 : 0.001,
    });
  });
}
