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
  'Carrie Toms',
  'Austin Evans',
  'Deborah Jay',
  'Jeff Margulies',
  'Elliott MacIsaac',
  'Will Jameson',
  'Ryan Gillam',
  'Spencer Tanner',
  'Mark Meahl',
  'Alex Ostblom',
  'Jamie Brady',
  'Ramu Veerappan',
];

const expectedTestimonialQuoteFragments = [
  'In a few months with Miri',
];

const expectedExternalLogos = [
  { alt: 'Black Diamond Landscape logo', hrefFragment: 'bdlandscaping' },
  { alt: 'Willis Commercial Landscaping logo', hrefFragment: 'williscommerciallandscaping' },
  { alt: 'Greenfield Capital Partners logo', hrefFragment: 'greenfieldcp' },
  { alt: 'Los Alamos Landscaping logo', hrefFragment: 'losalamoslandscaping' },
];

const expectedDesktopLogoAlts = [
  'WJ Landscape logo',
  'Midlands Landscape logo',
  'MD Property Services logo',
  'Garden View logo',
  'Redwood logo',
  'Branch logo',
  'Energyscapes logo',
  'Cutting Edge logo',
  'Repaymint logo',
  'Osprey Landscape logo',
  'Gillam Lawncare logo',
  'Good Earth Aspen logo',
  'Black Diamond Landscape logo',
  'Willis Commercial Landscaping logo',
  'Greenfield Capital Partners logo',
  'Los Alamos Landscaping logo',
];

const expectedServices = ['Operations', 'Finance', 'Digital', 'HR'];
const expectedHomeNavHrefs = ['#about', '#industries', '#testimonials', '#services', '#people'];
const expectedLegalNavHrefs = expectedHomeNavHrefs.map((href) => `/${href}`);

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

  test('testimonial slider renders one slide per collection entry in order', async ({ page }) => {
    // The native infinite slider clones `slidesPerView` slides on each side
    // for its loop; clones carry data-clone. Real slides = collection entries.
    const slides = page.locator(
      '.section_testimonial23 .testimonial23_slide:not([data-clone])',
    );
    await expect(slides).toHaveCount(expectedTestimonialNames.length);
    const renderedNames = await slides
      .locator('.testimonial23_client-info strong')
      .allTextContents();
    expect(renderedNames.map((s) => s.trim())).toEqual(expectedTestimonialNames);
    // One nav dot per testimonial.
    await expect(
      page.locator('.section_testimonial23 .testimonial23_dot'),
    ).toHaveCount(expectedTestimonialNames.length);
    // Card background colors rotate by position (orange → light-blue →
    // dark-blue). Asserted via computed background-color so the rotation
    // stays honest as entries are added or reordered.
    const cards = page.locator(
      '.section_testimonial23 .testimonial23_slide:not([data-clone]) .testimonial23_card',
    );
    const colorCycle = ['rgb(250, 110, 65)', 'rgb(39, 186, 249)', 'rgb(52, 87, 250)'];
    const bgColors = await cards.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).backgroundColor),
    );
    bgColors.forEach((bg, i) => {
      expect(bg).toBe(colorCycle[i % colorCycle.length]);
    });
    // First testimonial's quote fragment present.
    for (const fragment of expectedTestimonialQuoteFragments) {
      await expect(
        page.locator('.section_testimonial23').getByText(fragment, { exact: false }).first(),
      ).toBeVisible();
    }
  });

  test('testimonial arrows keep cards snapped across responsive breakpoints', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'networkidle' });

    const sliderCases = [
      { label: 'narrow mobile', width: 344, height: 882, expectedVisible: 1 },
      { label: 'mobile max', width: 767, height: 900, expectedVisible: 1 },
      { label: 'tablet min', width: 768, height: 1024, expectedVisible: 2 },
      { label: 'tablet max', width: 991, height: 1024, expectedVisible: 2 },
      { label: 'desktop min', width: 992, height: 900, expectedVisible: 3 },
      { label: 'desktop', width: 1440, height: 900, expectedVisible: 3 },
    ];

    const prev = page.locator('.section_testimonial23 .testimonial23_arrow.is-prev');
    const next = page.locator('.section_testimonial23 .testimonial23_arrow.is-next');
    const firstDot = page.locator('.section_testimonial23 .testimonial23_dot[data-dot="0"]');
    const lastDot = page.locator(
      `.section_testimonial23 .testimonial23_dot[data-dot="${expectedTestimonialNames.length - 1}"]`,
    );
    await expect(prev).toBeVisible();
    await expect(next).toBeVisible();
    await expect(firstDot).toBeVisible();
    await expect(lastDot).toBeVisible();

    async function waitForSlider() {
      // Reduced motion makes transforms immediate; the slider still uses a
      // short timeout to normalize infinite-loop wrap positions.
      await page.waitForTimeout(80);
    }

    async function clickSliderControl(selector: string) {
      await page.evaluate((targetSelector) => {
        const control = document.querySelector<HTMLButtonElement>(targetSelector);
        if (!control) throw new Error(`Missing slider control: ${targetSelector}`);
        control.click();
      }, selector);
    }

    async function expectSnappedCards(label: string, expectedVisible: number) {
      const snap = await page.evaluate((expected) => {
        const section = document.querySelector('.section_testimonial23');
        const viewport = section?.querySelector('.testimonial23_viewport');
        if (!(section instanceof HTMLElement) || !(viewport instanceof HTMLElement)) {
          return {
            expected,
            viewportWidth: 0,
            fullyVisible: [],
            splitVisible: [],
          };
        }

        const viewportRect = viewport.getBoundingClientRect();
        const cards = Array.from(
          section.querySelectorAll<HTMLElement>(
            '.testimonial23_slide .testimonial23_card',
          ),
        ).map((card) => {
          const rect = card.getBoundingClientRect();
          const visibleWidth = Math.max(
            0,
            Math.min(rect.right, viewportRect.right) - Math.max(rect.left, viewportRect.left),
          );
          return {
            width: rect.width,
            visibleWidth,
          };
        });

        return {
          expected,
          viewportWidth: viewportRect.width,
          fullyVisible: cards.filter((card) => Math.abs(card.visibleWidth - card.width) <= 2),
          splitVisible: cards.filter((card) =>
            card.visibleWidth > card.width * 0.25 && card.visibleWidth <= card.width * 0.75,
          ),
        };
      }, expectedVisible);

      expect(snap.viewportWidth, label).toBeGreaterThan(0);
      expect(snap.fullyVisible, label).toHaveLength(expectedVisible);
      expect(snap.splitVisible, label).toHaveLength(0);
    }

    for (const sliderCase of sliderCases) {
      await page.setViewportSize({ width: sliderCase.width, height: sliderCase.height });
      await page.waitForTimeout(180);

      await clickSliderControl('.section_testimonial23 .testimonial23_dot[data-dot="0"]');
      await waitForSlider();
      await expectSnappedCards(`${sliderCase.label}: first slide`, sliderCase.expectedVisible);

      for (let i = 0; i < 3; i++) {
        await clickSliderControl('.section_testimonial23 .testimonial23_arrow.is-next');
        await waitForSlider();
        await expectSnappedCards(`${sliderCase.label}: next ${i + 1}`, sliderCase.expectedVisible);
      }

      await clickSliderControl(
        `.section_testimonial23 .testimonial23_dot[data-dot="${expectedTestimonialNames.length - 1}"]`,
      );
      await waitForSlider();
      await expectSnappedCards(`${sliderCase.label}: last slide`, sliderCase.expectedVisible);

      await clickSliderControl('.section_testimonial23 .testimonial23_arrow.is-next');
      await waitForSlider();
      await expectSnappedCards(`${sliderCase.label}: next wrap`, sliderCase.expectedVisible);

      await clickSliderControl('.section_testimonial23 .testimonial23_arrow.is-prev');
      await waitForSlider();
      await expectSnappedCards(`${sliderCase.label}: previous wrap`, sliderCase.expectedVisible);
    }
  });

  test('client logo marquee renders all 16 collection logos in order', async ({ page }) => {
    // Phase 12.1 made the marquees native components. The desktop marquee is
    // the second .section_logo3 (the first is the mobile variant rendered for
    // .show-mobile-landscape only). Each marquee renders two duplicate lists
    // for the infinite-scroll effect; we inspect the first (visible) list.
    const desktopList = page.locator('.section_logo3:not(.show-mobile-landscape) .logo3_list').first();
    const altsInOrder = await desktopList.locator('img').evaluateAll((els) =>
      els.map((el) => (el as HTMLImageElement).alt),
    );
    expect(altsInOrder).toEqual(expectedDesktopLogoAlts);
  });

  test('client logo marquee external anchors are wired to expected URLs', async ({ page }) => {
    for (const { alt, hrefFragment } of expectedExternalLogos) {
      const anchor = page.locator(`a[href*="${hrefFragment}"]`).first();
      await expect(anchor).toBeAttached();
      await expect(anchor).toHaveAttribute('rel', 'noopener');
      await expect(anchor).toHaveAttribute('target', '_blank');
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

  test('Webflow tab runtime switches home and modal tab groups', async ({ page }) => {
    const serviceTabs = page.locator('.section_layout507 .layout507_tabs.w-tabs');
    await serviceTabs
      .locator(':scope > .w-tab-menu > .w-tab-link[data-w-tab="Tab 2"]')
      .click();
    await expect(
      serviceTabs.locator(':scope > .w-tab-content > .w-tab-pane[data-w-tab="Tab 2"]'),
    ).toHaveClass(/w--tab-active/);

    const industryTabs = page.locator('.section_layout494 .layout493_tabs.w-tabs');
    await industryTabs
      .locator(':scope > .w-tab-menu > .w-tab-link[data-w-tab="Tab 2"]')
      .click();
    await expect(
      industryTabs.locator(':scope > .w-tab-menu > .w-tab-link[data-w-tab="Tab 2"]'),
    ).toHaveClass(/w--current/);
    await expect(
      industryTabs.locator(':scope > .w-tab-menu > .w-tab-link[data-w-tab="Tab 1"] .layout493_paragraph'),
    ).toHaveCSS('height', '0px');

    await page.locator('.team8_item').first().click();
    const teamModalTabs = page.locator(
      '.fs_modal-1_popup-2.team-modal-popup:visible .layout494_tabs.w-tabs',
    );
    await teamModalTabs
      .locator(':scope > .w-tab-menu > .w-tab-link[data-w-tab="Tab 2"]')
      .click();
    await expect(
      teamModalTabs.locator(':scope > .w-tab-menu > .w-tab-link[data-w-tab="Tab 2"]'),
    ).toHaveClass(/w--current/);
    await expect(
      teamModalTabs.locator(':scope > .w-tab-menu > .w-tab-link[data-w-tab="Tab 1"] .layout494_paragraph'),
    ).toHaveCSS('height', '0px');

    await page.locator('.fs_modal-1_popup-2.team-modal-popup:visible .fs_modal-1_close-2').click();
    await expect(page.locator('.fs_modal-1_popup-2.team-modal-popup:visible')).toHaveCount(0);
    await serviceTabs.locator(':scope > .w-tab-content > .w-tab-pane.w--tab-active a[fs-modal-element]').click();
    const serviceModalTabs = page.locator(
      '.fs_modal-1_popup-2.service-modal-popup:visible .layout493_tabs.w-tabs',
    );
    await serviceModalTabs
      .locator(':scope > .w-tab-menu > .w-tab-link[data-w-tab="Tab 2"]')
      .click();
    await expect(
      serviceModalTabs.locator(':scope > .w-tab-menu > .w-tab-link[data-w-tab="Tab 2"]'),
    ).toHaveClass(/w--current/);
    await expect(
      serviceModalTabs.locator(':scope > .w-tab-menu > .w-tab-link[data-w-tab="Tab 1"] .layout493_paragraph'),
    ).toHaveCSS('height', '0px');
  });

  test('home header and footer links use local section anchors', async ({ page }) => {
    const navHrefs = await page.locator('.navbar2_menu .navbar2_link').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href')),
    );
    expect(navHrefs).toEqual(expectedHomeNavHrefs);
    await expect(page.locator('.navbar2_logo-link')).toHaveAttribute('href', '#header');

    const footerHrefs = await page.locator('.footer7_link-list .footer7_link:not(.is-secondary)').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href')),
    );
    expect(footerHrefs).toEqual(expectedHomeNavHrefs);
    await expect(page.locator('.footer7_logo-link')).toHaveAttribute('href', '#header');
  });

  test('legal-page navigation and back-home links point to the home page', async ({ page }) => {
    for (const legalPath of ['/privacy-policy', '/terms-of-service']) {
      await page.goto(legalPath, { waitUntil: 'networkidle' });

      const navHrefs = await page.locator('.navbar2_menu .navbar2_link').evaluateAll((els) =>
        els.map((el) => el.getAttribute('href')),
      );
      expect(navHrefs).toEqual(expectedLegalNavHrefs);
      await expect(page.locator('.navbar2_logo-link')).toHaveAttribute('href', '/#header');

      const backHome = page.getByRole('link', { name: 'Back to Home' });
      await expect(backHome).toBeVisible();
      await expect(backHome).toHaveAttribute('href', '/');
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
