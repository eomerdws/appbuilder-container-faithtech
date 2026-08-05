# AppBuilder Container — Agent Context

SvelteKit fullstack app: TypeScript frontend (Svelte 5, Tailwind CSS, DaisyUI) + backend (Prisma/SQLite via D1), deployed as Cloudflare Worker.

> This file is the shared tech-stack/commands/directory reference for all coding agents. Claude Code additionally reads `CLAUDE.md` (which imports this file) for safety rules, off-limits files, and repo-specific gotchas not covered here.

## Audience

This project is built to be forked — other teams adopt their own copy for their own package catalogs. The FaithTech/SIL core team chose this stack deliberately and knows it well, so don't over-explain it to them. But if you're an agent working in a fork rather than this original repo, don't assume that same familiarity: explain Svelte/SvelteKit/Prisma/D1 concepts in plain language and define jargon on first use, since a fork's maintainers may be new to this stack.

## Tech Stack

| Layer      | Tech         | Version |
| ---------- | ------------ | ------- |
| Runtime    | Node.js      | 22.23.1 |
| Framework  | SvelteKit    | 2.69.2  |
| UI         | Svelte       | 5.19.2  |
| Localization | Paraglide   | 2.23.1  |
| Styling    | Tailwind CSS | 4.0.6   |
| ORM        | Prisma       | 7.8.0   |
| Database   | D1 (SQLite)  | —       |
| Object storage | R2 (bucket binding `HERO_IMAGES`) | — |
| Testing    | Vitest       | 4.1.10  |
| Builder    | Vite         | 6.3.6   |
| Validation | Valibot      | 1.0.0   |
| Deployment | Wrangler     | 4.110.0 |

## Project Commands

```bash
# Local development
npm run dev                   # Start Vite dev server (port 5173)
npx wrangler dev              # Start Wrangler for dev testing for Cloudflare
npm run build                 # Build for production
npm run check                 # typecheck + lint + test + test:components (before commit)

# Database
npm run db:check              # format + validate + generate Prisma client
npm run db:generate           # Generate Prisma client to src/lib/server/generated/
npm run db:validate           # Validate schema.prisma
npm run db:format             # Format schema.prisma
npm run db:migration:initial  # Generate 0001_initial.sql from schema
npm run db:migrate:local      # Apply migrations locally
npm run db:seed:local         # Seed local database
npm run db:seed:dev           # Seed with dev data

# Deployment
npm run deploy:staging        # Deploy to staging
npm run deploy:production     # Deploy to production
npm run deploy:dry-run        # Test build + preview deployment

# Testing
npm run test                  # Run Vitest suite (test/, inside workerd)
npm run test:components       # Run Svelte component tests (src/routes/**/*.test.ts, jsdom)
npm run typecheck             # Check types (SvelteKit, Svelte, TypeScript)
npm run lint:check             # Run ESLint (also enforced in CI on PRs)
npm run lint:format            # Run ESLint with --fix

# Localization
npm run paraglide:compile      # Regenerate src/lib/paraglide/ from src/lib/project.inlang/ + src/lib/messages/*.json
                                # (also runs automatically via `prepare`, i.e. after `npm install` —
                                #  same convention as db:generate for Prisma)

# Setup & secrets
npm run setup                  # First-run: copy wrangler.jsonc, set secrets, migrate local DB
npm run create-admin           # Create an administrator row locally
npm run set-scriptoria-key     # Set SCRIPTORIA_API_KEY via wrangler secret
npm run set-session-secret     # Set SESSION_SECRET via wrangler secret
npm run verify:secrets         # Check required secrets are set for an env
npm run verify:endpoint        # Smoke-test a deployed endpoint

# Utilities
npm run hash:password         # Utility to hash admin passwords
```

## Directory Architecture

```
src/
├── app.css                   # Global styles (Tailwind, DaisyUI setup)
├── app.html                  # HTML shell (%lang%/%dir% placeholders filled by paraglideMiddleware)
├── app.d.ts                  # App ambient types
├── hooks.ts                  # Universal `reroute` hook: de-localizes /en/.../es/... before routing
├── hooks.server.ts           # Server-side hooks (request/response handlers, wraps paraglideMiddleware)
├── lib/
│   ├── components/           # Reusable Svelte components
│   │   ├── GlobeHero.svelte
│   │   └── PackageIcon.svelte
│   ├── format.ts             # Shared UI formatters (formatMegabytes, regionLabel)
│   ├── messages/              # Paraglide source translations (committed), one file per locale:
│   │   ├── en.json            # English — also the fallback/base locale
│   │   ├── es.json            # Spanish
│   │   ├── ar.json            # Arabic (RTL — see Localization notes below)
│   │   ├── de.json            # German
│   │   ├── tl.json            # Tagalog
│   │   ├── fr.json            # French
│   │   ├── id.json            # Indonesian
│   │   ├── ru.json            # Russian
│   │   └── zh.json            # Chinese — all files share the exact same keys as en.json
│   ├── paraglide/            # GENERATED Paraglide runtime + messages — never hand-edit,
│   │                         # regenerate with `npm run paraglide:compile` (gitignored)
│   ├── project.inlang/        # Paraglide project config; settings.json is the only committed
│   │   └── settings.json      # file here (9 locales, pathPattern → ./messages/{locale}.json)
│   ├── server/               # Request-scoped server utilities (++server.ts, actions, loaders)
│   │   ├── auth.ts           # Admin auth: PBKDF2 hashing, session tokens, Scriptoria secret verification
│   │   ├── db.ts             # Prisma client factory with D1 adapter
│   │   ├── packages.ts       # Package business logic
│   │   ├── platform.ts       # Platform/environment utilities
│   │   ├── notification.ts   # Scriptoria ingestion handler
│   │   └── settings.ts       # Admin-configurable site settings (GlobeHero background image, in R2)
│   └── validation.ts         # Valibot schemas
└── routes/
    ├── +layout.svelte        # Root layout (nav, footer)
    ├── +page.svelte          # Public package catalog
    ├── +page.server.ts       # Load packages for catalog
    ├── health/+server.ts     # Health check endpoint
    ├── hero-background/+server.ts # GET: streams the current GlobeHero background image from R2
    ├── login/
    │   ├── +page.svelte      # Admin login form
    │   └── +page.server.ts   # POST handler: authenticate → set session cookie
    ├── logout/+server.ts     # POST handler: clear session cookie
    ├── admin/
    │   ├── +layout.server.ts # Load: verify admin session
    │   ├── +page.svelte      # Admin dashboard (package review UI)
    │   ├── +page.server.ts   # Load packages + handle status changes
    │   └── settings/
    │       ├── +page.svelte      # Upload form + preview for the GlobeHero background image
    │       └── +page.server.ts   # Load current setting + handle the upload action
    ├── api/v1/
    │   └── […routes]         # REST API consumed by iOS container app
    └── packages/[id]/         # Single package detail page
    # Component tests for these .svelte files live in test/ (see below),
    # not colocated — SvelteKit reserves any +-prefixed filename under
    # src/routes/, even non-route ones, so `svelte-kit sync` rejects them here.

prisma/
├── schema.prisma             # Database schema (D1-compatible SQLite)
├── seed.sql                  # Base seed data
└── seed.dev.sql              # Dev-only seed data

migrations/
├── 0001_initial.sql          # Initial schema (generated, never hand-edit post-deploy)
└── 0002_site_settings.sql    # SiteSetting table (hand-written, never regenerate/overwrite 0001)

test/
# workerd suite (vitest.config.ts) — npm run test
├── auth.test.ts               # Admin authentication + session token tests
├── hooks.test.ts              # hooks.server.ts: request id, session cookie resolution
├── notification.test.ts       # Scriptoria payload validation + ingestion tests
├── packages.test.ts           # Public catalogue + moderation tests
├── scriptoria.test.ts         # Scriptoria intake auth + endpoint tests
├── settings.test.ts           # Hero background settings get/set + the /hero-background route
├── validation.test.ts         # src/lib/validation.ts schema tests
├── fixtures.ts                # Shared notification payload + seedAdministrator() helper
├── setup.ts                   # Per-file beforeEach: applies D1 migrations, clears tables
├── harness.ts                 # Minimal Worker entry for the test pool
├── env.d.ts                   # Test env types
├── tsconfig.json              # Test-specific TypeScript config
├── wrangler.test.jsonc        # Test Wrangler config (local D1)
#
# component suite (vitest.config.components.ts, jsdom) — npm run test:components
# Flat alongside the workerd tests above; both configs list these 5 filenames
# explicitly (include/exclude) since there's no naming convention separating them.
├── root.test.ts               # src/routes/+page.svelte (public catalogue)
├── layout.test.ts             # src/routes/+layout.svelte
├── admin.test.ts              # src/routes/admin/+page.svelte
├── login.test.ts              # src/routes/login/+page.svelte (incl. sveltekit-superforms)
├── packages_id.test.ts        # src/routes/packages/[id]/+page.svelte
├── dom-setup.ts               # jsdom suite setup: @testing-library/svelte afterEach(cleanup)
└── mocks/                     # $app/* stubs aliased in vitest.config.components.ts
    ├── app-paths.ts           # resolve() — identity + [param] substitution
    ├── app-state.ts           # mutable `page.url` component tests set directly
    ├── app-stores.ts          # legacy $app/stores (sveltekit-superforms imports these)
    ├── app-forms.ts           # no-op enhance()/applyAction()/deserialize()
    ├── app-environment.ts     # browser/dev/building/version
    └── app-navigation.ts      # no-op goto()/invalidateAll()/beforeNavigate()/afterNavigate()

docs/
├── README.md                 # Ticket-workflow overview
├── running.md                # Local setup, prerequisites, route list
├── deploy.md                 # Staging/production deployment
├── database.md                # DB/D1/Prisma notes
├── security_concerns.md       # Security notes
├── troubleshooting.md         # Stub
├── code-breakdown.md          # Beginner-friendly codebase map
├── assets/                    # Screenshots referenced by the guides above
├── todo/                      # Smaller follow-up/roadmap notes (e.g. secrets.md)
└── tickets/                   # 52 hackathon tickets (BE-*/FE-*/OPS-*) + NON-TECH.md (non-technical contributor guide)
```

## Code Style & Patterns

### TypeScript & Strictness

- **Strict mode enabled**: `strict: true` in tsconfig.json; `checkJs: true` for JS files
- **Type exports**: Use `type { Type }` for type-only exports (tree-shakeable)
- **Server-only code**: Colocate in `src/lib/server/` and SvelteKit `++server.ts` routes; never import from client code
- **Error handling**: Create custom Error subclasses (`AuthenticationError`, `AuthorizationError`); use try-finally for resource cleanup

### Async & Promises

- **Request-scoped clients**: Prisma client is created per-request via `createPrisma()`; almost all routes call it directly and disconnect in a manual `try/finally` (see `admin/+page.server.ts`). A `withPrisma()` wrapper also exists but is currently only used in `hooks.server.ts`
- **Timing-safe comparisons**: Use `crypto.subtle.timingSafeEqual()` for auth (prevents enumeration timing attacks)
- **No global singletons**: Each handler receives fresh bindings (D1 database, secrets)

### Functions & Modules

- **Self-documenting code**: JSDoc comments only on complex functions; clear function/variable names reduce need for comments
- **Single responsibility**: Split large utilities (e.g., `auth.ts` groups only PBKDF2, sessions, Scriptoria verification)
- **Export types with implementations**: `export async function X() {}` + `export type Y = ReturnType<typeof X>`

### Database & Validation

- **Prisma client generation**: Run `npm run db:check` after schema edits; Prisma client lives in `src/lib/server/generated/`
- **Valibot for input validation**: Schemas live in `src/lib/validation.ts`; use `parse()` in server handlers
- **D1 bindings**: Accessed via `env.DB` in `hooks.server.ts`; passed to `createPrisma()` factory

### Localization

- **All 9 locales shipped** (`FE-007` + `FE-008` translations): English, Spanish, Arabic, German, Tagalog, French, Indonesian, Russian, Chinese — via Paraglide JS v2, across the public catalog, package detail, login, and admin dashboard pages. `/api/v1/*` and `/health` are intentionally excluded (machine endpoints).
- **URL-based routing, always prefixed** — `/en/...`, `/es/...`, `/ar/...`, etc., no bare `/` (root redirects to the detected locale). No `[locale]` SvelteKit route segment: `src/hooks.ts`'s `reroute` hook de-localizes the URL before SvelteKit's router sees it, so the route tree stays flat.
- **RTL is baseline only, not a full visual audit**: Arabic gets `dir="rtl"` on `<html>` automatically (`getTextDirection()`, wired in `hooks.server.ts`), so browser-native bidi behavior (text alignment, form fields, flex/grid direction) works. Hand-coded directional details — the `←` back-arrow glyphs, icon positioning — still point the LTR way visually in RTL; a full visual RTL pass (flipping those, auditing `grid-template-columns` ordering) is still open, tracked as the remainder of `FE-008`.
- **Adding a new user-facing string**: add the key to **all nine** `src/lib/messages/{locale}.json` files (matching keys — `en.json` is the reference for the full key list), run `npm run paraglide:compile`, then call `m.your_key()` from `import * as m from '$lib/paraglide/messages'` — usable in both `.svelte` templates and server code (`+page.server.ts` loads/actions). Locale resolves automatically per-request via `AsyncLocalStorage` (set by `paraglideMiddleware` in `hooks.server.ts`) — don't pass an explicit `locale` unless overriding.
- **Pluralized messages** (e.g. `catalog_results_count`) use a `declarations`/`selectors`/`match` structure (see `src/lib/messages/en.json`), not inline ICU syntax — and the set of plural categories differs per locale (CLDR): `one`/`other` for en, es, de, tl, fr; `other` only for id, zh (no grammatical plural); `one`/`few`/`many`/`other` for ru; all six (`zero`/`one`/`two`/`few`/`many`/`other`) for ar. Missing a locale's applicable category silently falls back to the literal message key as the rendered text — always supply the full set for a given locale.
- **Language self-names** (`nav_language_english`, `nav_language_arabic`, etc., used by the switcher in `+layout.svelte`) must be identical across all nine message files — they're each language's native name for itself, not translated per viewing locale.
- **Links**: use `localizeHref(resolve(...))` (`resolve` from `$app/paths`, `localizeHref` from `$lib/paraglide/runtime`) so hrefs carry the current locale prefix. Plain `href={resolve(...)}` without the `localizeHref` wrap will lint-fail (`svelte/no-navigation-without-resolve` doesn't recognize the wrapped form — add an `eslint-disable`/`eslint-enable` pair around the element; for a multi-line tag, disable/enable must bracket the whole element, since `eslint-disable-next-line` only covers one physical line and prettier may reformat attributes onto their own lines).
- **Client-side pathname checks** (e.g. "is this route under `/admin`?") must go through `deLocalizeUrl(page.url).pathname`, not a raw `page.url.pathname` comparison — the real browser URL is locale-prefixed.

### UI & Components

- **Svelte 5 syntax**: Use `let count = $state(0)` for reactivity; `let component = $derived(computeValue())`
- **Tailwind + DaisyUI**: Classes in component `<style>` blocks or inline; DaisyUI provides unstyled semantic HTML templates
- **Forms**: `<form method="POST">` triggers SvelteKit actions. `login/` uses `sveltekit-superforms` + Valibot for client/server validation; other actions (e.g. admin moderation) validate directly with `v.parse()` against schemas in `validation.ts` — check the route before assuming superforms

### Deployment & Config

- **Wrangler environments**: local dev uses `wrangler.jsonc`'s top-level defaults; `staging` and `production` are explicit named envs in the same file, each with its own D1 binding. `wrangler.jsonc` itself is gitignored (fork-specific database IDs/worker names) — copy it from the committed `wrangler.jsonc.example` before running anything that touches Wrangler; without it, `dev`, `build` still run, but every deploy/db/secret command fails with a missing-configuration error
- **Secrets**: `SESSION_SECRET` and `SCRIPTORIA_API_KEY` are never in `wrangler.jsonc` — locally they come from `.dev.vars` (copy from `.dev.vars.example`), remotely via `wrangler secret put`
- **Build artifact**: `.svelte-kit/cloudflare/` is the Worker entry; Vite plugin copies Prisma WASM to output
- **Observability**: Source maps uploaded to Cloudflare; traces sampled at 5%, logs at 100%

## Common Tasks

### Add a new admin feature (page + form)

1. Add route: `src/routes/feature/+page.server.ts` (load), `+page.svelte` (UI)
2. Verify admin session in layout: `src/routes/admin/+layout.server.ts`
3. Query database: `const prisma = createPrisma(event.platform!.env.DB); try { ... } finally { await prisma.$disconnect().catch(() => {}); }`
4. POST handler in `+page.server.ts`: validate input with Valibot, mutate database, set flash message

### Update database schema

1. Edit `prisma/schema.prisma`
2. `npm run db:check` to validate and generate client
3. `npm run db:migration:initial` (initial only) or create new migration manually
4. `npm run db:migrate:local && npm run db:seed:local` to test locally
5. Commit migrations; never overwrite after deploy

### Deploy to staging

0. First time only: `cp wrangler.jsonc.example wrangler.jsonc` and fill in the placeholders (see `docs/deploy.md`)
1. `npm run check` (typecheck + test)
2. `npm run deploy:staging`
3. Verify at `https://appbuilder-container-staging.<your-subdomain>.workers.dev` — Cloudflare inserts your account's `workers.dev` subdomain, so there's no fixed URL to hardcode; `wrangler deploy` prints the actual URL on success (see `docs/deploy.md`)
4. If schema changed: `npm run db:migrate:staging` (apply migrations to remote D1)

## Key Decision Points

- **Database**: D1 (serverless SQLite); Prisma handles schema + migrations
- **Admin auth**: App-managed (email + password hash); no OAuth/SSO
- **Public access**: Unauthenticated (package catalog, API); admin login required for review
- **Scriptoria intake**: Authenticated via Bearer token in Authorization header, compared against the `SCRIPTORIA_API_KEY` Worker secret.
- **Package status**: Ingestion enforces `PENDING` status; admins approve to `ACTIVE` via dashboard
- **GlobeHero background image**: admin-uploaded via `/admin/settings`, stored in the `HERO_IMAGES` R2 bucket, key tracked in the `SiteSetting` row, served to the public catalogue through `/hero-background` (R2 objects aren't public by default, so the Worker proxies them)
