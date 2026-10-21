# DHIYA Boutique — Vercel deployment fix

## Why the original deployment failed

The original npm `build` command ran Vinext (Vite/Cloudflare Workers). That build
produced `dist/` files but not the `.next/routes-manifest.json` expected by
Vercel's **Next.js** framework integration. The original API/database routes
also imported the Cloudflare-specific `cloudflare:workers` module.

## Fixed

- Default scripts: `dev` → `next dev`, `build` → `next build`, `start` → `next start`.
- Cloudflare-specific imports in the PostgreSQL and AI-preview routes replaced
  with `process.env` for Vercel's Node.js runtime.
- `vercel.json` selects the `nextjs` framework without overriding output paths.
- Original client pages, visuals, animations, Three.js components, and demo checkout
  have been kept.
- Alternate `dev:cloudflare`, `build:cloudflare`, and `start:cloudflare` commands
  preserve the old runtime entry points for optional compatibility testing.

## Push these changes using Windows CMD

```cmd
cd /d E:\DHIYA_Boutique
git add .
git commit -m "Fix Vercel build using native Next.js"
git push origin main
```

## Configure Vercel

1. Open Vercel → your DHIYA-BOUTIQUE project → Settings → Build and Deployment.
2. Set **Framework Preset: Next.js**.
3. Set **Root Directory:** repository root (do not set to `app`, `build`, or `dist`).
4. Set **Build Command:** `pnpm build` or leave automatic detection enabled.
5. Set **Output Directory:** leave override **disabled/empty** (do not set `dist`).
6. Use the project's `pnpm-lock.yaml` for installation. Set Node.js to 22.x
   or newer compatible with `engines.node`.
7. Redeploy, ideally without the build cache for the first corrected build.

## Environment variables

Optional (Vercel Settings → Environment Variables):

- `DATABASE_URL`: server-only Neon PostgreSQL URL, to save demo orders remotely.
- `ENABLE_IMAGE_GENERATION`: `true` only when AI previews are configured.
- `OPENAI_API_KEY`: server-only API key for AI previews.

Without `DATABASE_URL`, the **mock-only** demo checkout uses browser storage.
Payments are simulations, not real payments; the repo does not have live order
fulfilment or a production admin dashboard.

## Verify locally

```cmd
cd /d E:\DHIYA_Boutique
npx --yes pnpm@11.25.0 install
npx --yes pnpm@11.25.0 build
npx --yes pnpm@11.25.0 dev
```

Next.js should start at http://localhost:3000. If Next.js reports an additional
build-time error, use that exact error to identify the next fix; the code cannot
be fully runtime-tested without installing its dependency tree.
