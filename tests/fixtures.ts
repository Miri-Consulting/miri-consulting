import { test as base, expect } from '@playwright/test';

/**
 * Third-party services no test asserts on. Left live, every page load waited
 * on them under `networkidle` (most of the suite's runtime), and the consent
 * banner and chat bubble drifted screenshots. Google Fonts stays reachable
 * because typography is part of what the visual baselines check.
 */
const blockedHosts = [
  'googletagmanager.com',
  'google-analytics.com',
  'analytics.google.com',
  'doubleclick.net',
  'googleadservices.com',
  'clarity.ms',
  'crisp.chat',
  'cdn-cookieyes.com',
  'calendly.com',
  'facebook.net',
];

/**
 * The hero's Spline 3D scene renders through software WebGL in headless
 * Chromium and pins the page at ~4 fps, so every click waited ~12s for the
 * page to look "stable". No test asserts on the scene (visual tests hide it),
 * and without the runtime its canvas keeps its CSS size, so layout is unchanged.
 */
function isSpline(url: URL): boolean {
  return url.pathname.includes('/@splinetool/') || url.pathname.endsWith('.splinecode');
}

function isBlocked(url: URL): boolean {
  return isSpline(url) || blockedHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
}

export const test = base.extend<{ blockThirdParty: void }>({
  blockThirdParty: [
    async ({ page }, use) => {
      await page.route(isBlocked, (route) => route.abort());
      await use();
    },
    { auto: true },
  ],
});

export { expect };
