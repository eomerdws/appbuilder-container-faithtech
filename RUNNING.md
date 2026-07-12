# Running the container app

Single SvelteKit worker (Cloudflare Workers + D1) serving the public package
catalogue, the admin console, the public package API, and the Scriptoria
intake endpoint.

## Prerequisites

- Node 22
- `npm install` (runs `svelte-kit sync` and generates the Prisma client)

## Local development

```bash
# 1. Secrets — copy the example and set a real local value
cp .dev.vars.example .dev.vars
#    SESSION_SECRET = any long random string

# 2. Local D1 database — apply schema, optionally seed demo packages
npm run db:migrate:local
npm run db:seed:local        # optional: representative packages to browse

# 3. Run the full app in the real Workers runtime (workerd + Prisma over D1)
npm run build && npx wrangler dev    # http://localhost:8787
```

> **Which dev command?** Use `npm run build && npx wrangler dev` for the whole
> app — it runs in the real Workers runtime, so Prisma over D1 works. Plain
> `npm run dev` (Vite) is faster with HMR, but **Prisma-backed routes (`/`,
> `/api/v1/packages`, `/admin`) return 500 under Vite** because the
> query-compiler wasm is only bundled for `vite build`, not `vite dev`
> (verified). Use `npm run dev` only for isolated UI work; use `wrangler dev`
> for anything that touches the database. (`/health` works under either.)

### What you can hit

| Path | What |
|---|---|
| `/` | Public catalogue + search |
| `/api/v1/packages`, `/api/v1/packages/{id}` | Public package API (iOS container) |
| `POST /api/v1/notifications/scriptoria` | Scriptoria intake (open — no API key; new/changed packages land as `PENDING`) |
| `/health` | Health check |
| `/admin` | Admin console — requires an administrator sign-in |

> **Admin sign-in:** this branch has no self-serve admin creation. The first-run
> `/setup` flow and a dev-login seed live on the `package-catalogue-ui` branch.
> On this branch, create an administrator credential in local D1 before signing
> in (or use the `package-catalogue-ui` branch to log in via `/setup`).

## Checks

```bash
npm run typecheck            # svelte-check + test tsconfig
npm test                     # unit/integration tests in the workerd runtime
npm run check                # typecheck + test
npm run deploy:dry-run       # build + wrangler dry-run (verifies bindings)
```

## Deploy (staging)

```bash
# One-time: create the D1 database, then put its id in wrangler.jsonc (staging)
npx wrangler d1 create glocal-packages-staging

# Set the Worker secret (never commit it)
npx wrangler secret put SESSION_SECRET --env staging

# Apply migrations to the remote DB, then deploy
npm run db:migrate:staging
npm run deploy:staging
```

Set `ALLOWED_ORIGIN` (in `wrangler.jsonc`, per environment) to the real web
origin. Do not apply `prisma/seed.sql` to production.

## Notes

- Data access is Prisma over D1; the query-compiler wasm is externalized in
  `vite.config.ts` and placed for wrangler at build time.
- Schema, migrations, and data model are documented in `README.md`.
