# Troubleshooting

Common problems when running, testing, or deploying this project, and the
`npm run` command you'll reach for most — see [`local_dev.md`](./local_dev.md) for
local setup and [`deploy.md`](./deploy.md) for staging/production.

## Common issues

### `wrangler` fails with "no configuration file found" (or similar)

`wrangler.jsonc` is gitignored (it holds fork-specific database IDs and
Worker names) and doesn't exist until you create it.

Recommended: run `npm run setup` (which seeds it for you), or manually:

If the above fails try:

```bash
cp wrangler.jsonc.example wrangler.jsonc
```

Most `db:*`, `deploy:*`, and secret-related scripts call
`scripts/ensure-wrangler-config.mjs` first, which prints this same fix instead
of Wrangler's generic error — read the message, it names the exact command.

### Local dev throws about a missing secret / `SESSION_SECRET/SCRIPTORIA_API_KEY` undefined

`.dev.vars` is also gitignored. Copy the example and fill in values:

```bash
cp .dev.vars.example .dev.vars
```

You don't normally need to edit it by hand — `npm run set-session-secret` and
`npm run set-scriptoria-key` both create `.dev.vars` from the example
automatically (if it's missing) and write the generated value into it.

### A 500 Error message in local development

- Run `npm run build`
- Run `npx wrangler dev`

If that still fails:

- `rm -Rf node_modules`
- `rm -Rf .svelte-kit`
- `rm -Rf .wrangler`

Then run through the instructions for [`local_dev.md`](./local_dev.md) again.

### Can't sign in to `/admin` — no administrator exists

For local development use `npm run db:seed:dev`. For staging or production run:

```bash
# Staging 
npm run create-admin -- --env staging --email you@example.org --password "<your-password>"

# Production 
npm run create-admin -- --env production --email you@example.org --password "<your-password>"
```

### `npm run typecheck` (or `svelte-check`) reports hundreds of unrelated errors from Svelte's own compiled runtime

A stale build (`.svelte-kit/output`, `.svelte-kit/cloudflare`,
`.svelte-kit/cloudflare-tmp`) gets pulled in transitively even though
`tsconfig.json`'s `exclude` lists it — `exclude` only filters *root* files,
not files reached through imports. `npm run typecheck` already runs
`scripts/clean-build-output.mjs` first to avoid this; if you're invoking
`svelte-check`/`tsc` directly instead of through the npm script, run
`node scripts/clean-build-output.mjs` yourself first.

### A new component test isn't being picked up (or runs in the wrong suite)

Component tests (`src/routes/**` via `@testing-library/svelte`) can't be
colocated as `+page.test.ts` — SvelteKit's router reserves any `+`-prefixed
filename, so `svelte-kit sync` hard-fails. Instead they live flat in `test/`
alongside the `workerd` domain tests, and each Vitest config lists the same 5
filenames explicitly: `vitest.config.ts`'s `test.exclude` and
`vitest.config.components.ts`'s `test.include`. Adding a new component test
means adding its filename to **both** lists, or it either gets skipped
entirely or run under the wrong (workerd/jsdom) environment.

### A multi-statement database write isn't atomic / partially applies on failure

The Prisma D1 adapter does not guarantee transactions. Reads go through
Prisma; any write that must be atomic (see `ingestNotification` and
`moderatePackage` in `src/lib/server/`) uses raw D1 `batch()` instead. If
you're adding a new multi-statement write, follow that same pattern rather
than assuming a Prisma transaction will roll back.

### Scriptoria notifications started failing with 401 after they were working

Something rotated `SCRIPTORIA_API_KEY` — most likely `npm run setup` or
`npm run set-scriptoria-key` was run again for that environment. Both
generate a **new** secret and overwrite the old one immediately; the old
value can't be recovered. Re-run `npm run verify:endpoint` to regenerate
`endpoint.json` with the current key, and hand the new file to a Scriptoria administrator.

### All admins were suddenly signed out

`SESSION_SECRET` was rotated for that environment (`npm run setup` or
`npm run set-session-secret`). Every existing session cookie was signed with
the old secret, so all of them stop validating the instant the new one is
set — this is expected, not a bug. Admins just need to sign in again.

### `wrangler d1 create` didn't put the database ID where the app reads it

Pass `--env staging` (or `--env production`) **and** `--update-config`
together. Omit `--env` and Wrangler writes the ID to the top-level
`d1_databases` array instead of `env.staging.d1_databases[0]` /
`env.production.d1_databases[0]` — and this Worker's bindings are entirely
per-environment, so a top-level entry is silently never read.

### `npm run db:migrate:staging` / `:production` fails or a deploy references a table that doesn't exist yet

Migrations must be applied before the code that depends on them is deployed,
and are forward-only — never hand-edit a migration that's already been
applied; add a new numbered one instead. Confirm required secrets are set
first with `npm run verify:secrets -- --env <env>`, and that you're logged in
(`npx wrangler login`).

### `endpoint.json` looks wrong, or you're not sure what's in it

Run `npm run verify:endpoint`. It checks the file exists, that its URL is a
production URL (not staging), and that its Authorization header matches the
current `.dev.vars` `SCRIPTORIA_API_KEY` — and rewrites the file in place if
any of that is wrong, prompting you for a production URL if one is needed and
none was given via `--url`.

## `npm run` command reference

Flags after `--` are forwarded to the underlying script, e.g.
`npm run set-scriptoria-key -- --env staging --url https://...`.

| Command | What it does | Parameters | Cautions |
| --- | --- | --- | --- |
| `dev` | Starts the Vite dev server (SvelteKit, no Cloudflare bindings). | none | — |
| `build` | Builds the production bundle (`.svelte-kit/cloudflare`). | none | — |
| `preview` | Serves the built output locally via Vite's preview server. | none | Serves whatever `build` last produced — rebuild first if source changed. |
| `typecheck` | Clears stale build output, syncs SvelteKit, then type-checks app and test code (`svelte-check` + `tsc`). | none | — |
| `lint:check` | Runs ESLint with no fixes; fails on any violation. | none | — |
| `lint:format` | Runs ESLint with `--fix`. | none | Rewrites files in place — review the diff before committing. |
| `check` | Runs `typecheck`, `lint:check`, and both test suites — the standard "is this done" gate. | none | — |
| `test` | Runs the `workerd` domain test suite (`test/*.test.ts` via `@cloudflare/vitest-pool-workers`), applying migrations to an isolated per-file D1 instance. | optional: a test file path, e.g. `npm run test -- test/packages.test.ts` | — |
| `test:components` | Runs the Svelte component suite (jsdom + Testing Library) for the 5 files listed in `vitest.config.components.ts`. | optional: a test file path | — |
| `db:generate` | Regenerates the Prisma client into `src/lib/server/generated/prisma`. | none | Never hand-edit the generated output; rerun this instead. |
| `db:format` | Formats `prisma/schema.prisma`. | none | Rewrites `schema.prisma` in place. |
| `db:validate` | Validates `prisma/schema.prisma` without changing anything. | none | — |
| `db:check` | Runs `db:format`, `db:validate`, then `db:generate` in sequence. | none | Rewrites `schema.prisma` (via `db:format`) as part of the chain. |
| `diff-db` | Currently just an alias for `db:validate`. | none | Despite the name, it does not run `prisma migrate diff` — don't rely on it to show a schema diff. |
| `db:migration:initial` | Regenerates `migrations/0001_initial.sql` from `schema.prisma` via `prisma migrate diff --from-empty`. | none | **Never rerun once the initial migration has shipped to any shared environment** — it overwrites the file outright; add a new numbered migration instead. |
| `db:migrate:local` | Applies all pending migrations to the local D1 instance (auto-seeds `wrangler.jsonc` if missing). | none | Local only — safe to run repeatedly. |
| `db:seed:local` | Loads `prisma/seed.sql` (base package catalogue data) into local D1. | none | Local only. |
| `db:seed:dev` | Loads `prisma/seed.dev.sql` (a dev administrator account) into local D1 and prints its login. | none | **Local only — never run against a real deployment.** The seeded credential is not meant for production use. |
| `db:migrate:staging` | Applies pending migrations to the **remote** staging D1. | none | Irreversible forward-only schema change against shared staging data. |
| `db:migrate:production` | Applies pending migrations to the **remote** production D1. | none | Same as staging, but production — verify on staging first; see `deploy.md`. |
| `hash:password` | Prints a PBKDF2 password hash in the format `auth.ts` expects. | required: password string, e.g. `npm run hash:password -- "the-password"` | The password is passed as a CLI arg — visible in shell history/process listings on shared machines. |
| `create-admin` | Hashes a password and inserts an administrator row directly into a **remote** D1. | required: `--env <staging\|production> --email <e> --password <p>`; optional: `--name <display name>` | Writes a real credential straight to remote D1; same shell-history caveat as `hash:password`. |
| `setup` | One-shot local bootstrap: seeds `wrangler.jsonc`, generates + sets **staging** `SCRIPTORIA_API_KEY`/`SESSION_SECRET`, then applies local migrations. | none | **Rotates the real staging secrets every time it's run.** If Scriptoria is already configured with the previous `SCRIPTORIA_API_KEY`, rerunning this breaks their intake auth until the new key is reissued (`verify:endpoint`) and redistributed. Also force-logs-out every staging admin session. |
| `set-scriptoria-key` | Generates a new `SCRIPTORIA_API_KEY`, sets it as a Worker secret, and mirrors it into `.dev.vars`. | required: `--env <staging\|production>`; optional: `--dry-run`, `--url <worker-url>` (also writes `endpoint.json`) | **Immediately invalidates the previous key** — any external caller (Scriptoria) still using the old value starts getting 401s. The old secret cannot be retrieved again once replaced. With `--url`, overwrites `endpoint.json` in place. |
| `set-session-secret` | Generates a new `SESSION_SECRET` and sets it as a Worker secret, mirrored into `.dev.vars`. | required: `--env <staging\|production>`; optional: `--dry-run` | **Immediately invalidates every existing admin session cookie** for that environment — all signed-in admins are force-logged-out. Never printed to the terminal (nothing outside the Worker needs it). |
| `verify:secrets` | Confirms `SCRIPTORIA_API_KEY` and `SESSION_SECRET` are actually set for an environment. | required: `--env <staging\|production>` | Read-only — checks presence only, never reveals values (Cloudflare secrets can't be read back anyway). |
| `verify:endpoint` | Confirms `endpoint.json` exists, points at a production (not staging) URL, and its Authorization token matches the current `.dev.vars` `SCRIPTORIA_API_KEY` — fixes it in place if not. | optional: `--url <production-worker-url>` (prompted for interactively if needed and omitted) | Overwrites `endpoint.json` if anything is wrong with it. |
| `deploy:staging` | Deploys the built Worker to the staging environment. | none | Deploys to a real, shared staging Worker. |
| `deploy:production` | Deploys the built Worker to the production environment. | none | **Deploys to real production.** Confirm migrations are applied and secrets verified first. |
| `deploy:dry-run` | Builds and runs `wrangler deploy --dry-run --env staging` — verifies bindings without actually deploying. | none | Safe — no deploy happens. |
| `deploy:staging:full` | Chains `verify:secrets` → `db:migrate:staging` → `deploy:staging`. | none | Applies pending remote migrations and deploys in one step; fails fast (before migrating or deploying) if a required secret is missing. |
| `deploy:production:full` | Same chain as above, against production. | none | **Applies pending production migrations and deploys production in one step.** Same forward-only migration caveat applies. |
| `prepare` | Runs `svelte-kit sync` and `db:generate`; invoked automatically by `npm install` (npm lifecycle hook). | none | Not usually run directly. |
