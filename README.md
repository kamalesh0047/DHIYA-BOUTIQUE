# DHIYA Boutique

Next.js App Router / React / TypeScript storefront using the supplied DHIYA landing film. The **default build now targets Vercel using standard Next.js**, including its `.next` output. Optional legacy Vinext/Cloudflare build scripts remain under `*:cloudflare`. Database adapter: PostgreSQL over HTTP using Neon's serverless driver. No D1 or Firebase is used by current application code.

## Included

- Fixed-screen home experience. The first scroll gesture (including upward scroll), touch gesture, keyboard action or play cue starts the supplied film. It plays through before shopping buttons appear. The homepage never unlocks page scrolling; store routes scroll normally. No session flag skips the film and there is no normal skip button. Only media failure offers a continuation fallback.
- Responsive cream/maroon storefront, mobile navigation and individual product routes.
- Automatically orbiting arched carousel in React Three Fiber / Three.js. No previous/next arrows. Clicking a photo pauses the orbit, spins it through 360 degrees and then reveals collection text and a product link. Keyboard photo selectors, pause/resume and reduced-motion support are included.
- WebGPU node shaders animate silk ribbons, card ripples and floating gold particles, with pointer parallax and a gold orbit ring. WebGL2 uses the same TSL materials where supported; a GSAP DOM gallery is the last fallback.
- GSAP/ScrollTrigger gesture capture, film-to-boutique staggered reveal and product entrances. Lenis smooth scrolling applies to store routes, not the fixed homepage.
- Sample collections with six downloaded Unsplash photos, photographer/source credits, search, category filters and price sorting.
- Browser-saved wishlist and shopping bag with quantities.
- Saree customizer with Save saree & go to bag: saves an immutable design snapshot and its SVG/AI thumbnail before navigating. Saved designs can be reopened and edited from the bag; distinct designs stay separate. Fabric, body/border colour, width, pallu, motif, blouse and preview survive mock checkout/order history. Prices are clearly marked demo estimates, pending a real boutique quote.
- Optional AI preview endpoint; generated previews are resized to a browser-friendly WebP thumbnail when saved.
- Clearly labelled MOCK checkout and simulated success. No money is charged and no orders are fulfilled.
- Order history scoped to an anonymous HttpOnly cookie when PostgreSQL is configured. Until configuration, mock orders explicitly use browser storage. A configured database outage returns an error, not a fake persistence success.

## Run locally

Requires Node >=22.13 and pnpm 11.25.

```
corepack enable
pnpm install
```

Copy `.env.example` to `.env.local` and set your server-only `DATABASE_URL`. The hosted adapter expects a Neon PostgreSQL connection, or a compatible PostgreSQL HTTP endpoint. A raw localhost PostgreSQL TCP connection is not supported by this Workers adapter. Use a Node deployment with a TCP driver if choosing a different PostgreSQL provider without an HTTP gateway.

Apply committed PostgreSQL migrations before connecting the store:

```
pnpm db:migrate
pnpm dev
```

On Windows CMD, copy with `copy .env.example .env.local`. Standard Next.js runs locally at http://localhost:3000. Do not commit secrets. Configure hosted values using the Site's runtime environment settings, then redeploy if needed. Sites does not apply these external PostgreSQL migrations automatically; `pnpm db:migrate` does so explicitly through the supplied connection.

Without `DATABASE_URL`, the mock checkout remains available and stores demo orders on the browser only. This is clearly indicated on the confirmation. Switching to PostgreSQL does not import browser-only demo history or historical D1 demo rows automatically. The old `drizzle/` folder contains immutable historical D1 migration records, not active application migrations. Current PostgreSQL migrations live in `db/postgres/migrations`.

## Checks

```
pnpm exec tsc --noEmit
node --test tests/store-api.test.mjs
pnpm build
```

API tests use a mocked PostgreSQL transport and exercise real repository/API code: parameterized SQL, authoritative prices, session isolation, invalid items, origins, configuration fallback and database outage behaviour. A real PostgreSQL connection has not been supplied or tested. Browser visual QA was unavailable.

## Images

See IMAGE_CREDITS.md for original Unsplash photo pages and photographer names. These inspiration photos do not represent verified DHIYA stock. Names, prices and fabric descriptions are illustrative. The original landing film remains unchanged.

## AI preview setup

Requires server-only `OPENAI_API_KEY` and `ENABLE_IMAGE_GENERATION=true`. Without them the endpoint returns an explicit 503 message. This integration has not been tested against a paid image service. Add customer authentication, quotas and budget controls before exposing paid image generation publicly. Concepts require boutique approval and a final quote before production.

## Remaining live-store work

Actual stock/catalogue data, customer authentication, protected admin dashboard, verified boutique contact/business details, live fulfilment and final policies. Payments intentionally remain mocked as requested. Browser wishlist, bag and designs are not cross-device synced yet.

## Vercel deployment (standard Next.js)

The GitHub repository should be imported as **Next.js**, with the repository root
as its Root Directory (leave blank), build command `pnpm build` (or automatic),
and **no custom Output Directory** (Vercel uses `.next`).

The default `pnpm build` script runs `next build`, not Vinext. The previously
reported `NEXT_NO_ROUTES_MANIFEST` error occurs when Vinext emits Cloudflare
output while Vercel expects the Next.js `.next/routes-manifest.json`. The
Cloudflare-only `cloudflare:workers` environment imports in API/database routes
were replaced with `process.env`, so those routes can run on Vercel Node.js.

Environment variables are optional for a mock-only deploy. To store demo orders
online, set `DATABASE_URL` in Vercel Project Settings -> Environment Variables
to a Neon PostgreSQL connection string (and apply migrations using
`pnpm db:migrate`). Without it, demo orders are stored in the current browser.
`OPENAI_API_KEY` and `ENABLE_IMAGE_GENERATION=true` are optional for AI previews.
Never put these secrets in the GitHub repository, or in `NEXT_PUBLIC_*` values.

For local development:

```bash
pnpm install
pnpm dev
pnpm build
```

For a Cloudflare/Vinext build instead of Vercel, use
`pnpm build:cloudflare` and `pnpm dev:cloudflare`. The original Cloudflare
deployment scripts are retained for reference, but should be validated on that
platform after the environment adapter change.
