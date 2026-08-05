# Running the container app

Single SvelteKit worker (Cloudflare Workers + D1) serving the public package
catalogue, the admin console, the public package API, and the Scriptoria
intake endpoint.

## Prerequisites

- Node 22.23.1
- `npm install` (runs `svelte-kit sync` and generates the Prisma client)
- `npx wrangler login  # Without this login the the setup step may fail`

## Local development

### Automated Method

``` bash
# 1. Initial setup
npm run setup

#Optionally you can seed the database for testing purposes:
npm run db:seed:local   # Main Seed data (needs to be run first); great for testing the frontend 
npm run db:seed:dev     # Admin user setup (username and password provided at login) DO NOT USE THIS IN PRODUCTION

# 2. Build svelte and svelte-kit settings 
npm run build 

# 3. Run (Wrangler dev)
npx wrangler dev 
 
```

### Manual Method

```bash
# 1. Cloudflare config — copy the example; the defaults work for local dev
#    as-is. This file is gitignored (fork-specific database IDs, worker
#    names) — without it, db:migrate:local/db:seed:local/wrangler dev and
#    every deploy/secret script below fail with a missing-config error.
cp wrangler.jsonc.example wrangler.jsonc

# 2. Secrets — copy the example and set real local values
cp .dev.vars.example .dev.vars
npm run set-scriptoria-key -- --env staging # Optional include the URL to your staging Cloudflare worker
npm run set-session-secret -- --env staging

# These two npm commands will set the following keys in .dev.vars
# It will also use the env to send it to staging or production. 
# NOTE: This is a one way hash. You will not be able to view it on Cloudflare.  

#    SESSION_SECRET       = any long random string
#    SCRIPTORIA_API_KEY   = any local dev secret

# 3. Local D1 database — apply schema, optionally seed demo packages
npm run db:migrate:local
# Optional to add seed data so that you can see how it works or test a new feature in staging or local development
npm run db:seed:local       # Main seed data; packages etc 
npm run db:seed:dev         # Admin user setup (username and password will be provided)

# 4. Run (Vite dev server with Cloudflare bindings emulated)
npm run build 

# 5. Run (Wrangler dev)
npx wrangler dev
```

### What you can hit

| Path                                        | What                                                            |
| ------------------------------------------- | --------------------------------------------------------------- |
| `/`                                         | Public catalogue + search                                       |
| `/api/v1/packages`, `/api/v1/packages/{id}` | Public package API (iOS container)                              |
| `POST /api/v1/notifications/scriptoria`     | Scriptoria intake (`Authorization: Bearer $SCRIPTORIA_API_KEY`) |
| `/health`                                   | Health check                                                    |
| `/admin`                                    | Admin console — requires an administrator sign-in               |
| `/admin/settings`                           | Upload the public catalogue's GlobeHero background image (admin) |
| `/hero-background`                          | Serves the current GlobeHero background image from R2           |

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

Deploying to Cloudflare (staging/production) is covered in [`deploy.md`](./deploy.md).

## Troubleshooting

See [`troubleshooting.md`](./troubleshooting.md) for common local dev, testing,
and deploy issues, plus a full reference table of `npm run` commands.

## Notes

- Data access is Prisma over D1; the query-compiler wasm is externalized in
  `vite.config.ts` and placed for wrangler at build time.
- Schema, migrations, and data model are documented in `README.md`.
