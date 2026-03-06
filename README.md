# Northern Timber & Outdoor Living — Contractor Site

A static, high-performance marketing site for a cold-climate deck builder and general contractor. Built with **Astro 5**, **Tailwind CSS**, and optimized for 98+ Lighthouse, fast LCP, and zero unnecessary JavaScript.

## Stack

- **Astro 5** — static output (`output: 'static'`)
- **Tailwind CSS** — premium 2026 aesthetic (light neutrals, soft grays, muted wood, restrained teal accent)
- **Cloudflare** — deploy `./dist` via Workers Static Assets / Pages

## Commands

| Command        | Action           |
|----------------|------------------|
| `npm run dev`  | Start dev server |
| `npm run build`| Build to `./dist`|
| `npm run preview` | Preview production build |

## Deploy (Cloudflare Pages)

**Git-connected:**

1. In [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → Create → Pages → Connect to Git → choose this repo.
2. **Build command:** `npm run build`
3. **Build output / Publish directory / Path:** `dist` — this is the folder Astro outputs and the one Cloudflare should deploy.
4. **Deploy command** (if the UI requires one): `npx wrangler pages deploy dist` (or add `--project-name=YOUR_PROJECT_NAME` if you get "Must specify a project name"; see `troubleshooting.md`) — use this so the built `dist` folder is deployed to Pages. Do *not* use `npx wrangler deploy` (that’s for Workers).

## Project structure

- `src/data/site.json` — single source of truth (business info, services, testimonials, neighborhoods). Edit to update site content.
- `src/layouts/Layout.astro` — header (logo + nav + phone CTA), footer (hours, address, social, trust badges).
- `src/pages/` — index, services, about, contact.
- `src/components/` — Hero, TrustBar, ServiceCard, ReviewCard, ProcessSteps, Gallery, QuoteSection, QuoteForm.
- `functions/api/submit-quote.js` — Cloudflare Pages Function: receives quote form POST, creates a contact in GoHighLevel and adds a note with service/neighborhood/project details.

## Quote form & GoHighLevel (GHL)

The Contact page form submits to **POST /api/submit-quote**, which creates a contact in GHL and attaches a note with service type, neighborhood, and project description.

**Required environment variables** (set in Cloudflare Pages → your project → Settings → Environment variables):

- `HIGHLEVEL_TOKEN` — GHL API token (Private Integration or OAuth access token).
- `HIGHLEVEL_LOCATION_ID` — GHL location/sub-account ID.

Optional next step: add **Cloudflare Turnstile** for spam protection (test sitekey for dev, production key for live).

## Performance

- Minimal JS: only the quote form uses an Astro island (`client:idle`).
- Images: Astro `<Image />` with remote Unsplash placeholders (avif); replace with client photos when ready.
- No third-party script bloat; fonts loaded with `media="print"` + `onload` for non-blocking.

## Aesthetic

Light neutrals, soft grays, muted wood tones, restrained teal/green accent, generous whitespace, subtle hovers and transitions. High-end outdoor living brand feel — trustworthy and aspirational.
