/**
 * Strips Webflow-era analytics and duplicate assets from the raw legal-page
 * <head> exports (privacy / terms). HeadAnalytics.astro is the single source
 * of analytics for every page (GA4, GTM, Crisp, CookieYes, Clarity), and
 * LegalLayout renders it alongside the sanitized raw head — so every
 * analytics/tracking script in the raw export must be removed here, otherwise
 * the legal pages double-load gtag.js, Crisp, etc.
 */
export function sanitizeLegalHead(html: string): string {
  return html
    .replace(/<link[^>]*href="[^"]*miri-static-overrides\.css"[^>]*>/gi, '')
    .replace(/<link href="https:\/\/cdn\.prod\.website-files\.com" rel="preconnect"\/>/, '')
    // GTM loader
    .replace(
      /<script>\s*\(function\(w,d,s,l,i\)[\s\S]*?GTM-N3PHMJQQ'\);\s*<\/script>/,
      '',
    )
    // GA4: the gtag.js library tag plus its adjacent dataLayer/config block.
    .replace(
      /<script async="" src="https:\/\/www\.googletagmanager\.com\/gtag\/js[^"]*"><\/script><script[^>]*>window\.dataLayer[\s\S]*?<\/script>/,
      '',
    )
    // Crisp chat loader
    .replace(
      /<!-- This is the Crisp Chat Box-->\s*<script[^>]*>window\.\$crisp[\s\S]*?<\/script>/,
      '',
    )
    .replace(/<!-- Start cookieyes banner -->[\s\S]*?<!-- End cookieyes banner -->/, '')
    .replace(/<script src="[^"]*clarity_script[^"]*" type="text\/javascript"><\/script>/, '')
    .replace(/<script src="[^"]*n3phmjqq[^"]*" type="text\/javascript"><\/script>/, '');
}
