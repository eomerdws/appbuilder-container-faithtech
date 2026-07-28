# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. `AGENTS.md` is the shared tech-stack/commands/directory reference used by every coding agent on this repo (Copilot, Cursor, etc.) — it's imported below so its content loads once, not duplicated here. Everything else in this file is Claude-Code-specific context, safety rules, and gotchas that don't belong in the cross-tool file.

@AGENTS.md

## What this repo is

"Glocal Packages" (FaithTech/SIL hackathon project): one **SvelteKit** app deployed as a single **Cloudflare Worker**, backed by **Cloudflare D1** (SQLite) via **Prisma 7**. Three functional parts:

1. Public catalog + search of language "asset packages" (`/` and `GET /api/v1/packages[/{id}]`), consumed by an iOS container app.
2. Admin console (`/admin`) where administrators approve/reject packages.
3. Scriptoria intake webhook (`POST /api/v1/notifications/scriptoria`), Bearer-token authenticated, where the external Scriptoria publishing service announces new packages.

Data pipeline: Scriptoria notifies → package upserted as `PENDING` → admin moderates → `ACTIVE` packages become publicly visible. All status changes are recorded in an append-only `PackageStatusEvent` audit table.

`scriptoria-poller/` is a separate, mostly-scaffolded SvelteKit project (see its own README's "Current Gaps" section) — not wired into the main app's build, tests, or deploy. Treat it as unrelated WIP unless the task specifically targets it.

## Commands not covered in AGENTS.md

```bash
cp .dev.vars.example .dev.vars       # set SESSION_SECRET, SCRIPTORIA_API_KEY — required for local dev
npx vitest run test/packages.test.ts # run a single workerd test file directly
npx vitest run --config vitest.config.components.ts test/admin.test.ts  # a single component test
```

- `npm run check` (typecheck + test) — run this before considering work done.
- `db:generate` regenerates `src/lib/server/generated/prisma` — never hand-edit it.
- `db:migration:initial` regenerates `migrations/0001_initial.sql` — existing shared migrations must not be overwritten; add new numbered ones instead.
- See `docs/DEPLOY.md` before running any `deploy:*` or `db:migrate:staging`/`db:migrate:production` command.

## Architecture

SvelteKit's file-system router: folders under `src/routes` are URLs; `+page.svelte` is UI, `+page.server.ts` holds `load()`/form `actions` (server-only), `+server.ts` is a raw JSON endpoint, `+layout.server.ts` guards a whole subtree. `src/hooks.server.ts` runs before every request.

**Request pipeline:** Cloudflare Worker (`.svelte-kit/cloudflare/_worker.js`, generated) → `src/hooks.server.ts` (assigns a request ID, resolves the `admin_session` cookie into `event.locals.administratorId`) → the matching route.

**Cloudflare bindings** arrive via `event.platform.env` (`DB` = D1 binding; secrets declared in `src/app.d.ts`). `src/lib/server/platform.ts`'s `requireEnv()` fetches these or throws a 503.

**Data layer** (`src/lib/server/`):
- `packages.ts` — catalog queries and the `moderatePackage` state machine: `PENDING→ACTIVE|REJECTED`, `ACTIVE→INACTIVE`, `REJECTED→PENDING`, `INACTIVE→ACTIVE|PENDING`. Rejecting requires a reason.
- `notification.ts` — Scriptoria payload schema (valibot) + `ingestNotification()`: extracts the product UUID from `permalink_url` as the idempotency key, upserts the package (new → `PENDING`; repeat → moderation status untouched), replaces its names/listings/images.
- `auth.ts` — security-sensitive: PBKDF2 password hashing, timing-safe comparisons, a decoy hash to prevent user-enumeration timing attacks, HMAC-signed stateless session cookies (8h TTL), Scriptoria Bearer-secret verification. Don't "simplify" this file.
- Both `ingestNotification` and `moderatePackage` use raw D1 `batch()` (not Prisma) for atomicity — **the Prisma D1 adapter does not guarantee transactions**, so any new multi-statement write needs the same pattern. All reads go through Prisma.

**Validation:** every external input (query strings, forms, Scriptoria JSON) is parsed through a `src/lib/validation.ts` schema before touching the database — no exceptions.

**Prisma/D1 specifics:**
- Migrations are applied by **wrangler**, not `prisma migrate` (`npm run db:migrate:local|staging|production`). Prisma only generates the SQL for a migration file.
- `vite.config.ts` defines one custom plugin (`prismaWasmAsset`) solely to carry Prisma's query-compiler `.wasm` into the build output — leave it (and the adjacent `rollupOptions.external` wasm exclusion) alone unless you're specifically debugging that pipeline.

**Testing — everything lives flat under `test/`, but two separate Vitest configs run different subsets (do not merge them):**
- `vitest.config.ts` (`npm run test`) — the server-side domain tests (`auth`, `hooks`, `notification`, `packages`, `scriptoria`, `validation`) run inside `workerd` via `@cloudflare/vitest-pool-workers`, applying real D1 migrations and calling server modules/route handlers directly rather than over HTTP. `test/setup.ts` (wired via `setupFiles`) applies migrations and clears tables before every test — each file gets its own isolated D1 instance. `test/fixtures.ts` holds the shared Scriptoria notification payload and `seedAdministrator()` helper.
- `vitest.config.components.ts` (`npm run test:components`) — Svelte component tests for `src/routes/**` (`@testing-library/svelte` + jsdom): `test/root.test.ts`, `layout.test.ts`, `admin.test.ts`, `login.test.ts`, `packages_id.test.ts`. These can't be colocated as `+page.test.ts` next to their components — SvelteKit's router reserves any `+`-prefixed filename under `src/routes/`, even non-route ones, so `svelte-kit sync` hard-fails on that. Since both configs' tests sit flat in the same `test/` directory with no naming convention distinguishing them, **each config lists these 5 filenames explicitly** (`vitest.config.ts`'s `test.exclude`, `vitest.config.components.ts`'s `test.include`) — adding a new component test means updating both. Uses the plain `svelte()` Vite plugin, not the full `sveltekit()` plugin, so `$app/paths`, `$app/state`, `$app/stores`, `$app/forms`, `$app/environment`, and `$app/navigation` are aliased to hand-written stubs in `test/mocks/` (real SvelteKit runtime modules aren't resolvable without the SvelteKit plugin). `resolve.conditions: ['browser']` is required in that config — without it, Vite resolves Svelte's server/SSR build under Node and components fail to mount. `svelte-check`/`tsc` still type-check these files against the *real* `$app/*` ambient types (aliasing is a Vite/Vitest-runtime concept, invisible to the type checker), so occasional `as typeof x` casts are needed where the mock's shape is looser than the real module's.
- `npm run check` runs both (`npm test && npm run test:components`), plus typecheck and lint.

**Known caveat:** on this branch there is no self-serve admin login — `prisma/seed.sql` seeds an admin with an intentionally invalid password hash, and the `/setup` first-run flow lives on the `package-catalogue-ui` branch. To exercise admin flows here, insert an administrator row with a real PBKDF2 hash (`hashPassword()` in `auth.ts`) into local D1.

## Project docs

`docs/` contains guides (`RUNNING.md`, `DEPLOY.md`, `SOURCE-CODE-BREAKDOWN.md`, `NON-TECH.md`) plus 52 hackathon tickets (`BE-001..019`, `FE-001..017`, `OPS-001..016`, indexed in `docs/README.md`) with YAML frontmatter (id, owner, priority, estimate, dependencies, status). When asked what to do next, start from P0 tickets and their dependency chains rather than inventing scope.

## Working conventions

- This project is also worked on by non-technical collaborators using AI assistants (see `docs/NON-TECH.md`) — prefer small, reviewable changes on a branch with a PR; never merge or deploy unilaterally; never write to production D1 or apply `seed.sql` remotely.
- Treat as off-limits without an experienced human driving: secrets/`.dev.vars`, `wrangler.jsonc` env blocks, `prisma/schema.prisma` + `migrations/`, `src/lib/server/auth.ts`, `src/lib/server/generated/`.
- After changes, verify with `npm run check` and, where relevant, exercise the affected flow with `npm run dev` rather than assuming it works.
- Keep `docs/SOURCE-CODE-BREAKDOWN.md` and `AGENTS.md` updated if routes, commands, or `src/lib` files change materially — `AGENTS.md` is read by non-Claude tools (Copilot, Cursor, etc.), so it can't be allowed to drift out of sync the way it did before.
