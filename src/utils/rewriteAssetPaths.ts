import { analytics, site } from '../data/site';

const webflowSitePath = `cdn.prod.website-files.com/${site.webflowSiteId}/`;
const webflowSiteUrl = `https://${webflowSitePath}`;
const selfHostedOgImage = new URL(
  '/vendor/webflow/assets/6814fec732b8cad8fad64a0d_Home_Page_1.png',
  site.url,
).href;

/** Prefix root-absolute static paths when `astro.config` `base` is not `/` (e.g. GitHub Pages project sites). */
function applyDeployBasePrefix(html: string): string {
  const base = import.meta.env.BASE_URL;
  if (base === '/') return html;
  const prefix = base.replace(/\/$/, '');
  let out = html.replace(
    /(["'])\/(vendor\/|assets\/|miri-static[^"'\\s]*|miri-spline[^"'\\s]*)/g,
    (_m, quote: string, rest: string) => `${quote}${prefix}/${rest}`,
  );
  out = out.replace(/(,\s*)\/(assets\/|vendor\/)/g, (_m, sep: string, rest: string) => `${sep}${prefix}/${rest}`);
  return out;
}

export function rewriteAssetPaths(html: string): string {
  return applyDeployBasePrefix(
    html
      .replaceAll(`${webflowSitePath}css/`, '/vendor/webflow/css/')
      .replaceAll(`${webflowSitePath}js/`, '/vendor/webflow/js/')
      .replaceAll(webflowSitePath, '/vendor/webflow/assets/')
      .replaceAll(webflowSiteUrl, '/vendor/webflow/assets/')
      .replaceAll(
        `${webflowSiteUrl}6814fec732b8cad8fad64a0d_Home%20Page%20(1).png`,
        selfHostedOgImage,
      )
      .replaceAll(
        'd3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js%3Fsite=64f363b4ba0fc1362362824f',
        `https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=${site.webflowSiteId}`,
      )
      .replaceAll(
        'ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
        'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
      )
      .replaceAll(
        `cdn-cookieyes.com/client_data/${analytics.cookieYesClientId}/script.js`,
        `https://cdn-cookieyes.com/client_data/${analytics.cookieYesClientId}/script.js`,
      )
      .replaceAll(
        'cdn.jsdelivr.net/npm/@finsweet/attributes-modal@1/modal.js',
        'https://cdn.jsdelivr.net/npm/@finsweet/attributes-modal@1/modal.js',
      )
      .replaceAll(
        'haqt6iy0yx2eNjRmMzYzYjRiYTBmYzEzNjIzNjI4MjRm/tvAAsIKEswP0uufI_5zRB4CSZhM',
        '/vendor/tags/first-party/tvAAsIKEswP0uufI_5zRB4CSZhM',
      )
      .replaceAll('%402x', '@2x'),
  );
}
