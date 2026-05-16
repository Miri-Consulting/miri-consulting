/**
 * Prefix root-absolute static paths with Astro's `BASE_URL` when the deploy
 * isn't at `/` (e.g. GitHub Pages project sites such as
 * `https://owner.github.io/repo/`). The remaining raw HTML partials in
 * `src/partials/` reference assets with root-absolute paths like
 * `/styles/site.css`, `/scripts/runtime.js`, `/media/og-image.png`,
 * `/tracking/first-party` — this util walks the HTML once and rewrites
 * those to prepend the deploy base. No-op when `BASE_URL` is `/`.
 */
export function rewriteAssetPaths(html: string): string {
  const base = import.meta.env.BASE_URL;
  if (base === '/') return html;
  const prefix = base.replace(/\/$/, '');
  // Match a quoted root-absolute path that starts one of our known public/
  // top-level folders, then prepend the base. Conservative on the prefix list
  // so external `https://` URLs and inline data: URIs are untouched.
  return html
    .replace(
      /(["'])\/(styles\/|scripts\/|media\/|tracking\/|assets\/|miri-static[^"'\s]*|miri-spline[^"'\s]*)/g,
      (_m, quote: string, rest: string) => `${quote}${prefix}/${rest}`,
    )
    .replace(
      /(,\s*)\/(styles\/|scripts\/|media\/|tracking\/|assets\/)/g,
      (_m, sep: string, rest: string) => `${sep}${prefix}/${rest}`,
    );
}
