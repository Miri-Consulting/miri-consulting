# Reposition Relay as an Aspire tool suite and prepare marketing product pages

## Summary

Relay was presented as an early-access SMS notification product. This change introduces the approved suite positioning on the homepage and `/products`, with Service Notifications, Directory, and Free Plant Library, clear signup actions, pricing, and a readable $1,000 onboarding disclosure. The shared navigation collapses sooner so the logo and Sign in label remain intact.

## Changes to review

- **Homepage Relay section:** new headline, suite paragraph, leaf/chat/sparkle feature icons, integrated Service Notifications spotlight; exact approved Northside SMS preserved; Explore Relay and Free Plant Library links.
- **Product page:** ordered tool cards with signup and detail anchors; token-based template explanation; compact service use cases; HOW IT WORKS steps; six SMS examples; free Plant Library benefits; roadmap; pricing and Calendly help.
- **Visual treatment:** Miri dark bands, subtle line icons, generated photorealistic plant background matching the supplied flyer. Responsive Astro WebP images; plants frame desktop content and become a shallow header at tablet/mobile widths. No new runtime dependencies.
- **Navigation:** fixed-size logo, nowrap links, hamburger at ≤1199px, desktop navigation at ≥1200px.
- **Tests:** obsolete early-access assertions replaced with approved destinations; pricing, onboarding, roadmap state, and product structure checked.

## Validation

| Check | Result |
| --- | --- |
| `npm run check` | Pass: 0 errors/warnings; one existing deprecated-event hint |
| `npm run build` | Pass |
| `MIRI_DEPLOY=1 npm run build` + UI-kit exclusion | Pass |
| Full DOM suite against production build | **25/25 pass** using installed Chrome through temporary local config |
| Responsive navigation/anchor smoke checks | Pass at 12 widths from 320–1920px; one unrelated Services overflow noted below |
| Product page overflow | None at tested widths |
| Plant image and desktop/mobile visual inspection | Pass |
| `git diff --check` | Pass |
| Pinned Linux visual regression | **Pending: Docker unavailable locally** |

## Developer patches / release gates

- [ ] **Verify live Relay signup and Plant Library before campaign traffic.** Direct GET/HEAD requests to `/signup` and `/plants` returned HTTP 403 from CloudFront/S3 in this environment. Approved URLs are retained. Determine whether public deep-link routing or access needs fixing. Calendly responds HTTP 200.
- [ ] **Wire roadmap “Let me know” or explicitly approve its unavailable state.** A prominent `DEVELOPER TODO` in `RelayLanding.astro` marks the integration point. Button is intentionally disabled; no email is collected. Owner requested developer connection to the existing Relay flow.
- [ ] **Review and regenerate Linux screenshot baselines** with the repository's pinned Playwright container and production-comparison procedure. Shared navigation can affect intermediate-width screenshots on other pages. Require green CI before merge.
- [ ] **Review 320px homepage Services overflow.** An unchanged Services card reaches approximately 340px. No global overflow suppression was added. Decide whether a separate scoped fix is needed for the event.
- [ ] **Confirm billing semantics:** the $1,000 note does not invent per-tool versus bundled onboarding rules. Ensure checkout and invoicing match it.

The complete [reviewer and release handoff](relay-marketing-release.md) documents file-by-file review points, responsive behavior, image provenance, limitations, and deployment smoke checks. Paths in this link are relative to this document in `docs/reviews/`.

## Scope / rollout

No unrelated homepage copy, backend endpoints, dependencies, database migrations, or deployment workflow changes. Roadmap signup integration and external Relay access are not implemented by this website PR. Existing CookieYes localhost-domain warnings require production-domain verification, not a consent configuration change here.

Review, approval, and merging must be performed by another person. Do not enable auto-merge. After deployment, verify anonymous signup/library access, pricing, navigation, consent, and Calendly before distributing event links. Rollback is a reviewed revert of this PR.
