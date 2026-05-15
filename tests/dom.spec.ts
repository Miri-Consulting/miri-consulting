import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const expectedTeam = [
  'Ramel Sanchez',
  'Keenan Baird',
  'Amber Shoap',
  'Daniel Shoap',
  'Benjamin Harwood',
  'Nauman Nadeem',
  'Kelvin Man',
  'Mika Sanchez',
  'Rachel Garner',
  'Arianne Rabbitt',
];

const expectedTestimonialNames = [
  'Will Jameson',
  'Elliott MacIsaac',
  'Mark Meahl',
  'Alex Ostblom',
  'Jamie Brady',
  'Ramu Veerappan',
];

const expectedTestimonialQuoteFragments = [
  'Working with Miri has been one of the best decisions',
];

const expectedHardcodedLogos = [
  { alt: 'Black Diamond Landscape logo', hrefFragment: 'bdlandscaping' },
  { alt: 'Willis Commercial Landscaping logo', hrefFragment: 'williscommerciallandscaping' },
  { alt: 'Greenfield Capital Partners logo', hrefFragment: 'greenfieldcp' },
  { alt: 'Los Alamos Landscaping logo', hrefFragment: 'losalamoslandscaping' },
];

const expectedServices = ['Operations', 'Finance', 'Digital', 'HR'];

test.describe('home page DOM', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/haqt6iy0yx2eNjRmMzYzYjRiYTBmYzEzNjIzNjI4MjRm/**', (route) =>
      route.abort(),
    );
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('team grid renders all 10 cards in content collection order', async ({ page }) => {
    const cards = page.locator('.team8_list .team8_item');
    await expect(cards).toHaveCount(expectedTeam.length);

    const renderedNames = await cards
      .locator('.team8_title-wrapper .text-weight-semibold')
      .allTextContents();
    expect(renderedNames.map((s) => s.trim())).toEqual(expectedTeam);
  });

  test('team grid headshots have alt text matching the team name', async ({ page }) => {
    const images = page.locator('.team8_list .team8_image');
    const alts = await images.evaluateAll((els) =>
      els.map((el) => (el as HTMLImageElement).alt),
    );
    expect(alts).toEqual(expectedTeam);
  });

  test('each testimonial collection entry renders at least once', async ({ page }) => {
    const slider = page.locator('.section_testimonial23');
    for (const name of expectedTestimonialNames) {
      await expect(slider.getByText(name).first()).toBeVisible();
    }
    for (const fragment of expectedTestimonialQuoteFragments) {
      await expect(slider.getByText(fragment, { exact: false }).first()).toBeVisible();
    }
  });

  test('client logo marquee retains the four hardcoded brand anchors', async ({ page }) => {
    // Phase 11 moves Greenfield into the client-logos collection and drops the
    // hardcoded <a> wrappers entirely. Update this test in lockstep with that.
    for (const { alt, hrefFragment } of expectedHardcodedLogos) {
      const anchor = page.locator(`a[href*="${hrefFragment}"]`).first();
      await expect(anchor).toBeAttached();
      await expect(anchor.locator('img')).toHaveAttribute('alt', alt);
    }
  });

  test('service tabs render all four services', async ({ page }) => {
    for (const service of expectedServices) {
      await expect(
        page.locator('.section_layout507').getByText(service, { exact: false }).first(),
      ).toBeVisible();
    }
  });

  // Phase 11 will wire content `cardImage` / `modalImage` into the rendered HTML.
  // Until then, service images come from hardcoded Webflow CDN URLs in the partial
  // and alt text does not match content frontmatter.
  test.fixme(
    'service card and modal images use content frontmatter alt text (Phase 11)',
    async () => {
      // Activate after applyServiceSummaries/applyServiceModals are extended in Phase 11.
    },
  );

  test('built HTML does not reference orphan or capture-folder paths', async () => {
    const distHtml = path.resolve('dist/index.html');
    if (!existsSync(distHtml)) {
      test.skip(true, 'dist/index.html not built; run `npm run build` first');
    }
    const html = readFileSync(distHtml, 'utf8');
    // Truly orphan / capture-folder relative paths. Live external CDN URLs
    // (https://assets.calendly.com/..., https://ajax.googleapis.com/...) are
    // intentionally present and should not be flagged here — Phase 13 will
    // remove those capture folders and the rewriting logic that aliases them.
    const forbidden = ['local-team-images/'];
    for (const fragment of forbidden) {
      expect(html, `dist/index.html should not contain ${fragment}`).not.toContain(fragment);
    }
  });
});
