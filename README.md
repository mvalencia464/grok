# Northern Timber & Outdoor Living

Static marketing site for a cold-climate deck builder and general contractor. **Astro 5**, **Tailwind CSS**, **Cloudflare Pages** (static + Functions).

## Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start dev server |
| `npm run build` | Build to `./dist` |
| `npm run preview` | Preview production build |

## Deploy (Cloudflare Pages)

Connect the repo in [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → Pages → Connect to Git.

- **Build command:** `npm run build`
- **Build output directory:** `dist`

Cloudflare builds and deploys automatically on push. Ensure `wrangler.toml` has `name` and `pages_build_output_dir = "dist"` so the `functions/` API is used.

## Hero image

`public/hero.png` is loaded **only on desktop** (via `<picture>` + `media="(min-width: 1024px)"`); mobile uses a gradient so LCP stays fast. For best desktop LCP, use an optimized image (e.g. WebP, ~1600px wide) and replace or add `public/hero.webp` and a matching `<source>` in `Hero.astro`.

## Project structure

- `src/data/site.json` — Business info, services, testimonials, neighborhoods.
- `src/pages/` — index, services, about, contact.
- `src/components/` — QuoteForm (contact form island), QuoteSection, Hero, TrustBar, etc.
- `functions/api/submit-quote.js` — POST /api/submit-quote; creates a GHL contact with tags.

## Quote form & GoHighLevel

Form submits to **POST /api/submit-quote**. The Function creates a contact in GHL: name, email, phone, source "Website Quote Form", and **tags** (service type, neighborhood, `quote`, `website`). Project description can go in a GHL custom field if you set the env var.

**Env vars** (Cloudflare Pages → Settings → Environment variables):

- `HIGHLEVEL_TOKEN` — required (scopes: **contacts.write**; **locations/customFields.write** only if using project description custom field)
- `HIGHLEVEL_LOCATION_ID` — required
- `HIGHLEVEL_CUSTOM_FIELD_PROJECT_DESCRIPTION` — optional (GHL custom field ID for project description)

**Troubleshooting:** Form only works on the deployed site (not local dev). If the form fails, check the latest deployment is Live, env vars are set, and hard-refresh or use incognito. "Server configuration error" = missing env vars. Build error "Return statement is not allowed" = use an `if (condition) { ... }` block in Astro script instead of top-level `return`. Deploy "Must specify a project name" = `wrangler.toml` needs `name = "grok"` and `pages_build_output_dir = "dist"`.
