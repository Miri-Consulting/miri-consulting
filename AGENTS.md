# Miri Consulting site agent cookbook

## Architecture (post-tech-debt-cleanup)

- Every home-page section is a native Astro component under `src/components/home/`. There are no `apply*` regex utilities or raw HTML home partials anymore — content collections drive the markup directly.
- First-party images live in `src/assets/` and flow through Astro's `<Image>` component (Sharp pipeline → content-hashed `/_assets/<name>.<hash>.<ext>`).
- Shared site constants (nav links, Calendly URL, analytics IDs, vendor paths) live in `src/data/site.ts`.
- Legal pages still render a few static Webflow HTML partials (`src/partials/legal-*.html`, `src/partials/home/how-we-work.html`, `src/partials/aspire-landscape-landing-body.html`, `src/partials/body-scripts-home.html`) through `RawHtml`, which applies `src/utils/rewriteAssetPaths.ts` to point Webflow CDN URLs at the committed `/vendor/webflow/...` files. Promoting those partials to native is optional follow-up work.
- `public/vendor/webflow/` is committed (curated CSS + 5 JS files + ~16 images + encoded aliases for URL compatibility). There is no `prepare-vendor` script — what's in the repo is what gets served.
- `tech-debt-cleanup.md` is the long-form tracker for the multi-phase cleanup; see it for phase status and decisions.

## Add a team member

1. Add a headshot under `src/assets/team/`.
2. Create `src/content/team/<slug>.md` with frontmatter matching `src/content.config.ts`.
3. Run `npm run build` and `npm run test:visual`.

## Add a service pillar

1. Create `src/content/services/<slug>.md` with images under `src/assets/services/`.
2. Run `npm run build` and `npm run test:visual`.

## Add a testimonial

1. Create `src/content/testimonials/<slug>.md` with portrait under `src/assets/testimonials/`.
2. Run `npm run build` and `npm run test:visual`.

## Add a client logo

1. Add the logo under `src/assets/logos/`.
2. Create `src/content/client-logos/<slug>.md`.
3. Run `npm run build` and `npm run test:visual`.

## Add a new top-level page

1. Create `src/pages/<slug>.astro` using `BaseLayout` or `LegalLayout`.
2. Add navigation links in `src/data/site.ts` if needed.
3. Run `npm run build` and `npm run test:visual`.

## Update navigation

Edit `navLinks` in `src/data/site.ts`.

## Update Calendly URL

Edit `cta.calendlyUrl` and `cta.calendlyLegalUrl` in `src/data/site.ts`.

## Update analytics IDs

Edit `analytics` in `src/data/site.ts`.

## Run visual regression locally

In one terminal:

```bash
npm run build
npm run preview
```

In another:

```bash
npm run test:visual
```

Playwright defaults `BASE_URL` to `http://localhost:4321` (matching `astro preview`). DOM tests live in `tests/dom.spec.ts` (one viewport via the `dom` project); visual screenshot tests live in `tests/visual.spec.ts` (six viewport projects). On PRs and pushes to `master`, `.github/workflows/test.yml` runs `check` + `build` + the DOM project; visual screenshot tests stay local until a Linux-baseline workflow is set up.

## Run visual regression against production

After GitHub Pages is live at `https://www.miri-consulting.com`:

```bash
npm run test:visual:production
```

## Update visual baselines after intentional changes

```bash
npm run test:visual:update
```

**Before updating baselines, verify the new render matches prod.** A baseline update silently locks in whatever's currently rendered — if a refactor accidentally drops a Webflow grid ID or shifts layout, "refresh baselines" hides the regression. Discipline:

1. Run `npm run test:visual:production` first. This runs the suite against `https://www.miri-consulting.com` using the *currently committed* baselines as expectations. If the suite passes, the committed baselines reflect prod and any local diff must be intentional.
2. If a baseline diff arises during normal local work, capture local + prod screenshots side-by-side (e.g. open both URLs at the same viewport in a headless browser and screenshot both with `fullPage: true`) and confirm they're the same shape before running `test:visual:update`.
3. The Webflow shared CSS positions many grid children by ID (~166 `#w-node-...` rules). Native Astro rewrites that drop those IDs collapse layout to a 1-column fallback. When porting a partial to a native component, preserve any `id="w-node-..."` attribute that the partial had — those are load-bearing for layout, not decorative.

## Deploy

Pushes to `master` run `.github/workflows/deploy.yml`. After the first successful deploy, set GitHub Pages source to **GitHub Actions** in repository settings.

The workflow calls the [GitHub Pages API](https://docs.github.com/en/rest/pages/pages#get-a-apiname--pages-site) before `npm run build`. If **`cname`** is set (custom domain), it sets `ASTRO_SITE_URL` to `https://<cname>` and `ASTRO_BASE` to `/`. Otherwise it uses the **project** URL `https://<owner>.github.io/<repo>` with `ASTRO_BASE` `/<repo>/`. Repos named `*.github.io` use `https://<that-name>` and base `/`. If the Pages site does not exist yet (first deploy), it uses the same defaults as the no-custom-domain case. To override locally, set `ASTRO_BASE` and `ASTRO_SITE_URL` when running `npm run build`.
