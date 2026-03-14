# Upgrade & Integration Walkthrough (March 2026)

This document captures the details of the Astro 6 upgrade and HighLevel integration configuration to ensure the technical settings are preserved.

## 1. Technical Stack
- **Framework**: Astro 6.0.4
- **CSS Engine**: Tailwind CSS 4.0.0 (Native Vite Plugin)
- **Deployment**: Cloudflare Pages (Static + Functions)
- **Runtime**: Node.js v22+

## 2. Tailwind 4 Configuration
We moved from the deprecated `@astrojs/tailwind` integration to the native `@tailwindcss/vite` plugin.
- **Config Storage**: Custom theme settings are now in `src/styles/global.css` using the `@theme` block.
- **Legacy File**: `tailwind.config.mjs` has been removed.

## 3. HighLevel & Image Integration
Form submissions are handled by `functions/api/submit-quote.js`.

### Features:
- **Image Hosting**: Photos are uploaded to Cloudflare R2 and served via `https://media.stokeleads.com/`.
- **GHL Custom Fields**:
  - `Quote Image`: Stores the direct URL of the uploaded image.
  - `Project Description`: Stores text + image URL link for redundancy.

### Configuration Snapshot (`wrangler.toml`):
The following IDs are required for the API to function. They are managed in the `[vars]` section of `wrangler.toml`:

- **Location ID**: `tV8qFLdWkBLBfjh64cFV`
- **Quote Image Field ID**: `4umRt0qz4rRZPDhjVQAD`
- **Description Field ID**: `cVY04IeJOEfpC42bqury`

> [!IMPORTANT]
> The **HIGHLEVEL_TOKEN** must be managed as a **Secret** in the Cloudflare Pages Dashboard. It should NOT be added to `wrangler.toml`.

## 4. Maintenance Notes
- **LCP Optimization**: Hero images are loaded conditionally based on screen size (AVIF preferred).
- **Service Selection**: The form is currently simplified (no service dropdown) to maximize conversion.
- **Node Requirement**: If deploying via a local terminal or custom CI, ensure Node v22 or higher is used.
