# Codebase Breakdown — Glocal Packages (SvelteKit on Cloudflare)

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
├── +layout.svelte                  Site shell: header with "Glocal Packages" logo + Admin link
├── +page.svelte / +page.server.ts  "/" — public catalogue page + its search query
├── login/
│   ├── +page.svelte                Login form UI
│   └── +page.server.ts             Handles the login POST: checks password, sets session cookie
├── logout/+server.ts               POST /logout — deletes the session cookie
├── admin/
│   ├── +layout.server.ts           Auth guard: not signed in? → redirect to /login
│   ├── +page.server.ts             Loads package queues + handles the "moderate" form action
│   └── +page.svelte                Admin dashboard UI (status tabs, approve/reject buttons)
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
└── server/                         SERVER-ONLY (SvelteKit blocks browser imports)
    ├── db.ts                       createPrisma() — builds a Prisma client wired to D1
    ├── auth.ts                     All security: password hashing, login, session
    │                               cookies, Scriptoria API-key check
    ├── packages.ts                 Package queries + the moderation state machine
    ├── notification.ts             Scriptoria payload schema + ingestNotification()
    ├── platform.ts                 requireEnv() — tiny helper that returns Cloudflare
    │                               bindings or throws a 503
    └── generated/prisma/           AUTO-GENERATED Prisma client (from schema.prisma).
                                    Never edit by hand; regenerate with `npm run db:generate`
```

### Everything else at the root

| Path | Purpose |
|---|---|
| `src/app.html` | The one HTML shell every page is injected into |
| `src/app.css` | Global styles (Tailwind CSS + DaisyUI component library) |
| `src/app.d.ts` | TypeScript declarations: what's in `event.locals` and `event.platform` (the Cloudflare bindings) |
| `src/hooks.server.ts` | The per-request middleware (see flow below) |
| `prisma/schema.prisma` | The database schema — source of truth for tables |
| `prisma/seed.sql` | Demo data for local development |
| `migrations/0001_initial.sql` | SQL that creates the tables (applied by wrangler, not Prisma) |
| `wrangler.jsonc` | Cloudflare Worker config: name, D1 binding, env vars, staging/production environments |
| `svelte.config.js` | Tells SvelteKit to build for Cloudflare (`adapter-cloudflare`) |
| `vite.config.ts` | Build config, incl. two custom plugins that shepherd Prisma's WebAssembly file through the build (see §7) |
| `test/` | Vitest tests that run inside `workerd` (the real Workers runtime) |
| `docs/` | Task-by-task design docs (BE-*/FE-*/OPS-*) and guides, including this file |
| `README.md` / `docs/RUNNING.md` | Data-model docs / how-to-run instructions |

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
src/hooks.server.ts  ("handle" middleware)
        │  1. assigns a request ID
        │  2. reads the admin_session cookie (if present)
        │  3. verifies its HMAC signature + checks the admin still exists
        │  4. puts the result in event.locals.administratorId (or null)
        ▼
The matching route under src/routes/
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
- **`wrangler.jsonc`** is the deployment manifest. It defines:
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

### Local run (with mock data)

```bash
# 0. Node 22 (the repo pins it via volta), then:
npm install                      # also generates the Prisma client

# 1. Local secrets
cp .dev.vars.example .dev.vars   # then edit:
#    SESSION_SECRET     = any long random string
#    SCRIPTORIA_API_KEY = any string (you'll use it to test the intake endpoint)

# 2. Create + seed the local database (a SQLite file inside .wrangler/)
npm run db:migrate:local         # creates the tables
npm run db:seed:local            # optional: demo packages to browse

# 3. Run
npm run dev                      # → http://localhost:5173
```

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

> **Admin login caveat (this branch):** the seed's admin password hash is an
> intentionally unusable placeholder, and there's no self-serve signup here —
> the `/setup` first-run flow lives on the `package-catalogue-ui` branch. To
> log in on this branch you must insert an administrator row with a real
> PBKDF2 hash into local D1 yourself (or use that other branch).

Useful checks: `npm run typecheck`, `npm test` (runs in the real Workers
runtime), `npm run check` (both), `npm run deploy:dry-run` (build + verify
bindings without deploying).

### Deploy to Cloudflare (staging)

```bash
# One-time setup
npx wrangler d1 create glocal-packages-staging
#   → copy the returned database_id into wrangler.jsonc under env.staging

npx wrangler secret put SESSION_SECRET --env staging
npx wrangler secret put SCRIPTORIA_API_KEY --env staging

# Every deploy
npm run db:migrate:staging       # apply migrations to the remote D1
npm run deploy:staging           # vite build + wrangler deploy
```

Production is identical with `production` in place of `staging`. Also set
`ALLOWED_ORIGIN` in `wrangler.jsonc` to the real web origin per environment,
and never apply `prisma/seed.sql` to production.

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
