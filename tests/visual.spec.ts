import { test, expect } from './fixtures';

// Visual screenshots are OS-specific: baselines are committed per platform
// (*-darwin.png for local macOS dev, *-linux.png for CI). The CI `visual` job
// runs this spec inside the pinned Playwright Docker image so its rendering
// matches the committed *-linux.png baselines.

const pages = [
  { name: 'home', path: '/' },
  { name: 'products', path: '/products' },
  { name: 'aspire-landscape', path: '/aspire-consulting-for-landscape-companies' },
  { name: 'privacy', path: '/privacy-policy' },
  { name: 'terms', path: '/terms-of-service' },
];

for (const pageInfo of pages) {
  test(`${pageInfo.name} matches baseline`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto(pageInfo.path, { waitUntil: 'networkidle' });
    // The fixture blocks the Spline runtime, and the loader hides the scene
    // whenever its failed load lands — sometimes before the screenshot,
    // sometimes after. Hide it up front instead. The scene sits absolutely
    // behind the hero, so this is the production fallback look, and the hero
    // copy it used to mask is now compared too.
    await page.addStyleTag({ content: '.spline-scene { display: none !important; }' });
    // Inter arrives through the WebFont loader, which injects its stylesheet
    // asynchronously; `document.fonts.ready` resolves at once if that hasn't
    // happened yet, and the capture reflowed in the fallback font. The loader
    // marks <html> wf-active (or wf-inactive) only when it has finished.
    await page.waitForFunction(() => /\bwf-(in)?active\b/.test(document.documentElement.className));
    // A full-page capture never scrolls, so lazy images below the fold raced
    // it: the services image and team headshots came out blank, half-painted,
    // or whole depending on timing. Load them all, then decode every one so
    // the capture paints finished pixels.
    await page.evaluate(async () => {
      for (const img of document.querySelectorAll('img[loading="lazy"]')) img.setAttribute('loading', 'eager');
      await Promise.all(
        [...document.images]
          .filter((img) => !img.complete)
          .map(
            (img) =>
              new Promise((done) => {
                img.addEventListener('load', done, { once: true });
                img.addEventListener('error', done, { once: true });
              }),
          ),
      );
      await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
      await document.fonts.ready;
    });
    // Webflow's interactions runtime collapses every home industry-tab
    // paragraph on start and opens the active one only when the section
    // scrolls into view. A full-page capture resizes the viewport to the whole
    // page, which could fire that open animation mid-capture (the page ~100px
    // taller or shorter run to run). Scroll it into view, wait for the
    // finished state — active paragraph open with its inline height removed,
    // the rest at 0 — then return to the top.
    await page.evaluate(() => document.getElementById('industries')?.scrollIntoView());
    await page.waitForFunction(() => {
      const links = [...document.querySelectorAll('.section_layout494 .layout493_tab-link')].filter(
        (link) => link.getClientRects().length > 0,
      );
      if (links.length === 0) return true;
      if (!document.documentElement.classList.contains('w-mod-ix')) return false;
      return links.every((link) => {
        const paragraph = link.querySelector('.layout493_paragraph');
        if (!paragraph) return true;
        const height = paragraph.getBoundingClientRect().height;
        return link.classList.contains('w--current')
          ? height > 0 && !/height/.test(paragraph.getAttribute('style') ?? '')
          : height === 0;
      });
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForFunction(
      () => {
        const w = window as unknown as { __lastHeight?: number; __stableFor?: number };
        const height = document.documentElement.scrollHeight;
        w.__stableFor = height === w.__lastHeight ? (w.__stableFor ?? 0) + 1 : 0;
        w.__lastHeight = height;
        return w.__stableFor >= 4;
      },
      undefined,
      { polling: 100 },
    );
    // The logo marquee and the native testimonial slider are deterministic at
    // rest: the slider has no autoplay and initialises at position 0, and
    // Playwright's global animations: 'disabled' freezes the marquee.
    // A full-page capture of the ~10,000px home page needs more than the
    // suite's 10s expect budget when several workers share the CPU.
    await expect(page).toHaveScreenshot(`${pageInfo.name}.png`, {
      timeout: 30_000,
      fullPage: true,
      maxDiffPixelRatio: pageInfo.name === 'home' ? 0.04 : 0.001,
    });
  });
}
