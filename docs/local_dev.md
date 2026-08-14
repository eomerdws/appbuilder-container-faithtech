# Running the container app

Single SvelteKit worker (Cloudflare Workers + D1) serving the public package
catalog, the admin console, the public package API, and the Scriptoria
intake endpoint.

## Prerequisites

- Node 22.23.1
- Run `npm install` (runs `svelte-kit sync` and generates the Prisma client)
- A Cloudflare account with Workers + D1, and the CLI authenticated. Without
  this login, the setup step below may fail:

  ```bash
  npx wrangler login
  ```

## Local Development

### Setup

This is the fastest path: one setup command handles Cloudflare config, secrets, and local D1 migrations for you. Note that you may be asked questions on the command line which you need to answer.

```bash
npm run setup
```

### Seeding the development database

Optionally seed the database for testing purposes. Run the main seed data first — it's great for testing the frontend. The dev seed sets up an admin user (username and password provided at login) — do not use it in production. There is a detailed [diagram of the database](/docs/database.md).

```bash
npm run db:seed:local
```

Add an administrator user and password. You will find those credentials on the login page. **NOTE: it is not intended for this user to be served online.**

```bash
npm run db:seed:dev
```

Then build SvelteKit and use Wrangler to run a local development environment:

```bash
npm run build
npx wrangler dev
```

### What pages are available?

| Path | What | Handler File |
| :------------------------------------------ | :----------------------------------------------------------------- | :------------------------------------------------------ |
| `/` (GET) | Public catalog + search | `src/routes/+page.server.ts` |
| `/packages/:id` (GET) | Package detail page | `src/routes/packages/[id]/+page.server.ts` |
| `/login` (GET) | Admin sign-in form | `src/routes/login/+page.server.ts` |
| `/login` (POST) | Admin sign-in action | `src/routes/login/+page.server.ts` |
| `/health` (GET) | Health check | `src/routes/health/+server.ts` |
| `/api/v1/packages` (GET) | Public package search API (iOS container) | `src/routes/api/v1/packages/+server.ts` |
| `/api/v1/packages/:id` (GET) | Public package detail API (iOS container) | `src/routes/api/v1/packages/[id]/+server.ts` |
| `/api/v1/notifications/scriptoria` (POST) | Scriptoria intake (`Authorization: Bearer $SCRIPTORIA_API_KEY`) | `src/routes/api/v1/notifications/scriptoria/+server.ts` |
| `/logout` (POST) | Clear the admin session cookie | `src/routes/logout/+server.ts` |
| `/admin/*` (layout load) | Admin session guard — requires an administrator sign-in | `src/routes/admin/+layout.server.ts` |
| `/admin` (GET/POST) | Admin console — package review load / moderation action | `src/routes/admin/+page.server.ts` |
| `/admin/settings` (GET/POST) | Site title, GlobeHero background image choice, and theme (admin) | `src/routes/admin/settings/+page.server.ts` |

> **Admin sign-in:** this branch has no self-serve admin creation. The first-run
> `/setup` flow and a dev-login seed live on the `package-catalogue-ui` branch.
> On this branch, create an administrator credential in local D1 before signing
> in (or use the `package-catalogue-ui` branch to log in via `/setup`).

## Checks

Type-check with svelte-check against the test tsconfig, then run the unit/integration tests in the workerd runtime:

```bash
npm run typecheck
npm test
```

Run both of the above together:

```bash
npm run check
```

Build and run a Wrangler dry-run to verify your bindings:

```bash
npm run deploy:dry-run
```

## Deploy

Deploying to Cloudflare (staging/production) is covered in [`deploying/README.md`](./deploying/README.md).

## Troubleshooting

See [`troubleshooting.md`](./troubleshooting.md) for common local dev, testing,
and deploy issues, plus a full reference table of `npm run` commands.

## Notes

- Data access is Prisma over D1; the query-compiler wasm is externalized in
  `vite.config.ts` and placed for wrangler at build time.
- Schema, migrations, and data model are documented in `README.md`.
