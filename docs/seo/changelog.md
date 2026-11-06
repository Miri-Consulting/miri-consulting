# SEO changelog

## 2026-11-01
- public/llms.txt, public/llms-full.txt: added Miri Relay (/products/) entry; was absent -> listed. Reason: AI discoverability.
- src/data/site.ts: home title 79 chars -> 53 chars ("Miri Consulting | Landscape & Construction Consulting"). Reason: avoid truncation while keeping both industries in the title.
- Watch next month: home impressions/CTR after title change; get Search Console + GA4 + relay repo access; run full AI-visibility and rank checks; verify live redirects/PageSpeed.

## 2026-11-06
- astro.config.mjs (82456d6, 2026-10-30): redirects for /signup, /old-home, /people/<slug> and /people-copy/<slug>; were 404 -> noindex meta-refresh pages. Reason: Webflow-era URLs Search Console still crawls.
- Search Console: submitted sitemap-index.xml (none before); started validation on the 404 report.
- GTM-N3PHMJQQ version 11: paused "Microsoft Clarity - Official" tag. Reason: duplicated the Clarity loader already in the site code. Roll back to version 10 if needed.
- Watch next month: 404 validation result; whether the sitemap's pages are discovered; Google Ads access to settle the thank-you conversion trigger.
