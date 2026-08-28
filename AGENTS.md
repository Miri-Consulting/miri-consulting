# Miri Consulting site agent cookbook

## Architecture (post-tech-debt-cleanup)

- Every home-page section is a native Astro component under `src/components/home/`. There are no `apply*` regex utilities or raw HTML home partials anymore — content collections drive the markup directly.
- First-party images live in `src/assets/` and flow through Astro's `<Image>` component (Sharp pipeline → content-hashed `/_assets/<name>.<hash>.<ext>`).
- Shared site constants (nav links, Calendly URL, analytics IDs, vendor paths) live in `src/data/site.ts`.
- Legal pages still render a few static Webflow HTML partials (`src/partials/legal-*.html`, `src/partials/home/how-we-work.html`, `src/partials/aspire-landscape-landing-body.html`, `src/partials/body-scripts-home.html`) through `RawHtml`. `src/utils/rewriteAssetPaths.ts` only prepends Astro's `BASE_URL` for non-`/` deploys (GitHub Pages project sites) — the partials reference `/styles/`, `/scripts/`, `/media/`, `/tracking/` directly. Promoting those partials to native is optional follow-up work.
- `public/` holds the committed self-hosted vendor assets: `public/styles/site.css` (Webflow shared bundle, pruned 55%), `public/scripts/{runtime,easing,tabs,forms,spline-loader,jquery.min}.js`, `public/media/` (logo, favicon, OG image, process-tab images), `public/tracking/first-party`. No `prepare-vendor` script — what's in the repo is what gets served. Re-run `node scripts/prune-webflow-css.mjs` after content additions to shrink the CSS again. `tabs.js` is a Webflow chunk that registers the shared `tabs` module plus a no-op `slider` module shape; it intentionally does not ship Webflow slider behavior.
- `docs/source-material/` holds raw, unpublished inputs for site content (customer quotes and similar). Nothing there renders — Astro only builds from `src/pages/` and `src/content/` — which is the point: raw material stays versioned without being published by accident. Publishing something means copying it into the relevant place and checking attribution first.
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
2. Build the page on the **Miri UI kit** (`src/styles/miri-ui.css`) — see below.
3. Add navigation links in `src/data/site.ts` if needed.
4. Run `npm run build` and `npm run test:visual`.

## Miri UI kit (`mk-` classes)

`src/styles/miri-ui.css` is the component layer for every page that is not the
Webflow homepage. `/products` and `/aspire-consulting-for-landscape-companies`
are both built on it; new marketing and SEO pages should be too.

**The living style guide is `/ui-kit`** (`src/pages/ui-kit/[...slug].astro`).
It renders every component from the real stylesheet, so it cannot drift: run
`npm run dev` and open `http://localhost:4321/ui-kit`. Add a specimen there
whenever you add a component to the kit.

The style guide is **internal — it never reaches the public site.** It is a rest
route whose `getStaticPaths` returns nothing when `MIRI_DEPLOY=1`, which
`.github/workflows/deploy.yml` sets on the deploy build; that build then asserts
`dist/ui-kit` does not exist. Local builds and the CI test build leave the
variable unset, so `npm run build` and the Playwright suite still see the page.
To reproduce a deploy build locally:

```bash
MIRI_DEPLOY=1 npm run build
```

It is also noindexed and sitemap-excluded for the builds that do emit it — keep
`noindexPaths` in `src/data/site.ts` and `noindexPathnames` in
`astro.config.mjs` in sync if that changes.

Do **not** reuse the homepage Designer classes (`heading-style-*`,
`text-size-*`, `button-2`, `padding-section-*`) outside the homepage. They are
tuned for that one layout — `heading-style-h2` is 4.5rem/300 and
`heading-style-h6` is 0.875rem/600 (a label, not a heading), so cards lose their
typographic anchor and split-column headings wrap to four ragged lines. The kit
re-expresses the same visual DNA at sizes that hold up in any container.

Wiring, per page:

1. `import miriUiCss from '../../styles/miri-ui.css?raw'`, then the page's own
   override sheet after it, both rendered as `is:global` styles in the head slot.
2. Put `mk-page` on `bodyClass`, alongside the page's own class.
3. Compose sections as `section.mk-section > .mk-container > content`,
   alternating white and `--sand` bands, and close on `.mk-cta`.

The kit is loaded per page, never globally, so the homepage is untouched by it.
Every class is `mk-` prefixed and cannot collide with the Webflow bundle. Page
overrides stay in `src/styles/<page>.css` and should only hold what is genuinely
page-specific. The header comment in `miri-ui.css` documents each section.

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

Playwright defaults `BASE_URL` to `http://localhost:4321` (matching `astro preview`). DOM tests live in `tests/dom.spec.ts` (one viewport via the `dom` project); visual screenshot tests live in `tests/visual.spec.ts` (six viewport projects). On PRs and pushes to `master`, `.github/workflows/test.yml` runs two jobs: `test`
(`check` + `build` + `npm run test:dom`) and `visual`, which runs the full
screenshot suite inside the pinned `mcr.microsoft.com/playwright` image against
the committed `*-linux.png` baselines. **The visual job does not skip** — if you
change rendered output you must refresh the Linux baselines too, or CI fails
even though the deploy succeeds (they are separate workflows).

Refresh the Linux baselines with the same pinned image the CI job uses:

```bash
docker run --rm -v "$PWD":/w -w /w --ipc=host mcr.microsoft.com/playwright:v1.60.0-noble bash -c '
  npm ci && npm run build
  npx astro preview --host --force >/tmp/p.log 2>&1 &
  for i in $(seq 1 60); do curl -fs http://localhost:4321 >/dev/null && break; sleep 1; done
  npx playwright test tests/visual.spec.ts --update-snapshots
'
npm ci   # restore host binaries — the container overwrote node_modules via the bind mount
```

Two gotchas with that command. The container's `npm ci` installs Linux binaries
into the bind-mounted `node_modules`, so re-run `npm ci` on the host afterwards
or local builds break. And astro 7 records a running preview in
`.astro/preview.json`; a container that exits without stopping its server leaves
a stale PID there and every later `npm run preview` refuses to start with
"Another astro preview server is already running." Delete the file (it is
gitignored, so CI never sees it) or pass `--force`.

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
