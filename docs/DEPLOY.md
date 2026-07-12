# Deploying the container app

Deploy targets are defined in `wrangler.jsonc` under `env.staging` and
`env.production`. Each is a separate Worker (`glocal-packages-api-staging` /
`-production`) with its own D1 database and secrets. The steps below are for
**staging**; production is the same with `--env production` and its own
database, secrets, and origin.

For local development and the route list, see [`RUNNING.md`](./RUNNING.md).

## Prerequisites

- Node 22 and `npm install`
- A Cloudflare account with Workers + D1, and the CLI authenticated:
  ```bash
  npx wrangler login
  ```

## Placeholders to fill before the first deploy

`wrangler.jsonc` ships with placeholders that must be replaced per environment:

| Field | Placeholder | Replace with |
|---|---|---|
| `env.staging.d1_databases[0].database_id` | `00000000-…` | the real id from `wrangler d1 create` (below) |
| `env.staging.vars.ALLOWED_ORIGIN` | `https://replace-with-staging-web-origin.example` | the web origin — see the note below (currently inert) |

Secrets are **not** in `wrangler.jsonc` — they are set with `wrangler secret put`
(below) and never committed.

> **`ALLOWED_ORIGIN` is currently a no-op.** No code reads it yet — it is reserved
> for CORS on the public API, which is not wired in on this branch. Set it to the
> real web origin so it is correct when CORS lands, but it has no effect today.

## Staging deploy

```bash
# 1. Create the D1 database — prints the real database_id
npx wrangler d1 create glocal-packages-staging
#    → paste the id into env.staging.d1_databases[0].database_id in wrangler.jsonc

# 2. Set the Worker secrets (prompts for each value; never committed).
#    Generate strong random values, e.g.:  openssl rand -base64 32
#    Use DIFFERENT secrets for staging and production.
npx wrangler secret put SESSION_SECRET     --env staging   # signs admin session cookies
npx wrangler secret put SCRIPTORIA_API_KEY --env staging   # shared Scriptoria intake secret

# 3. Apply migrations to the remote D1 database
npm run db:migrate:staging

# 4. Deploy — the output prints the Worker URL
npm run deploy:staging
#    → https://glocal-packages-api-staging.<your-subdomain>.workers.dev
```

> A custom domain (e.g. `packages.example.org`) is optional — add it in the
> Cloudflare dashboard (Workers → Routes/Custom Domains). It becomes the URL
> clients (the iOS container) point at.

## Create an administrator

There is no self-serve admin signup on this branch, and the database starts
empty, so `/admin` has no one to sign in as until you insert a credential.

Generate a PBKDF2 password hash (in the format `src/lib/server/auth.ts` expects):

```bash
npm run hash:password -- "your-admin-password"
# → pbkdf2$100000$<salt>$<hash>
```

Then insert the administrator row into the **remote** D1 (use the hash above and
the current UTC timestamp for the date columns):

```bash
npx wrangler d1 execute DB --remote --env staging --command \
  "INSERT INTO administrators (id,email,display_name,password_hash,disabled,created_at,updated_at)
   VALUES ('admin-1','you@example.org','You','pbkdf2\$100000\$<salt>\$<hash>',0,'2026-07-12T00:00:00Z','2026-07-12T00:00:00Z')"
```

> Do **not** apply `prisma/seed.sql` (or any dev seed) to a real database — the
> seeded hashes are placeholders and unusable for production.

## Wire up the Scriptoria notification

The intake endpoint (`POST /api/v1/notifications/scriptoria`) requires
`Authorization: Bearer <SCRIPTORIA_API_KEY>`. Scriptoria's build engine sends the
notification via `appbuilder-buildengine-api` (`publish.sh`), reading the target
URL and headers from a per-server config, `notify/<server-name>/endpoint.json`,
in its secrets store. So the header and secret are **agreed, not hard-coded** —
provide the build-engine operator:

- **URL** — `https://<your-worker>/api/v1/notifications/scriptoria`
- **headers** — `["Authorization: Bearer <the SCRIPTORIA_API_KEY value>"]`
- your server's **`PUBLISH_NOTIFY` name** so it is included in the notify list

Notifications only fire from Scriptoria **production** (`SERVER_URL` contains
`app.scriptoria.io`) with `PUBLISH_NOTIFY` set. New packages arrive as `PENDING`;
a re-published package whose content changed returns to `PENDING` for re-review.
Both require admin approval before they are public.

## Verify

```bash
npm run deploy:dry-run       # build + wrangler dry-run — confirms bindings resolve
curl https://<your-worker>/health          # → 200
curl https://<your-worker>/api/v1/packages # → 200, active packages only
```

## Production

Repeat the whole flow with the production environment — a separate database,
separate secrets, and its own origin:

```bash
npx wrangler d1 create glocal-packages-production   # → paste id into env.production
npx wrangler secret put SESSION_SECRET     --env production
npx wrangler secret put SCRIPTORIA_API_KEY --env production
npm run db:migrate:production
npm run deploy:production
```

## Rollback

`wrangler deploy` keeps prior versions. Roll back from the Cloudflare dashboard
(Workers → the Worker → Deployments → roll back), or redeploy a known-good commit.
Migrations are forward-only — never edit an applied migration; add a new numbered
one instead.
