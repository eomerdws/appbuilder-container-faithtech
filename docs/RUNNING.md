# Running the container app

Single SvelteKit worker (Cloudflare Workers + D1) serving the public package
catalogue, the admin console, the public package API, and the Scriptoria
intake endpoint.

## Prerequisites

- Node 22
- `npm install` (runs `svelte-kit sync` and generates the Prisma client)

## Local development

```bash
# 1. Secrets — copy the example and set real local values
cp .dev.vars.example .dev.vars
#    SESSION_SECRET       = any long random string
#    SCRIPTORIA_API_KEY   = any local dev secret

# 2. Local D1 database — apply schema, optionally seed demo packages
npm run db:migrate:local
npm run db:seed:local        # optional: representative packages to browse

# 3. Run (Vite dev server with Cloudflare bindings emulated)
npm run dev                  # http://localhost:5173
```

### What you can hit

| Path | What |
|---|---|
| `/` | Public catalogue + search |
| `/api/v1/packages`, `/api/v1/packages/{id}` | Public package API (iOS container) |
| `POST /api/v1/notifications/scriptoria` | Scriptoria intake (`Authorization: Bearer $SCRIPTORIA_API_KEY`) |
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

## Deploy

Deploying to Cloudflare (staging/production) is covered in [`DEPLOY.md`](./DEPLOY.md).

## Notes

- Data access is Prisma over D1; the query-compiler wasm is externalized in
  `vite.config.ts` and placed for wrangler at build time.
- Schema, migrations, and data model are documented in `README.md`.
