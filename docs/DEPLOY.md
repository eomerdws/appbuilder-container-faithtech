# Deploying the container app

Deploy targets are defined in `wrangler.jsonc` under `env.staging` and
`env.production`. Each is a separate Worker (`appbuilder-container-staging` /
`-production`) with its own D1 database and secrets. The steps below are for
**staging**; production is the same with `--env production` and its own
database, secrets, and origin.

For local development and the route list, see [`RUNNING.md`](./RUNNING.md).

## Prerequisites

- Node 22.23.1 and `npm install`
- A Cloudflare account with Workers + D1, and the CLI authenticated:

  ```bash
  npx wrangler login
  ```
- `wrangler.jsonc` itself — it's gitignored (fork-specific database IDs and
  worker names shouldn't be public), so create your own from the committed
  example before anything below will work:

  ```bash
  cp wrangler.jsonc.example wrangler.jsonc
  ```

  Without this file, every command on this page — `wrangler deploy`,
  `db:migrate:*`, `create-admin`, `set-session-secret`, `set-scriptoria-key`,
  `verify:secrets` — fails immediately with a missing-configuration error.

## Placeholders to fill before the first deploy

Your new `wrangler.jsonc` (copied from the example above) ships with
placeholders that must be replaced per environment:

| Field                                     | Placeholder                                       | Replace with                                          |
| ----------------------------------------- | ------------------------------------------------- | ----------------------------------------------------- |
| `env.staging.d1_databases[0].database_id` | `00000000-…`                                      | the real id from `wrangler d1 create` (below)         |
| `env.staging.vars.ALLOWED_ORIGIN`         | `https://replace-with-staging-web-origin.example` | the web origin — see the note below (currently inert) |

Secrets are **not** in `wrangler.jsonc` — they are generated and set via
`npm run set-session-secret` / `npm run set-scriptoria-key` (below), which
wrap `wrangler secret put`, and are never committed.

> **`ALLOWED_ORIGIN` is currently a no-op.** No code reads it yet — it is reserved
> for CORS on the public API, which is not wired in on this branch. Set it to the
> real web origin so it is correct when CORS lands, but it has no effect today.
>
> Using CORS for this application when considering that this app is only for being served
> for the iOS container app.

## Staging deploy

```bash
# 1. Create the D1 database — prints the real database_id
npx wrangler d1 create appbuilder-container-staging
#    → paste the id into env.staging.d1_databases[0].database_id in wrangler.jsonc

# 2. Set the Worker secrets (never committed). Use DIFFERENT secrets for
#    staging and production.
npm run set-session-secret -- --env staging   # generates + sets SESSION_SECRET
#    Signs admin session cookies. Never printed — nothing outside this
#    Worker needs it, unlike SCRIPTORIA_API_KEY below.

npm run set-scriptoria-key -- --env staging   # generates + sets SCRIPTORIA_API_KEY
#    Prints the value once at the end — that's what you send to your
#    Scriptoria build-engine operator (see "Wire up the Scriptoria
#    notification" below). It can't be retrieved again after this.

# 3. Apply migrations to the remote D1 database
npm run db:migrate:staging

# 4. Deploy — the output prints the Worker URL
npm run deploy:staging
#    → https://appbuilder-container-staging.<your-subdomain>.workers.dev
```

> A custom domain (e.g. `packages.example.org`) is optional — add it in the
> Cloudflare dashboard (Workers → Routes/Custom Domains). It becomes the URL
> clients (the iOS container) point at.
>
> Note: the first command will ask if you would like wrangler to save these settings for you.
> This is does technically work, however it places the information under d1_databases. Rather
> then actually putting it under the expected env.staging|production.d1_database[0].

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

**Self-test the shared secret** before involving the build-engine operator —
this distinguishes a credentials mismatch from every other kind of failure
without needing `wrangler tail` or a developer:

```bash
curl -i -X POST https://<your-worker>/api/v1/notifications/scriptoria \
  -H "Authorization: Bearer <the SCRIPTORIA_API_KEY value>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

- **`400 Invalid notification payload`** — the secret matched; you're just
  sending an empty test body instead of a real notification. This is success
  for the purposes of this test.
- **`401 Invalid or missing Scriptoria credentials`** — the secret does not
  match what's configured on this Worker. Re-run
  `npm run set-scriptoria-key -- --env staging` (or `production`) and send the
  freshly printed value to your build-engine operator again — don't try to
  hand-fix the existing one.

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
npx wrangler d1 create appbuilder-container-production   # → paste id into env.production
npm run set-session-secret -- --env production
npm run set-scriptoria-key -- --env production
npm run db:migrate:production
npm run deploy:production
```

## Rollback

`wrangler deploy` keeps prior versions. Roll back from the Cloudflare dashboard
(Workers → the Worker → Deployments → roll back), or redeploy a known-good commit.
Migrations are forward-only — never edit an applied migration; add a new numbered
one instead.
