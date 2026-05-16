import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = process.env.BASE_URL ?? 'https://www.miri-consulting.com';

/**
 * Join an absolute path onto BASE_URL without losing BASE_URL's own pathname.
 *
 * `new URL('/foo', 'https://host.com/sub')` returns `https://host.com/foo` —
 * the leading slash makes the path *root-relative*, clobbering the `/sub`
 * subpath. That ate one capture run when BASE_URL was set to the GitHub
 * Pages project URL `https://keyneom.github.io/miri-consulting-site` and
 * every page wound up scraping the bare `https://keyneom.github.io/`
 * (someone else's blog). Normalise the base to end with `/` and strip the
 * leading `/` from the path so the join is purely additive.
 */
function joinUrl(base, path) {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const normalizedPath = path === '/' ? '' : path.replace(/^\//, '');
  return new URL(normalizedPath, normalizedBase).toString();
}
const VIEWPORTS = [
  { name: '375', width: 375, height: 800 },
  { name: '640', width: 640, height: 480 },
  { name: '768', width: 768, height: 1024 },
  { name: '991', width: 991, height: 1280 },
  { name: '1440', width: 1440, height: 900 },
  { name: '1920', width: 1920, height: 1080 },
];

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'privacy', path: '/privacy-policy.html' },
  { name: 'terms', path: '/terms-of-service.html' },
];

const root = process.cwd();
const screenshotDir = path.join(root, 'baseline', 'screenshots');
const domDir = path.join(root, 'baseline', 'dom');

await mkdir(screenshotDir, { recursive: true });
await mkdir(domDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext();

for (const pageInfo of PAGES) {
  const page = await context.newPage();
  const url = joinUrl(BASE_URL, pageInfo.path);
  const response = await page.goto(url, { waitUntil: 'networkidle' });
  const status = response?.status() ?? 0;
  if (status >= 400) {
    console.warn(`Skipping ${pageInfo.name}: ${url} returned HTTP ${status}`);
    await page.close();
    continue;
  }
  await page.evaluate(() => document.fonts.ready);

  const html = await page.evaluate(() => document.documentElement.outerHTML);
  await writeFile(path.join(domDir, `${pageInfo.name}.html`), html, 'utf8');

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(500);
    const spline = page.locator('.spline-scene');
    const mask = (await spline.count()) > 0 ? [spline] : [];
    await page.screenshot({
      path: path.join(screenshotDir, `${pageInfo.name}-${viewport.name}.png`),
      fullPage: true,
      mask,
    });
  }

  await page.close();
}

await browser.close();
console.log('Baseline capture complete.');
