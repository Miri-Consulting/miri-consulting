# Relay marketing refresh — reviewer and release handoff

Prepared October 4, 2026. Target: `master`. Feature branch: `codex/relay-headline`.

## Purpose and scope

Position Relay as a growing suite of Aspire tools, with Service Notifications as a concrete example, Directory for communication outside scheduled visits, and a free Plant Library. Preserve the approved Miri visual language and all unrelated homepage content. The shared navigation fix applies site-wide.

## Review map

| File | Review focus |
| --- | --- |
| `src/components/home/OurProducts.astro` | Suite positioning, exact Northside SMS, spotlight, leaf/chat/sparkle icons, approved CTA destinations |
| `src/styles/home-products.css` | Two-column desktop layout; stacked mobile spotlight and SMS; wrapping buttons and headings |
| `src/styles/miri-static-overrides.css` | Fixed 119×27 logo, nowrap labels, hamburger through 1199px; desktop starts at 1200px; open/close icon behavior |
| `src/components/products/RelayLanding.astro` | Complete product narrative, signup/detail actions, messages, roadmap, prices, onboarding disclosure |
| `src/pages/products/index.astro` | Updated metadata; removal of rendered early-access section |
| `src/styles/products.css` | Page-scoped styling, dark tools band, responsive plant presentation, readable fee note |
| `src/assets/products/plant-library-background.png` | AI-generated photorealistic decorative plants inspired by supplied flyer; not a screenshot or botanical reference |
| `tests/dom.spec.ts` | Updated obsolete CTA assertions and product structure/pricing checks |

## Final behavior

- Homepage: “Extend What’s Possible with Aspire,” broader suite copy, three concise features, existing SMS graphic on the left at desktop, integrated Service Notifications spotlight. Exact approved Dana reminder and scheduled timestamp retained.
- Product page: redundant capabilities summary removed. Available Now cards are Service Notifications, Directory, Free Plant Library, each with signup and in-page learn-more links.
- Service Notifications: token-based templates called out; compact audience benefits for residential notice, treatment education, and commercial/snow communication. Blue HOW IT WORKS label and three steps retained without the redundant large heading.
- Directory: six consistent SMS bubbles with concise storm forecast, refreeze follow-up, team benefits reminder, weather delay, subcontractor paperwork reminder, and spring-color promotion examples. Forecasts and promotions are illustrative marketing examples, not live data or active offers.
- Plant Library: four benefits and free-account CTA on a dark botanical background. Desktop image frames content; at ≤960px it becomes a shallow header. Benefits stack at ≤600px. Astro outputs responsive WebP assets (~55KB/177KB at 768/1536px), with empty alt text for decorative imagery.
- Roadmap: five coming-soon tools plus a custom-request card linking to Calendly. Disabled “Let me know” preview and explicit upcoming-signup message; no email collection or fake success.
- Pricing: bundle $350/mo (save $100/mo), Service Notifications $300/mo, Directory $150/mo, Plant Library free. Signup buttons, free-library link, Calendly help CTA. Regular 16px note: “A $1,000 onboarding fee applies to Service Notifications and Directory.”

## Required developer attention before the event

1. **Verify Relay destinations for anonymous visitors.** Both `https://relay.miri-consulting.com/signup` and `https://relay.miri-consulting.com/plants` returned HTTP 403 (Amazon S3 / CloudFront) on direct GET and HEAD requests from this environment. This may be deployment/routing/access configuration; cause is not established. Verify direct deep links and navigation from the app in a clean browser. Fix the Relay app deployment if needed. Calendly returned HTTP 200. Website URLs have not been replaced with speculative alternatives.
2. **Connect roadmap email updates, or explicitly approve shipping the unavailable state.** Search `DEVELOPER TODO` in `RelayLanding.astro`. Supply the verified Relay notification flow URL, or wire its real email endpoint with accessible validation, loading, success, and error behavior. Then enable the button and update the disabled-state test. Owner requested this handoff because the destination was unavailable. Do not enable a dead link or collect addresses without storage.
3. **Refresh Linux visual baselines after reviewing intentional changes.** Docker is unavailable locally, so the pinned Linux screenshot suite/baselines could not be completed. CI runs it on every PR. Use the repository AGENTS.md production-comparison and pinned-container procedure (`mcr.microsoft.com/playwright:v1.60.0-noble`), inspect diffs, and refresh affected screenshots. Do not waive the job or blindly accept all differences. Navbar changes can affect screenshots beyond home/products at intermediate widths.
4. **Review narrow-phone homepage Services overflow.** At 320px, the unchanged Services card extends beyond the viewport (right edge about 340px); Relay page and new Relay content fit. This was outside the requested homepage scope and was not hidden with global overflow rules. Decide whether a separate scoped Services fix is required before the event.
5. **Confirm onboarding billing interpretation.** The note uses the owner's wording and does not invent a per-tool charge or bundle exemption. Ensure checkout/invoicing matches the advertised $1,000 fee and clarify separately if onboarding is charged per tool rather than once per customer.

## Validation and limits

- Astro check: zero errors/warnings; existing `IndustryTabs.astro` deprecated `event` hint remains.
- Normal production build and deploy-mode build checked; deploy must not contain `dist/ui-kit`.
- Full DOM suite run against a separately served production build with installed Chrome (not pinned CI Chromium). All 25 tests passed. An initial dev-server run passed 24/25; the image-path check correctly requires built assets and passed on the production build.
- Responsive smoke check across `/` and `/products` at 320, 375, 600, 768, 960, 991, 992, 1024, 1199, 1200, 1440, 1920px: logo remains 119px, correct menu breakpoint, menu open/close checked at 375/1024/1199, no broken in-page anchors. Only overflow finding is the Services item above.
- Plant imagery decoded and visually checked at 320, 375, 600, 768, and 1440px. Desktop/mobile Directory and pricing inspected during iteration.
- CookieYes reports a registered-domain warning on localhost. Do not alter production consent settings merely to silence local development; confirm on the deployed domain.
- No account creation, paid checkout, email subscription, or calendar booking was submitted. Safari/iOS physical-device testing and Linux visual regression remain reviewer checks.

## Merge and release checklist

- [ ] Resolve/verify public Relay signup and Plant Library access.
- [ ] Connect roadmap updates or explicitly accept its disabled preview state.
- [ ] Review and refresh Linux baselines; all required CI jobs green.
- [ ] Confirm pricing/onboarding matches Relay checkout and invoicing.
- [ ] Smoke-test a phone, tablet, and desktop on staging; verify nav keyboard operation, CTA destinations, image loading, consent, and Calendly.
- [ ] Another person reviews, approves, and merges. No auto-merge or review bypass.
- [ ] After deployment, repeat anonymous deep-link and signup smoke checks before sharing campaign links.

Rollback: revert the eventual merged PR through a reviewed PR. No database migrations, backend changes, or new runtime dependencies are introduced.
