# Tech Debt Cleanup — Progress and Plan

Self-contained tracker for the multi-phase cleanup of this site. Anyone picking this up should be able to read this file end-to-end and know exactly what's done, what's in flight, and what remains.

## Status snapshot

| Phase | Title | Status | Commit |
| --- | --- | --- | --- |
| 10 | Guardrails and Baseline | complete | see git log |
| 11 | Service Images + Safe Dead Code Removal | complete | see git log |
| 12.1 | Native client logos | complete | see git log |
| 12.2 | Native testimonials | complete | see git log |
| 12.3 | Native industry tabs | not started | — |
| 12.4 | Native team grid | not started | — |
| 12.5 | Native services + team modals split | not started | — |
| 12.6 | Native hero / contact CTA | not started | — |
| 12.7 | Native footer / nav (optional) | not started | — |
| 13 | Vendor + artifact cleanup | not started | — |
| 14 | CSS reduction | not started | — |
| 15 | Repo hygiene + docs | not started | — |

Prior phases (5, 7, 9) already landed before this plan started; see `git log`.

## Working agreements

- One phase per commit (Phase 12 splits into one commit per section). No batching.
- Every commit must pass `npm run check`, `npm run build`, `npm run preview`, `npm run test:visual` before landing.
- Visual masks shrink as native sections replace partials. Try animation-freezing before falling back to masking.
- Visual regression tolerances tighten as masks come off (home `maxDiffPixelRatio` drifts from 0.04 toward 0.01).
- Do not push to remote without owner approval.

## Context

The Astro migration is partway done. Git history shows Phases 5/7/9 already landed (content collections wired in for home sections, hero Spline deferred, static overrides inlined, dead Calendly component removed). What remains is structural:

- Home sections still render by regex-mutating raw Webflow HTML partials, with silent-failure validation in [src/utils/home/](src/utils/home/).
- ~190MB of generated and legacy content is checked into git and not in `.gitignore` (`public/vendor/webflow`, `cdn.prod.website-files.com`, `public/assets/{team,testimonials,logos/local}`, root capture folders).
- [ServicesTabs.astro](src/components/home/ServicesTabs.astro) wires text but not images even though the content schema, content entries, and asset files all exist.
- Visual regression coverage masks four dynamic sections (`.spline-scene`, `.section_logo3`, `.testimonial_slider`, `#cookieyes`) and runs the home page at a loose `maxDiffPixelRatio: 0.04`. The masks exist for legitimate motion/state reasons but trade pixel coverage for stability — this plan compensates with DOM assertions, animation-freezing where possible, and per-component screenshots.
- Confirmed-dead files: [EchoPage.astro](src/components/EchoPage.astro), [pageHtml.ts](src/utils/pageHtml.ts), [applyIndustryBodies.ts](src/utils/home/applyIndustryBodies.ts), and the `applyTestimonialQuotes` export (sibling `testimonialQuotesForSlider` is still used).

## Goals

- Replace the regex-based home rendering pipeline with native Astro components that pull from content collections and use Astro's `<Image>` / `getImage()` pipeline for optimization.
- Restore unmasked visual coverage of the marquee and testimonials once they no longer depend on the Webflow CDN.
- Stop tracking generated and legacy artifacts in git; refactor `prepare-vendor.mjs` to be deterministic with no network calls.
- Remove confirmed-dead code in lockstep with section conversions.

## Public interfaces (preserved unless noted)

- Content collections are the editing API. Six exist: `home`, `team`, `testimonials`, `services`, `industries`, `clientLogos` ([src/content.config.ts](src/content.config.ts)).
- [src/assets/](src/assets/) is the only first-party image source.
- [src/data/site.ts](src/data/site.ts) is the only place for shared constants. `analytics.googleSiteVerification` is currently `null` and unused — wire or drop in Phase 15.
- Public routes stay stable: `/`, `/privacy-policy.html`, `/terms-of-service.html`, `/aspire-consulting-for-landscape-companies.html`, `/thank-you.html`, `/404.html`.
- `prepare-vendor.mjs` becomes a narrow, deterministic vendor-prep step (CSS/JS only) in Phase 13 — no network fetches, no encoded-alias loop, no team/testimonial copy step.

## Phase details and checklists

### Phase 10: Guardrails and Baseline — complete

- [x] Tighten [tsconfig.json](tsconfig.json) `exclude`. Went from 800 hints across 80 files to 0 hints across 58 files. Also added `is:inline` to the one remaining JSON-LD script in [JsonLdAspireLandscape.astro](src/components/seo/JsonLdAspireLandscape.astro) to match the other three SEO components.
- [x] Add [tests/dom.spec.ts](tests/dom.spec.ts) with DOM-level assertions:
  - Team grid: 10 cards in collection order, with matching headshot alt text.
  - Testimonials: each of the 6 collection names appears at least once (slider duplicates entries to fill 10 slots).
  - Client logo marquee: the four hardcoded brand anchors (Black Diamond, Willis, Greenfield, Los Alamos) present with expected href + alt — will be rewritten in Phase 11/12.1.
  - Services: 4 tabs (Operations, Finance, Digital, HR) rendered.
  - `test.fixme()` placeholder for service-image alt text — activates in Phase 11.
  - `dist/index.html` does not reference `local-team-images/`.
- [x] Restructure [playwright.config.ts](playwright.config.ts): visual viewports use `testMatch: /visual\.spec\.ts/`; new `dom` project uses `testIgnore: /visual\.spec\.ts/` and runs once at 1440×900.
- [x] Add [.github/workflows/test.yml](.github/workflows/test.yml) — runs `check`, `build`, and `test --project=dom` on pull requests and push to master. Visual screenshot tests are deliberately NOT wired into CI yet (see Surprises below).
- [x] Investigate animation freezing — see Surprises below.

Verification on `master` before commit: `npm run check` (0/0/0), `npm run build` (6 pages), `playwright test --project=dom` (6 pass, 1 fixme), `playwright test tests/visual.spec.ts` (24 pass).

### Phase 11: Service Images + Safe Dead Code Removal — complete

- [x] Extend [applyServiceSummaries](src/utils/home/applyServiceSummaries.ts) and [applyServiceModals](src/utils/home/applyServiceModals.ts) to also rewrite the `<img>` inside each `layout507_image-wrapper` block. Pass `cardImage`+`cardImageAlt` and `modalImageAlt` from [ServicesTabs.astro](src/components/home/ServicesTabs.astro). Each service's card and modal now render the **same** image (matches prod), so [ServicesTabs.astro](src/components/home/ServicesTabs.astro:33) passes `cardImage.src` into the modal slot as well.
- [x] Fix HR "Learn more" Calendly bug in [services-tabs.html](src/partials/home/services-tabs.html). The Webflow export wrote `<a fs-modal-element="open-4" href="https://calendly.com/ramelsanchez/chat">` for HR alone (the other three say `href="index.html#"`); [addCalendlyPopupToPlainPrimaryAnchors](src/utils/calendly.ts) then wired a Calendly `onclick` so clicking HR Learn more opened both the modal and the Calendly popup. Fixed by normalizing the href to `index.html#`.
- [x] Fix pre-existing [applyTeamModalHeadshots](src/utils/home/applyTeamModalHeadshots.ts) bug. Its `[\s\S]*?` lazy match spanned across image-wrappers, so every team-member iteration overwrote the *first* image-wrapper in the document (the Operations card slot). Now bounded with `(?:(?!<div class="layout507_image-wrapper">)[\s\S])*?` so each match stays within one wrapper boundary.
- [x] Delete confirmed-dead files: `EchoPage.astro`, `pageHtml.ts`, `applyIndustryBodies.ts`. Drop the unused `applyTestimonialQuotes` export from [applyTestimonialQuotes.ts](src/utils/home/applyTestimonialQuotes.ts) (kept `testimonialQuotesForSlider`, still imported by `applyTestimonialSlides`).
- [x] Delete orphan directory `local-team-images/`.
- [x] Replace the `test.fixme()` placeholder in [tests/dom.spec.ts](tests/dom.spec.ts) with a real assertion that service card/modal images come from `/_assets/` and that each service's modal `src` equals its card `src`.
- [x] Update the home `mobile-landscape` visual baseline (height shifted because the new content-driven image bytes have different aspect ratios than the Webflow CDN srcs they replaced).

Verification: `npm run check` (0/0/0), `npm run build` (6 pages), `playwright test --project=dom` (7/7 pass), `playwright test tests/visual.spec.ts` (24/24 pass).

**Greenfield logo moved to Phase 12.1** (deferred from Phase 11 plan). The marquee partial has 30 `<img>` slots (15 per list × 2 lists) and [applyClientLogoImages](src/utils/home/applyClientLogoImages.ts) only matches `count === logos.length` or `count === logos.length * 2`. Adding a 16th collection entry would mismatch (30 ≠ 16, 30 ≠ 32) and the utility would silently no-op the marquee. Cleanest fix is to add Greenfield + drop the four hardcoded `<a>` brand anchors when [ClientLogoMarquee.astro](src/components/home/ClientLogoMarquee.astro) goes native — that component can render `<a>` only for entries with an `externalUrl` field. Phase 12.1 will add `externalUrl` to the schema and wire it.

### Phase 12: Native Components, Section by Section

Each section converts to a native Astro component using `<Image>` for first-party assets. Preserve current Webflow class names; CSS pruning happens in Phase 14. One commit per section. Delete each `apply*` util and the matching `.html` partial **only after** the native version ships and visual tests pass.

After each section converts: try animation-freezing first (the global `animations: 'disabled'` plus per-component CSS overrides where needed). Drop the mask if screenshots stabilize, or shrink to the smallest residual motion box. Tighten the home `maxDiffPixelRatio` toward 0.01 as masks come off.

- [x] 12.1 Client logos (mobile + desktop marquees). `externalUrl` was already in the `clientLogos` schema (unused). Added `brandClass` (optional enum) for the four external-link entries. Filled in `externalUrl` + `brandClass` on Black Diamond / Willis / Los Alamos and added new `greenfield-capital-partners.md` entry (order 16; Los Alamos bumped from 15 to 17 to dedupe). Moved `local-brand-logos/greenfield-capital-partners.png` to `src/assets/logos/`. Replaced both `ClientLogoMarquee.astro` and `ClientLogoMarqueeMobile.astro` with native components using Astro's `<Image>`; entries with `externalUrl` render as `<a target="_blank" rel="noopener">` with `brand-logo-{class}` modifier on the img, others as `<div class="logo3_wrapper">`. Deleted both `client-logo-marquee*.html` partials and `applyClientLogoImages.ts`. Removed `.section_logo3` from the visual mask list (Playwright's `animations: 'disabled'` pins the CSS-keyframe marquee to its initial frame, screenshots are deterministic). Refreshed home-page baselines across all six viewports.

**Salvaged regression**: the old `client-logo-marquee.html` partial also contained the entire `section_layout402` "How We Work" 3-tab section (Deep Discovery / Collaborative Execution / Long-Term Partnership). Deleting the partial dropped that section from the home page. Extracted it into `src/partials/home/how-we-work.html` + `src/components/home/HowWeWork.astro` and wired into `src/pages/index.astro` between `<ClientLogoMarquee />` and `<IndustryTabs />`. The content is static (no collection backing); converting to fully native is deferred — not on the critical path for Phase 12.
- [x] 12.2 Testimonials. Native [TestimonialSlider.astro](src/components/home/TestimonialSlider.astro): renders one slide per testimonial collection entry (was 10 in the partial via apply-util duplication; the Webflow slider with `data-infinite="true"` clones as needed). Each slide's color comes from `entry.data.color`. Used `<Image>` for portraits. Deleted `src/partials/home/testimonial-slider.html`, `src/utils/home/applyTestimonialSlides.ts`, and `src/utils/home/applyTestimonialQuotes.ts` (the latter held `testimonialQuotesForSlider`, now unused). Removed `.testimonial_slider` from the visual mask list — Webflow's slider has `data-autoplay="false"` so it stays on slide 1 by default, and Playwright's `animations: 'disabled'` halts any transitions. Refreshed home baselines. Note: testimonial `title` fields in content are all empty strings today (the rendered `<div>` is empty); pre-existing content gap, surfaces now that the masked section is no longer hidden.
- [ ] 12.3 Industry tabs.
- [ ] 12.4 Team grid. Expose a typed `team` shape that ServicesTabs's modal section can consume without re-fetching.
- [ ] 12.5 Services + team modals. Highest-risk step — split the monolithic [services-tabs.html](src/partials/home/services-tabs.html) (62KB, 7-util pipeline) into `ServicesTabs` and a sibling `TeamModals`. Capture extra pre/post DOM and screenshot baselines.
- [ ] 12.6 Hero / contact CTA. Preserve Calendly wiring and Spline mount.
- [ ] 12.7 Footer / nav. Convert only if it materially helps Phase 14 CSS pruning.

### Phase 13: Vendor + Artifact Cleanup

- [ ] Update [.gitignore](.gitignore) to exclude: `public/vendor/`, `public/assets/team/`, `public/assets/testimonials/`, `public/assets/logos/local/`, `public/assets/spline/`, `cdn.prod.website-files.com/`, `ajax.googleapis.com/`, `fonts.googleapis.com/`, `cdn.jsdelivr.net/`, `assets.calendly.com/`, `cdn-cookieyes.com/`, `haqt6iy0yx2eNjRmMzYzYjRiYTBmYzEzNjIzNjI4MjRm/`. Then `git rm -r --cached` the tracked copies (~190MB total).
- [ ] Refactor [scripts/prepare-vendor.mjs](scripts/prepare-vendor.mjs): keep CSS/JS copy + tracking tag if still in use. Drop the encoded-alias loop, the team/testimonials copy steps, and the build-time `fetch()` calls (move OG image and Spline scene into `src/assets/` or guard behind an opt-in script).
- [ ] Delete `cdn.prod.website-files.com/`, the root capture folders, and `local-brand-logos/` (only Greenfield was a real reference; moved to `src/assets/logos/` in Phase 11).
- [ ] Confirm one canonical vendor path (`/vendor/webflow/...`) and trim [rewriteAssetPaths.ts](src/utils/rewriteAssetPaths.ts) of unreachable rules.

### Phase 14: CSS Reduction

Runs after Phase 12 so the used-selector inventory reflects final markup.

- [ ] Run PurgeCSS against `dist/**/*.html` + `public/vendor/webflow/js/**/*.js` + any other JS bundles. Captures literal class strings (`w--current`, `w--tab-active`, `w--open`, `w-slider-*`, `wf-*`, `is-active`, `fs-modal-*`, `fs_modal-*`) automatically.
- [ ] Add a Playwright CSS-coverage spec that drives every interactive state (each tab, each modal open/close, slider transitions, mobile nav, dropdowns), wrapping each with `page.coverage.startCSSCoverage()` / `stopCSSCoverage()`. Catches computed class names PurgeCSS can't see.
- [ ] Union the two outputs; maintain a small backstop safelist for anything neither tool surfaces.
- [ ] Remove unused selectors from [src/styles/](src/styles/) in small batches; rerun visual tests after each batch.
- [ ] Fold small surviving overrides into component-scoped `<style>` blocks.

### Phase 15: Repo Hygiene + Docs

- [ ] After final grep confirms zero references, delete unused scripts: `scripts/extract-footer.mjs`, `scripts/extract-layout-partials.mjs`, `scripts/generate-content-collections.py`. Keep `scripts/capture-baseline.mjs` only if `npm run baseline:capture` is still part of an active workflow.
- [ ] Decide on `baseline/` (8.1MB): keep with a README justifying its purpose, or delete and rely on Playwright snapshots.
- [ ] Wire or remove `analytics.googleSiteVerification` in [src/data/site.ts](src/data/site.ts).
- [ ] Update [AGENTS.md](AGENTS.md): native components are the renderer; `src/assets/` + content collections are the only image source; `prepare-vendor.mjs` is scoped to Webflow CSS/JS only; visual tests run in CI.
- [ ] Verify the deploy workflow still resolves `ASTRO_SITE_URL` and `ASTRO_BASE` correctly after artifact removal.

## Test plan (run before every commit)

- `npm run check`
- `npm run build`
- `npm run preview` (defaults to port 4321)
- `npm run test:visual` (defaults `BASE_URL` to `http://localhost:4321`)

## Decisions log

- **Phase numbering** continues from 10 to avoid collision with prior `Phase 5/7/9` commits.
- **Artifact cleanup is in scope** (full scope) — Phase 13 will gitignore + `git rm --cached` the ~190MB of generated/legacy content.
- **Greenfield logo** gets a content collection entry in Phase 11 (rather than being removed).
- **Visual tests in CI**: PRs + push to master cadence.

## Surprises and follow-ups

- The current [applyClientLogoImages.ts](src/utils/home/applyClientLogoImages.ts) rewrites the `src` of **every** `<img>` in `.section_logo3`, including the four hardcoded `<a>` external-logo wrappers (Black Diamond, Willis, Greenfield, Los Alamos). That means today those four anchors point to the right *href* but their `<img>` `src` is whatever collection logo lands in the same DOM position. Phase 11 fixes this by adding Greenfield to the collection and dropping the hardcoded `<a>` wrappers entirely.
- Only `src` is rewritten by `applyClientLogoImages`; the collection's `logoAlt` is **not** applied. Most `<img>` tags currently render `alt=""`. Phase 12.1 (native client logos) restores alt text.
- The logo marquee uses CSS keyframes (`animation: logo-marquee 44s linear infinite;` in [src/styles/inline-globals.css](src/styles/inline-globals.css:214)). Playwright's global `animations: 'disabled'` cancels infinite CSS animations to their initial state (`transform: translate3d(0,0,0)`), so in theory the marquee should be screenshottable without masking. The mask is likely historical. Empirical verification deferred to Phase 12.1 — when [ClientLogoMarquee.astro](src/components/home/ClientLogoMarquee.astro) goes native, try removing `.section_logo3` from the mask list and see if the snapshot stabilizes. If not, fall back to a per-component CSS override before screenshot.
- **Visual screenshot tests in CI are deferred.** Snapshot baselines in [tests/visual.spec.ts-snapshots/](tests/visual.spec.ts-snapshots/) were captured on macOS. Linux CI rendering (font hinting, sub-pixel positioning) will differ. Three paths forward, listed in order of effort: (1) use `mcr.microsoft.com/playwright:vX-jammy` as the Playwright Docker image both locally and in CI for parity, (2) maintain separate `*-linux.png` baselines committed alongside `*-darwin.png`, (3) leave visual screenshot tests local-only. Decision deferred to Phase 12.1 or later. The DOM test job in CI catches the regressions screenshots would catch for content/structure.
- The home page is composed in [src/pages/index.astro](src/pages/index.astro) with `<ClientLogoMarqueeMobile />` rendered *before* `<ClientLogoMarquee />`. Both elements use the `.section_logo3` class, so `page.locator('.section_logo3').first()` returns the **mobile** marquee — which lacks the four hardcoded brand anchors. DOM tests target anchors by `href` instead. Worth keeping in mind when writing new selectors.
- The 8 files in `src/assets/services/` were originally laid out as 4 byte-identical cross-service pairs (each Webflow service image was saved under both a `*-card.*` and `*-modal.*` name, but the `*-card.*` filenames were rotated by one slot — Operations' card file actually had Finance's image bytes, etc.). Phase 11 first sidestepped this by using `cardImage` in both slots; a follow-up commit (after Phase 12.1) renamed the four correctly-named `*-modal.*` files to canonical `{service}.{ext}` (operations.jpeg, finance.jpg, digital.jpg, hr.jpg), deleted the four misnamed `*-card.*` files, and pointed both `cardImage` and `modalImage` at the canonical file per service. Each service now renders its actual prod image. `modalImage`/`modalImageAlt` in the schema remain redundant (both fields point to the same file); Phase 15 should drop `modalImage` from the schema or have it default to `cardImage`.
- The `services-tabs.html` partial contains both the service tabs *and* the team-member modals. Phase 11's `applyTeamModalHeadshots` fix demonstrates how fragile the cross-section regex coupling is. Phase 12.5 will split this monolith.
