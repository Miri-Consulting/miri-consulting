import { readdirSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/** Trailing slash required by Astro when not '/'. */
function normalizeBase(raw) {
  if (!raw || raw === '/') return '/';
  let b = String(raw).trim();
  if (!b.startsWith('/')) b = `/${b}`;
  if (!b.endsWith('/')) b += '/';
  return b;
}

const base = normalizeBase(process.env.ASTRO_BASE);
// Keep in sync with site.url in src/data/site.ts.
const site =
  process.env.ASTRO_SITE_URL?.trim() || 'https://miri-consulting.com';

// Keep in sync with noindexPaths in src/data/site.ts.
const noindexPathnames = [
  "/privacy-policy",
  "/terms-of-service",
  "/thank-you",
  "/ui-kit",
];

function sitemapAllows(page) {
  try {
    const pathname = new URL(page).pathname.replace(/\/$/, "") || "/";
    return !noindexPathnames.includes(pathname);
  } catch {
    return true;
  }
}

// The Webflow site served each team member at /people/<slug> (and its draft
// copies at /people-copy/<slug>); Search Console still crawls them as 404s.
// GitHub Pages has no server redirects, so Astro emits a meta-refresh page per
// path. Destinations get `base` because Astro does not add it to redirects.
const teamSlugs = readdirSync(new URL('./src/content/team/', import.meta.url))
  .filter((file) => file.endsWith('.md'))
  .map((file) => file.replace(/\.md$/, ''));

const legacyRedirects = {
  '/old-home': base,
  '/signup': 'https://relay.miri-consulting.com/signup',
  ...Object.fromEntries(
    teamSlugs.flatMap((slug) => [
      [`/people/${slug}`, `${base}#people`],
      [`/people-copy/${slug}`, `${base}#people`],
    ]),
  ),
};

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  redirects: legacyRedirects,
  build: {
    // Emit each page as <slug>/index.html so URLs are extension-less:
    // /privacy-policy, /terms-of-service, /thank-you, etc. Home stays at /.
    // 404.astro is a special case Astro keeps at dist/404.html for static
    // hosts like GitHub Pages that look for that specific filename.
    format: 'directory',
    assets: '_assets',
  },
  integrations: [sitemap({ filter: sitemapAllows })],
  vite: {
    build: {
      cssCodeSplit: false,
    },
  },
});
