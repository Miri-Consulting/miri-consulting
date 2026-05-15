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
    const masks = [
      page.locator('.spline-scene'),
      page.locator('.section_logo3'),
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
