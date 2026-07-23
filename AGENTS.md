# Glocal Packages Container — Agent Context

SvelteKit fullstack app: TypeScript frontend (Svelte 5, Tailwind CSS, DaisyUI) + backend (Prisma/SQLite via D1), deployed as Cloudflare Worker.

> This file is the shared tech-stack/commands/directory reference for all coding agents. Claude Code additionally reads `CLAUDE.md` (which imports this file) for safety rules, off-limits files, and repo-specific gotchas not covered here.

## Audience

This project is built to be forked — other teams adopt their own copy for their own package catalogs. The FaithTech/SIL core team chose this stack deliberately and knows it well, so don't over-explain it to them. But if you're an agent working in a fork rather than this original repo, don't assume that same familiarity: explain Svelte/SvelteKit/Prisma/D1 concepts in plain language and define jargon on first use, since a fork's maintainers may be new to this stack.

## Tech Stack

| Layer      | Tech         | Version |
| ---------- | ------------ | ------- |
| Runtime    | Node.js      | 22.19.0 |
| Framework  | SvelteKit    | 2.69.2  |
| UI         | Svelte       | 5.19.2  |
| Styling    | Tailwind CSS | 4.0.6   |
| ORM        | Prisma       | 7.8.0   |
| Database   | D1 (SQLite)  | —       |
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
npm run check                 # typecheck + test (before commit)

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
npm run test                  # Run Vitest suite
npm run typecheck             # Check types (SvelteKit, Svelte, TypeScript)

# Utilities
npm run hash:password         # Utility to hash admin passwords
```

## Directory Architecture

```
src/
├── app.css                   # Global styles (Tailwind, DaisyUI setup)
├── app.html                  # HTML shell
├── app.d.ts                  # App ambient types
├── hooks.server.ts           # Server-side hooks (request/response handlers)
├── lib/
│   ├── components/           # Reusable Svelte components
│   │   ├── GlobeHero.svelte
│   │   └── PackageIcon.svelte
│   ├── server/               # Request-scoped server utilities (++server.ts, actions, loaders)
│   │   ├── auth.ts           # Admin auth: PBKDF2 hashing, session tokens, Scriptoria secret verification
│   │   ├── db.ts             # Prisma client factory with D1 adapter
│   │   ├── packages.ts       # Package business logic
│   │   ├── platform.ts       # Platform/environment utilities
│   │   └── notification.ts   # Scriptoria ingestion handler
│   └── validation.ts         # Valibot schemas
└── routes/
    ├── +layout.svelte        # Root layout (nav, footer)
    ├── +page.svelte          # Public package catalog
    ├── +page.server.ts       # Load packages for catalog
    ├── health/+server.ts     # Health check endpoint
    ├── login/
    │   ├── +page.svelte      # Admin login form
    │   └── +page.server.ts   # POST handler: authenticate → set session cookie
    ├── logout/+server.ts     # POST handler: clear session cookie
    ├── admin/
    │   ├── +layout.server.ts # Load: verify admin session
    │   ├── +page.svelte      # Admin dashboard (package review UI)
    │   └── +page.server.ts   # Load packages + handle status changes
    ├── api/v1/
    │   └── […routes]         # REST API consumed by iOS container app
    └── packages/[id]/         # Single package detail page

prisma/
├── schema.prisma             # Database schema (D1-compatible SQLite)
├── seed.sql                  # Base seed data
└── seed.dev.sql              # Dev-only seed data

migrations/
└── 0001_initial.sql          # Initial schema (generated, never hand-edit post-deploy)

test/
├── worker.test.ts            # Integration tests (Vitest + Cloudflare worker pool)
├── harness.ts                # Test utilities
├── env.d.ts                  # Test env types
├── tsconfig.json             # Test-specific TypeScript config
└── wrangler.test.jsonc       # Test Wrangler config (local D1)

docs/
├── RUNNING.md                # Local setup, prerequisites, route list
├── DEPLOY.md                 # Staging/production deployment
├── SOURCE-CODE-BREAKDOWN.md  # Beginner-friendly codebase map
├── NON-TECH.md               # Non-technical contributor guide
└── BE-*/FE-*/OPS-*           # Hackathon tickets (one file per ticket)
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

### UI & Components

- **Svelte 5 syntax**: Use `let count = $state(0)` for reactivity; `let component = $derived(computeValue())`
- **Tailwind + DaisyUI**: Classes in component `<style>` blocks or inline; DaisyUI provides unstyled semantic HTML templates
- **Forms**: `<form method="POST">` triggers SvelteKit actions. `login/` uses `sveltekit-superforms` + Valibot for client/server validation; other actions (e.g. admin moderation) validate directly with `v.parse()` against schemas in `validation.ts` — check the route before assuming superforms

### Deployment & Config

- **Wrangler environments**: local dev uses `wrangler.jsonc`'s top-level defaults; `staging` and `production` are explicit named envs in the same file, each with its own D1 binding
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

1. `npm run check` (typecheck + test)
2. `npm run deploy:staging`
3. Verify at `https://glocal-packages-api-staging.<your-subdomain>.workers.dev` — Cloudflare inserts your account's `workers.dev` subdomain, so there's no fixed URL to hardcode; `wrangler deploy` prints the actual URL on success (see `docs/DEPLOY.md`)
4. If schema changed: `npm run db:migrate:staging` (apply migrations to remote D1)

## Key Decision Points

- **Database**: D1 (serverless SQLite); Prisma handles schema + migrations
- **Admin auth**: App-managed (email + password hash); no OAuth/SSO
- **Public access**: Unauthenticated (package catalog, API); admin login required for review
- **Scriptoria intake**: Authenticated via Bearer token in Authorization header, compared against the `SCRIPTORIA_API_KEY` Worker secret. (`PUBLISH_NOTIFY` is a different thing — the name this server is registered under in Scriptoria's own outbound notify list, not a secret.)
- **Package status**: Ingestion enforces `PENDING` status; admins approve to `ACTIVE` via dashboard
