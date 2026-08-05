# Codebase Breakdown — AppBuilder Container (SvelteKit on Cloudflare)

A beginner-friendly map of this repository. Written for someone with some
TypeScript experience but no prior Svelte/SvelteKit knowledge.

---

## 1. What this app is

A single **SvelteKit** app deployed as one **Cloudflare Worker** that does four jobs:

1. **Public catalogue** (`/`) — anyone can browse and search approved language app packages.
2. **Public JSON API** (`/api/v1/packages`) — the same catalogue as JSON, consumed by an iOS container app.
3. **Scriptoria intake** (`POST /api/v1/notifications/scriptoria`) — an external system called *Scriptoria* pushes "a new package was published" notifications here.
4. **Admin console** (`/admin`) — administrators sign in and approve/reject the packages that came in via Scriptoria.

The core life cycle of the data:

```
Scriptoria notifies → package saved as PENDING → admin reviews →
ACTIVE (visible to public) or REJECTED (hidden)
```

Storage is **Cloudflare D1** (a hosted SQLite database), accessed through **Prisma**.

---

## 2. SvelteKit in 60 seconds (the conventions you must know)

SvelteKit is a framework where **the file system IS the router**. You don't
register routes in code — you create files with magic names:

| File name | What it is |
|---|---|
| `+page.svelte` | The UI (HTML/CSS/JS component) for a page. Rendered on the server first (SSR), then "hydrated" in the browser. |
| `+page.server.ts` | Server-only code for that page: a `load()` function that fetches the page's data, and `actions` that handle form POSTs. Never shipped to the browser. |
| `+layout.svelte` | Shared wrapper UI (header/nav) around all pages beneath it. |
| `+layout.server.ts` | Server logic that runs for a whole section of the site (e.g. an auth guard for everything under `/admin`). |
| `+server.ts` | A pure API endpoint (no UI). You export functions named `GET`, `POST`, etc. that return JSON/Response objects. |
| `src/hooks.server.ts` | Middleware. Runs on **every single request** before any route code. |
| `$lib/...` | Import alias for `src/lib` — shared code. `$lib/server/...` is enforced server-only (build fails if browser code imports it). |

So: **folders under `src/routes` = URLs**, and the `+`-prefixed files inside
them define what happens at that URL.

---

## 3. Directory tour

### `src/routes/` — the pages and endpoints (one folder per URL)

```
src/routes/
├── +layout.svelte                  Site shell: header with a home icon (no text logo) + Admin link
├── +page.svelte / +page.server.ts  "/" — public catalogue page + its search query
├── login/
│   ├── +page.svelte                Login form UI
│   └── +page.server.ts             Handles the login POST: checks password, sets session cookie
├── logout/+server.ts               POST /logout — deletes the session cookie
├── admin/
│   ├── +layout.server.ts           Auth guard: not signed in? → redirect to /login
│   ├── +page.server.ts             Loads package queues + handles the "moderate" form action
│   ├── +page.svelte                Admin dashboard UI (status tabs, approve/reject buttons)
│   └── settings/
│       ├── +page.server.ts         Loads the current hero background key + handles the upload action
│       └── +page.svelte            Upload form + preview for the GlobeHero background image
├── hero-background/+server.ts      GET — streams the current hero background image from R2
├── api/v1/
│   ├── packages/+server.ts         GET /api/v1/packages — public search API (JSON)
│   ├── packages/[id]/+server.ts    GET /api/v1/packages/{id} — one package ([id] = URL parameter)
│   └── notifications/scriptoria/
│       └── +server.ts              POST — Scriptoria intake endpoint (Bearer-token protected)
└── health/+server.ts               GET /health — pings the database, returns {status:"ok"}
```

### `src/lib/` — shared code

```
src/lib/
├── validation.ts                   Input schemas usable on client OR server
│                                   (login credentials, moderation input, search params)
├── format.ts                       formatMegabytes()/regionLabel() — small shared UI formatters
├── messages/                       Paraglide source translations (committed): en/es/ar/de/tl/fr/id/ru/zh.json
├── paraglide/                      AUTO-GENERATED Paraglide runtime + messages (from project.inlang/
│                                   + messages/*.json, both siblings here). Never edit by hand;
│                                   regenerate with `npm run paraglide:compile`
├── project.inlang/                 Paraglide project config; settings.json is the only committed
│                                   file (locales en/es, pathPattern → ./messages/{locale}.json)
└── server/                         SERVER-ONLY (SvelteKit blocks browser imports)
    ├── db.ts                       createPrisma() — builds a Prisma client wired to D1
    ├── auth.ts                     All security: password hashing, login, session
    │                               cookies, Scriptoria API-key check
    ├── packages.ts                 Package queries + the moderation state machine
    ├── notification.ts             Scriptoria payload schema + ingestNotification()
    ├── settings.ts                 getHeroBackgroundImage()/setHeroBackgroundImage() — the
    │                               admin-configurable GlobeHero background image, stored in R2
    │                               (binding HERO_IMAGES) with its key tracked in SiteSetting
    ├── platform.ts                 requireEnv() — tiny helper that returns Cloudflare
    │                               bindings or throws a 503
    └── generated/prisma/           AUTO-GENERATED Prisma client (from schema.prisma).
                                    Never edit by hand; regenerate with `npm run db:generate`
```

### Localization (Paraglide)

Public catalog + admin/login pages are localized in all nine target locales —
English, Spanish, Arabic, German, Tagalog, French, Indonesian, Russian,
Chinese — via [Paraglide JS](https://paraglidejs.com) v2, using
always-prefixed URL routing (`/en/...`, `/es/...`, `/ar/...`, etc. — no bare
`/`). Source translations live in `src/lib/project.inlang/settings.json` +
one `src/lib/messages/{locale}.json` per locale (all committed);
`src/lib/paraglide/` is the compiled, gitignored output.

- `src/hooks.ts` — universal `reroute` hook: strips the locale prefix
  (`deLocalizeUrl()`) so SvelteKit's router matches the same flat route tree
  it always did — no `[locale]` route segment exists.
- `src/hooks.server.ts` — wraps `handle` in `paraglideMiddleware()`, which
  detects the locale, issues a redirect to the correct locale-prefixed URL
  when needed, and makes `getLocale()` available for the rest of the request
  (via `AsyncLocalStorage`, so `m.*()` message calls in `+page.server.ts`
  loads/actions pick up the right locale automatically).
- Components import generated message functions — `import * as m from
'$lib/paraglide/messages'` — and call `m.some_key()`; links use
  `localizeHref(resolve(...))` (from `$app/paths` + the Paraglide runtime) so
  hrefs carry the current locale prefix.
- `/api/v1/*` and `/health` are excluded from localization entirely (machine
  endpoints, never locale-prefixed).
- **Arabic RTL is baseline only**: `dir="rtl"` on `<html>` is set automatically
  (`getTextDirection()`), giving correct native browser bidi behavior, but
  hand-coded directional details (back-arrow glyphs, icon positioning) haven't
  had a full visual RTL pass yet — that's the remaining scope in `FE-008`.
- Pluralized messages (e.g. `catalog_results_count`) use a different set of
  CLDR plural categories per locale (`one`/`other` for most; `other` only for
  Chinese/Indonesian; `one`/`few`/`many`/`other` for Russian; all six for
  Arabic) — see the `declarations`/`selectors`/`match` structure in any
  `messages/*.json` file. A locale missing an applicable category falls back
  to the literal message key as visible text, so always cover the full set.

### Everything else at the root

| Path | Purpose |
|---|---|
| `src/app.html` | The one HTML shell every page is injected into |
| `src/app.css` | Global styles (Tailwind CSS + DaisyUI component library) |
| `src/app.d.ts` | TypeScript declarations: what's in `event.locals` and `event.platform` (the Cloudflare bindings) |
| `src/hooks.server.ts` | The per-request middleware (see flow below) |
| `src/hooks.ts` | Universal `reroute` hook: de-localizes `/en/...`/`/es/...` URLs before SvelteKit's router sees them |
| `prisma/schema.prisma` | The database schema — source of truth for tables |
| `prisma/seed.sql` | Demo data for local development |
| `migrations/0001_initial.sql` | SQL that creates the tables (applied by wrangler, not Prisma) |
| `wrangler.jsonc` | Cloudflare Worker config: name, D1 binding, env vars, staging/production environments |
| `svelte.config.js` | Tells SvelteKit to build for Cloudflare (`adapter-cloudflare`) |
| `eslint.config.js` | ESLint flat config: JS/TS/Svelte rules + Prettier integration |
| `.prettierrc` / `.prettierignore` | Prettier formatting rules and the paths it skips |
| `.github/workflows/lint.yml` | CI: runs ESLint (`npm run lint:check`) on PRs and pushes to `main` |
| `vite.config.ts` | Build config, incl. two custom plugins that shepherd Prisma's WebAssembly file through the build (see §7) |
| `test/` | Vitest tests that run inside `workerd` (the real Workers runtime) |
| `scripts/` | Node helper scripts backing the `npm run` commands below — see the table in §9 |
| `docs/` | Task-by-task design docs (`docs/tickets/BE-*`, `FE-*`, `OPS-*`), `docs/todo/` notes, and guides (`running.md`, `deploy.md`, `database.md`, `security_concerns.md`, `troubleshooting.md`, this file) |
| `README.md` / `docs/running.md` | Data-model docs / how-to-run instructions |

---

## 4. Entry points

There isn't one `main()` — it depends on which lens you look through:

- **In production:** Cloudflare runs `.svelte-kit/cloudflare/_worker.js`
  (declared in `wrangler.jsonc` → `"main"`). That file is *generated* by the
  build; it wraps the whole SvelteKit app as a Worker `fetch` handler.
- **Inside the app:** the first *your-code* that runs on every request is
  [`src/hooks.server.ts`](src/hooks.server.ts) — think of it as the front door.
- **For the browser:** `src/app.html` is the HTML shell, and
  `src/routes/+layout.svelte` is the outermost visible component.
- **In local dev:** `npm run dev` starts Vite, which emulates the Worker +
  D1 bindings on `http://localhost:5173`.

---

## 5. Request flow — what connects to what

Every request, regardless of route, goes through this pipeline:

```
Browser / iOS app / Scriptoria
        │
        ▼
Cloudflare Worker (generated _worker.js)
        │  static asset (JS/CSS/image)? → served directly from ASSETS
        ▼
src/hooks.ts  ("reroute" — de-localizes /en/... or /es/... to a plain path)
        ▼
src/hooks.server.ts  ("handle" middleware, wrapped in paraglideMiddleware)
        │  0. detects the locale; redirects to the correct /en/ or /es/ URL if needed
        │  1. assigns a request ID
        │  2. reads the admin_session cookie (if present)
        │  3. verifies its HMAC signature + checks the admin still exists
        │  4. puts the result in event.locals.administratorId (or null)
        ▼
The matching route under src/routes/ (still a flat tree — no [locale] segment)
```

### Flow A — public visitor browses the catalogue (`/`)

```
GET /?q=spanish
  → hooks.server.ts (no cookie, administratorId = null — fine, page is public)
  → routes/+page.server.ts  load()
      → validates ?q with searchSchema        (lib/validation.ts)
      → createPrisma(platform.env.DB)         (lib/server/db.ts)
      → searchActivePackages()                (lib/server/packages.ts)
          → Prisma query: status = ACTIVE, name/language matches q
  → routes/+page.svelte renders the results (SSR), browser hydrates it
```

The iOS container does the same thing through `GET /api/v1/packages`
(`routes/api/v1/packages/+server.ts`) — identical query, JSON instead of HTML.

### Flow B — Scriptoria pushes a new package

```
POST /api/v1/notifications/scriptoria   (Authorization: Bearer <SCRIPTORIA_API_KEY>)
  → routes/api/v1/notifications/scriptoria/+server.ts
      1. rejects bodies > 256 KB
      2. verifySecret()                       (lib/server/auth.ts)
         — constant-time comparison of the Bearer token against the secret
      3. validates the JSON payload           (lib/server/notification.ts,
         scriptoriaNotificationSchema — valibot)
      4. ingestNotification()                 (lib/server/notification.ts)
         — extracts the product UUID from permalink_url (the idempotency key)
         — UPSERTs the package (new → status PENDING; repeat → update in place,
           moderation status untouched)
         — replaces its names / listings / images
         — all in ONE D1 batch() so it's atomic
  → 201 (created) or 200 (updated)
```

### Flow C — administrator logs in and moderates

```
GET /admin
  → routes/admin/+layout.server.ts: administratorId null? → redirect /login

POST /login (email + password form)
  → routes/login/+page.server.ts
      → authenticateAdministrator()           (lib/server/auth.ts)
         — looks up the admin, verifies PBKDF2 password hash
         — runs a decoy hash when the email doesn't exist (timing-attack defense)
      → createSessionToken() — HMAC-signed "adminId.expiry.signature" token
      → sets it as an httpOnly cookie (8-hour lifetime), redirect → /admin

GET /admin  (now with a valid cookie)
  → hooks.server.ts fills event.locals.administratorId
  → routes/admin/+page.server.ts  load()
      → counts packages per status, lists the selected queue (default PENDING)

POST /admin?/moderate  (approve/reject form)
  → routes/admin/+page.server.ts  actions.moderate
      → moderatePackage()                     (lib/server/packages.ts)
         — checks the transition is legal:
             PENDING → ACTIVE | REJECTED
             ACTIVE  → INACTIVE
             REJECTED → PENDING
             INACTIVE → ACTIVE | PENDING
         — rejecting requires a reason
         — D1 batch(): update the package + append a PackageStatusEvent
           (append-only audit history), guarded so concurrent edits get a 409
```

---

## 6. The TypeScript files at a glance

| File | One-line job |
|---|---|
| `src/hooks.server.ts` | Per-request middleware: request ID + resolve the admin session cookie into `locals.administratorId` |
| `src/app.d.ts` | Type declarations for `locals` (requestId, administratorId) and `platform.env` (DB, secrets) |
| `lib/server/db.ts` | One factory: `createPrisma(D1) → PrismaClient` |
| `lib/server/auth.ts` | PBKDF2 password hashing, login check, HMAC-signed session cookies, Bearer-token verification — all timing-safe |
| `lib/server/packages.ts` | Catalogue queries (`searchActivePackages`, `getActivePackage`, `listPackagesByStatus`) + `moderatePackage` state machine |
| `lib/server/notification.ts` | Scriptoria payload schema + `ingestNotification` (idempotent upsert) |
| `lib/server/platform.ts` | `requireEnv(event)` — get Cloudflare bindings or throw 503 |
| `lib/validation.ts` | Valibot schemas shared by pages and API: credentials, moderation, search |
| Each `+page.server.ts` | `load()` = fetch data for that page; `actions` = handle its form posts |
| Each `+server.ts` | Raw HTTP handlers (`GET`/`POST`) for JSON endpoints |

A note on **valibot**: it's a small runtime validation library (like Zod).
Every piece of outside input — query strings, login forms, Scriptoria JSON —
is parsed through a schema before it touches the database.

---

## 7. Cloudflare integration

- **Adapter** — `svelte.config.js` uses `@sveltejs/adapter-cloudflare`, so
  `vite build` outputs a Worker script + static assets under
  `.svelte-kit/cloudflare/`.
- **`wrangler.jsonc`** is gitignored (fork-specific database IDs and worker
  names) — copy it from the committed `wrangler.jsonc.example` before running
  anything Wrangler-related; without it, deploys/migrations/secret scripts
  all fail with a missing-configuration error. It's the deployment manifest,
  and defines:
  - the Worker name and entry file,
  - the **D1 database binding named `DB`**,
  - plain env vars (`ENVIRONMENT`, `ALLOWED_ORIGIN`),
  - three environments: top-level = **local**, plus `staging` and `production`
    overrides (each with its own D1 database).
- **Bindings reach your code via `event.platform.env`** — e.g.
  `event.platform.env.DB` is the live D1 client, `env.SESSION_SECRET` and
  `env.SCRIPTORIA_API_KEY` are secrets. Types for these live in `app.d.ts`.
- **Secrets** are *not* in wrangler.jsonc: locally they come from a
  `.dev.vars` file (gitignored); deployed, you set them with
  `npx wrangler secret put <NAME> --env staging`.
- **Observability** is on: logs at 100% sampling, traces at 5%, and source
  maps are uploaded so production stack traces point at your `.ts` files.
- **The wasm wrinkle** (`vite.config.ts`): Prisma 7's engine is a WebAssembly
  file. Two small custom Vite plugins make it work — one copies the `.wasm`
  next to the built server code so wrangler can bundle it, the other makes the
  `?module` wasm import work in Node during `npm run dev`. You shouldn't need
  to touch these.

## 8. Prisma integration

- **Schema**: `prisma/schema.prisma` — six models:
  `Administrator`, `Package`, `PackageName` (searchable names),
  `PackageListing` (localized store text), `PackageImage`,
  `PackageStatusEvent` (append-only moderation history).
- **Generated client**: `npm run db:generate` writes a typed client into
  `src/lib/server/generated/prisma/` (configured with `runtime = "cloudflare"`).
  It's committed/regenerated, never hand-edited. `npm install` regenerates it
  automatically (the `prepare` script).
- **D1 adapter**: `lib/server/db.ts` plugs the client into D1 via
  `@prisma/adapter-d1`. A fresh client is created per request and
  `$disconnect()`ed in a `finally` — Workers are stateless, so no connection pool.
- **Migrations are wrangler's job, not Prisma's.** Prisma only *generates* the
  SQL (`npm run db:migration:initial` → `migrations/*.sql`); applying it is
  `wrangler d1 migrations apply` (wrapped as `npm run db:migrate:local` etc.).
- **When Prisma isn't enough**: writes that must be atomic (`ingestNotification`,
  `moderatePackage`) use raw `db.batch([...])` SQL, because the D1 adapter
  doesn't guarantee transactions. Reads all go through Prisma.

---

## 9. Getting started

The full instructions live in [`docs/running.md`](./running.md) (local) and
[`docs/deploy.md`](./deploy.md) (staging/production) — this section is a
condensed map of the same flow, including the `scripts/` helpers that back it.

### `scripts/` — what each helper does

Most Wrangler-dependent `npm run` commands are thin wrappers around a script
in `scripts/` rather than a raw `wrangler`/`prisma` call:

| Script | Backs | Purpose |
|---|---|---|
| `ensure-wrangler-config.mjs` | called internally by most commands below | If `wrangler.jsonc` is missing: auto-copies it from `wrangler.jsonc.example` when run with `--seed` (used by the first command in a flow), otherwise prints a clear error instead of Wrangler's generic one |
| `copy-wrangler-jsonc.mjs` | `npm run setup` | Unconditionally seeds `wrangler.jsonc` from the example |
| `hash-password.mjs` | `npm run hash:password -- "<password>"` | Prints a PBKDF2 hash in the format `auth.ts` expects, for manually inserting an administrator row |
| `create-admin.mjs` | `npm run create-admin -- --env <env> --email <e> --password <p>` | One-time-per-environment: hashes the password and inserts the administrator row directly into the **remote** D1 for you (no manual `wrangler d1 execute`) |
| `set-session-secret.mjs` | `npm run set-session-secret -- --env <env>` | Generates `SESSION_SECRET` and sets it via `wrangler secret put` |
| `set-scriptoria-key.mjs` | `npm run set-scriptoria-key -- --env <env> [--url <worker-url>]` | Generates `SCRIPTORIA_API_KEY`, sets it via `wrangler secret put`, mirrors it into `.dev.vars`, and (with `--url`) writes a gitignored `endpoint.json` to hand to the Scriptoria build-engine operator |
| `verify-secrets.mjs` | `npm run verify:secrets -- --env <env>` | Confirms both secrets are actually set for an environment before a deploy |
| `clean-build-output.mjs` | `npm run typecheck` | Clears stale build output before `svelte-kit sync` |

### Local run

```bash
# 0. Node 22 (the repo pins it via volta), then:
npm install                      # also generates the Prisma client
npx wrangler login                # without this, the setup step below may fail

# 1. Automated setup: seeds wrangler.jsonc, sets both secrets, applies migrations
npm run setup

# Optional demo data:
npm run db:seed:local             # package catalogue data (run this first)
npm run db:seed:dev               # seeds a dev administrator (prints its login) — DO NOT run against a real deploy

# 2. Run
npm run build
npx wrangler dev                  # Wrangler dev server, emulating Workers + D1
```

`npm run setup` runs `copy-wrangler-jsonc.mjs` (seeds `wrangler.jsonc`),
`set-scriptoria-key`/`set-session-secret` (`--env staging` — these also mirror
values into `.dev.vars` for local use), then `db:migrate:local`. See the
**Manual Method** in `running.md` if you'd rather copy `wrangler.jsonc.example`
and `.dev.vars.example` yourself and run each step individually.

What to try once it's running:

| URL | What you'll see |
|---|---|
| `/` | Catalogue + search (seeded packages, if you ran the seed) |
| `/api/v1/packages` | Same data as JSON |
| `/health` | `{"status":"ok","database":"reachable"}` |
| `/admin` | Redirects to `/login` |

Simulate a Scriptoria notification:

```bash
curl -X POST http://localhost:5173/api/v1/notifications/scriptoria \
  -H "Authorization: Bearer <your SCRIPTORIA_API_KEY>" \
  -H "Content-Type: application/json" \
  -d @notification.json
```

> **Admin login caveat (this branch):** there's no self-serve admin signup —
> the `/setup` first-run flow lives on the `package-catalogue-ui` branch. Use
> `npm run db:seed:dev` for a local dev admin, or insert an administrator row
> with a real PBKDF2 hash (`npm run hash:password`) into local D1 yourself.

Useful checks: `npm run typecheck`, `npm test` (runs in the real Workers
runtime), `npm run check` (typecheck + lint + both test suites), `npm run
deploy:dry-run` (build + verify bindings without deploying).

### Deploy to Cloudflare (staging)

```bash
# One-time setup
cp wrangler.jsonc.example wrangler.jsonc

# Creates the D1 database and writes its id straight into env.staging for you
npx wrangler d1 create appbuilder-container-staging --env staging --binding DB --update-config

npm run set-session-secret -- --env staging
npm run set-scriptoria-key -- --env staging --url https://appbuilder-container-staging.<your-subdomain>.workers.dev

# Every deploy
npm run db:migrate:staging       # apply migrations to the remote D1
npm run deploy:staging           # wrangler deploy (builds internally)

# Or, once secrets are already set:
npm run deploy:staging:full      # verify:secrets → db:migrate:staging → deploy:staging
```

`--update-config` on `wrangler d1 create` writes the database id to
`env.staging.d1_databases[0]` directly — no manual copy-paste into
`wrangler.jsonc` needed, as long as `--env staging` is passed (omit it and
Wrangler writes to the top-level `d1_databases` instead, which this Worker's
per-environment bindings don't read). `set-scriptoria-key`'s `--url` prints an
`endpoint.json` you hand to the Scriptoria build-engine operator; see "Wire up
the Scriptoria notification" in `deploy.md` for the self-test curl that
distinguishes a credentials mismatch from every other kind of failure.

To create an administrator on a deployed environment (no self-serve signup):

```bash
npm run create-admin -- --env staging --email you@example.org --password "..."
```

Production is identical with `production` in place of `staging` — its own D1
database, secrets, and (once wired in) `ALLOWED_ORIGIN`. `ALLOWED_ORIGIN` is
currently a no-op (reserved for CORS on the public API, not read by any code
yet); set it anyway so it's correct once CORS lands. Never apply
`prisma/seed.sql` (or any dev seed) to a real database — its hashes are
placeholders. Rollbacks go through the Cloudflare dashboard (Workers → the
Worker → Deployments) or by redeploying a known-good commit; migrations are
forward-only.

---

## 10. Mental model cheat sheet

- **URL → folder** under `src/routes`; the `+` files say what happens there.
- **`.svelte` = UI, `.server.ts` = server logic.** Browsers never see server files.
- **`hooks.server.ts` runs first** on every request and answers one question:
  *is this an admin?*
- **All data lives in D1**, reached via Prisma (`createPrisma(env.DB)`),
  except atomic writes which use raw D1 `batch()`.
- **Three doors in:** the public web/API (read-only, ACTIVE packages only),
  the Scriptoria webhook (Bearer secret, writes PENDING packages), and the
  admin console (cookie session, changes package status).
