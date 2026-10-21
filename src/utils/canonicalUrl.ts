import { site } from '../data/site';

/**
 * Absolute canonical URL for a page path, in the exact form production serves
 * with a 200. Pages build as `<slug>/index.html`, so GitHub Pages 301s
 * `/products` to `/products/`; a canonical without the slash would point at a
 * redirect. File paths such as `/404.html` keep their extension.
 */
export function canonicalUrl(path: string): string {
  const url = new URL(path, site.url);
  if (!url.pathname.endsWith('/') && !/\.[a-z0-9]+$/i.test(url.pathname)) {
    url.pathname += '/';
  }
  return url.href;
}
