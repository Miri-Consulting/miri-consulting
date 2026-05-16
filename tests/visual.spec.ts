import { test, expect } from '@playwright/test';

const pages = [
  { name: 'home', path: '/' },
  { name: 'aspire-landscape', path: '/aspire-consulting-for-landscape-companies.html' },
  { name: 'privacy', path: '/privacy-policy.html' },
  { name: 'terms', path: '/terms-of-service.html' },
];

for (const pageInfo of pages) {
  test(`${pageInfo.name} matches baseline`, async ({ page }) => {
    await page.route('**/haqt6iy0yx2eNjRmMzYzYjRiYTBmYzEzNjIzNjI4MjRm/**', (route) => route.abort());
    await page.goto(pageInfo.path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // .section_logo3 was masked because the marquee animates infinitely; with
    // Playwright's `animations: 'disabled'` and the marquee now content-driven
    // (Phase 12.1), the CSS-keyframe animation pins to the initial frame and
    // the screenshot is deterministic, so the mask is gone. Spline scene and
    // CookieYes still mask because they're non-deterministic external state;
    // testimonials still mask until Phase 12.2 (slider goes native).
    const masks = [
      page.locator('.spline-scene'),
      page.locator('.testimonial_slider'),
      page.locator('#cookieyes'),
    ];
    await expect(page).toHaveScreenshot(`${pageInfo.name}.png`, {
      fullPage: true,
      mask: masks,
      maxDiffPixelRatio: pageInfo.name === 'home' ? 0.04 : 0.001,
    });
  });
}
