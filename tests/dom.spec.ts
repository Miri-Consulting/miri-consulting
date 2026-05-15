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

  test('service cards and modals use content-driven images and alt text', async ({ page }) => {
    // Each service uses one image for both its card and its modal (matching prod).
    // Phase 11 wires cardImage from content into both slots; modalImageAlt is
    // still applied to the modal alt so modal heading context is preserved.
    const expectedCardAlts = [
      'Optimize Your Workflow',
      'Trust Your Numbers',
      'Elevate Your Presence',
      'Build Stronger Teams',
    ];
    const expectedModalAlts = [
      'Operations Management Consulting',
      'Comprehensive Financial Management',
      'Digital Design & Solutions Architecture',
      'Human Resource Consulting',
    ];

    const tabPaneImages = page.locator(
      '.layout507_tabs.w-tabs .layout507_tab-pane .layout507_image-wrapper img',
    );
    await expect(tabPaneImages).toHaveCount(expectedCardAlts.length);
    const cardAlts = await tabPaneImages.evaluateAll((els) =>
      els.map((el) => (el as HTMLImageElement).alt),
    );
    expect(cardAlts).toEqual(expectedCardAlts);
    const cardSrcs = await tabPaneImages.evaluateAll((els) =>
      els.map((el) => (el as HTMLImageElement).getAttribute('src') ?? ''),
    );
    for (const src of cardSrcs) {
      expect(src).toMatch(/^\/_assets\//);
    }

    // Service modals (4 of them) live before the team modals. Identify each
    // service modal by its <h2 class="heading-style-h3"> (team modals use h3).
    const serviceModalH2s = page.locator('div.fs_modal-1_popup-2 h2.heading-style-h3');
    await expect(serviceModalH2s).toHaveCount(4);
    for (let i = 0; i < expectedModalAlts.length; i++) {
      const modal = serviceModalH2s.nth(i).locator('xpath=ancestor::div[contains(@class, "fs_modal-1_popup-2")]');
      const modalImage = modal.locator('.layout507_image-wrapper img').first();
      const alt = await modalImage.getAttribute('alt');
      expect(alt).toBe(expectedModalAlts[i]);
      const src = await modalImage.getAttribute('src');
      expect(src).toMatch(/^\/_assets\//);
      // Modal src equals the matching card src (one image per service).
      expect(src).toBe(cardSrcs[i]);
    }
  });

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
