# Miri Consulting site agent cookbook

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

```bash
npm run build
npm run preview
BASE_URL=http://localhost:4322 npm run test:visual
```

## Run visual regression against production

After GitHub Pages is live at `https://www.miri-consulting.com`:

```bash
npm run test:visual:production
```

## Update visual baselines after intentional changes

```bash
BASE_URL=http://localhost:4322 npm run test:visual:update
```

## Deploy

Pushes to `master` run `.github/workflows/deploy.yml`. After the first successful deploy, set GitHub Pages source to **GitHub Actions** in repository settings.
