The build succeeded perfectly — Astro compiled your static site to `./dist` in ~10 seconds, optimized 7 images (great compression ratios, e.g., 396kB → 166kB), and generated clean HTML routes. That's all good.

The failure happened during deployment with `npx wrangler pages deploy dist`:

- **Two warnings/errors**:
  1. Wrangler detected `wrangler.toml` but complained it's missing the required **`pages_build_output_dir`** field (needed for Pages to use the config file properly). It ignored the file and continued anyway.
  2. Then it hit **`✘ [ERROR] Must specify a project name.`** → this is the fatal one.

### Root Cause (as of March 2026)
Cloudflare Pages + Wrangler CLI behavior changed over time:
- `wrangler pages deploy <dir>` **requires** either:
  - A **project name** (via `--project-name my-site-name` flag) **or**
  - A valid `wrangler.toml` with **`name = "my-site-name"`** and **`pages_build_output_dir = "./dist"`** (or wherever your Astro build outputs).
- Without one of those, it can't know **which Pages project** to deploy to → hence "Must specify a project name."
- If `wrangler.toml` exists but lacks `pages_build_output_dir`, Pages ignores it (warning only) and falls back to needing the name flag or a pre-linked project.

Your `wrangler.toml` likely has `directory = "./dist"` (from our earlier advice), but Pages now expects **`pages_build_output_dir`** instead (or in addition) for full config support.

### Quick Fixes (Pick One)

1. **Recommended: Add `--project-name` to the deploy command** (easiest if the project already exists in your Cloudflare dashboard)
   - Find your Pages project name in the Cloudflare dashboard → Workers & Pages → your site → Overview (it's the subdomain slug or custom name you set).
   - Update your `package.json` scripts:
     ```json
     "deploy": "astro build && npx wrangler pages deploy dist --project-name=your-project-name-here"
     ```
   - Or run manually:
     ```
     npm run build
     npx wrangler pages deploy dist --project-name=your-project-name-here
     ```
   - If it's a new project, create it first in dashboard or with:
     ```
     npx wrangler pages project create your-project-name-here
     ```

2. **Fix wrangler.toml (better long-term)**
   Update your `wrangler.toml` to this minimal valid version:
   ```toml
   name = "your-project-name-here"           # ← must match your Pages project name exactly
   compatibility_date = "2026-03-06"         # or today's date
   pages_build_output_dir = "./dist"         # ← this is the required field Pages wants
   ```
   - Remove or comment out the old `[assets]` section if present (Pages uses `pages_build_output_dir` now).
   - Then just run:
     ```
     npm run build
     npx wrangler pages deploy dist
     ```
   - Wrangler will now use the config file correctly.

3. **If using Workers Static Assets instead of Pages** (future-proof option)
   - Skip `pages deploy` entirely.
   - Use plain `wrangler deploy` with your existing `[assets]` config:
     ```toml
     name = "your-worker-name"
     compatibility_date = "2026-03-06"
     [assets]
     directory = "./dist"
     not_found_handling = "single-page-application"  # or "404-page"
     ```
   - Command:
     ```
     npm run build
     npx wrangler deploy
     ```
   - This deploys as a Worker with static assets (Cloudflare's recommended path post-2025 Pages deprecation warnings).

### Next Steps to Get Live
1. Log in to Cloudflare dashboard → Workers & Pages → check/create your project name.
2. Choose fix #1 or #2 above (I'd start with adding `--project-name` — fastest).
3. Re-run deploy.
4. If still stuck, share your current `wrangler.toml` contents (redact sensitive parts) and the exact project name from dashboard — I can pinpoint the mismatch.

This is a common CLI/config gotcha in 2026 with Wrangler 4.x+ and Pages → once fixed, deploys are instant and reliable.

---

### Authentication error [code: 10000] when running the deploy command

If the **build** succeeds but the **deploy** step fails with:

```text
✘ [ERROR] A request to the Cloudflare API (.../pages/projects/grok) failed.
  Authentication error [code: 10000]
📎 It looks like you are authenticating Wrangler via a custom API token...
Please ensure it has the correct permissions for this operation.
```

then the API token used in the pipeline does **not** have permission to deploy to Cloudflare Pages.

**Option A — Prefer: Don’t use a custom deploy command (Pages Git deploy)**

- In **Workers & Pages** → your project → **Settings** → **Build**:
  - Set **Build command:** `npm run build`
  - Set **Build output directory / Publish directory / Path:** `dist`
  - **Remove or leave blank the “Deploy command”** if the UI allows it.
- When there is no custom deploy command, Cloudflare deploys the contents of `dist` automatically after the build. No `wrangler pages deploy` and no API token are needed for that step. Use this if your project type supports it.

**Option B — If you must keep a deploy command: fix the token**

- The token in `CLOUDFLARE_API_TOKEN` (project env or build settings) must be allowed to deploy Pages.
- Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens) → Create Token or edit the one you use.
- Use a template that includes **Cloudflare Pages** (e.g. “Edit Cloudflare Workers”) or add a custom token with:
  - **Account** → **Cloudflare Pages** → **Edit**
- Save and set that token as `CLOUDFLARE_API_TOKEN` in your project’s **Environment variables** (or build env) so the deploy step uses it.

**Also:** Ensure the latest `wrangler.toml` (with `pages_build_output_dir = "dist"`) is committed and pushed so the deploy step sees the correct config.