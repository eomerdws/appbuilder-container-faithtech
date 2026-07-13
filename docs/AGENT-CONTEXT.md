# Agent Context — read this before working in this repo

Handoff notes so any agent can pick up work in this repository without
re-deriving everything.

## Who you're working with

- Assume the people you work with may have **no Svelte/SvelteKit
  experience**, limited TypeScript and client-side/SSR experience, and no
  Cloudflare or Prisma background. Explain things in plain language, define
  jargon on first use, and prefer complete beginner-friendly answers over
  terse expert ones.
- This project is also intended to be worked on by **non-technical
  collaborators using AI assistants** (see NON-TECH.md). Expect prompts from
  people with zero coding knowledge; follow the safety phrasebook in that
  file (work on branches, open PRs instead of merging, warn before changing
  files, never touch secrets or deploy).

## What this repo is

A hackathon project ("Glocal Packages", FaithTech/SIL context): **one
SvelteKit app deployed as a single Cloudflare Worker** with a D1 (SQLite)
database via Prisma 7. It has three functional parts:

1. Public catalogue + search of language "asset packages" (`/` and
   `GET /api/v1/packages[/{id}]`), consumed inside an iOS container app.
2. Admin console (`/admin`) where administrators approve/reject packages.
3. Intake webhook (`POST /api/v1/notifications/scriptoria`) where the
   Scriptoria publishing service announces new packages (Bearer-token auth).

Data pipeline: Scriptoria notifies → package upserted as `PENDING` → admin
moderates → `ACTIVE` packages become publicly visible. All status changes are
recorded in an append-only `package_status_events` audit table.

## Companion documents (all in `docs/`)

- **SOURCE-CODE-BREAKDOWN.md** — full beginner-oriented codebase walkthrough:
  SvelteKit conventions (`+page.svelte` / `+page.server.ts` / `+server.ts` /
  hooks), directory tour, request-flow diagrams for the three main flows,
  per-file summaries, Cloudflare & Prisma integration, and local-run/deploy
  steps. Keep it updated if routes or lib files change materially.
- **NON-TECH.md** — role-based contribution guide for non-coders (tester,
  writer, language expert, policy, designer, coordinator), each with
  no-AI and AI-assisted plans, plus safety rules and prompt phrasebook.
- **AGENT-CONTEXT.md** — this file.

## Key technical facts already verified (don't re-derive)

- Entry: Cloudflare runs generated `.svelte-kit/cloudflare/_worker.js`
  (see `wrangler.jsonc "main"`); first hand-written code per request is
  `src/hooks.server.ts`, which resolves the `admin_session` cookie into
  `event.locals.administratorId`.
- Bindings arrive via `event.platform.env` (`DB` = D1; secrets
  `SESSION_SECRET`, `SCRIPTORIA_API_KEY` declared in `src/app.d.ts`, set via
  `.dev.vars` locally / `wrangler secret put` remotely).
- Prisma client is generated into `src/lib/server/generated/prisma/`
  (`runtime = "cloudflare"`); **never edit generated files**. Migrations are
  applied by *wrangler* (`npm run db:migrate:local|staging|production`), not
  `prisma migrate`.
- Atomic multi-statement writes (`ingestNotification` in
  `src/lib/server/notification.ts`, `moderatePackage` in
  `src/lib/server/packages.ts`) intentionally use raw `D1 batch()` because
  the Prisma D1 adapter doesn't guarantee transactions. Reads use Prisma.
- Status transitions are enforced in `packages.ts`: PENDING→ACTIVE|REJECTED,
  ACTIVE→INACTIVE, REJECTED→PENDING, INACTIVE→ACTIVE|PENDING; rejecting
  requires a reason.
- `vite.config.ts` contains two custom plugins solely to carry Prisma's
  query-compiler `.wasm` through dev and build — leave them alone.
- Auth (`src/lib/server/auth.ts`) is deliberate and security-sensitive:
  PBKDF2 password hashes, timing-safe comparisons, decoy hash against user
  enumeration, HMAC-signed stateless session cookies (8h TTL). Don't
  "simplify" it.
- **Known caveat:** on this branch you cannot log into `/admin` out of the
  box — `prisma/seed.sql` seeds an admin with an intentionally invalid
  password hash, and the self-serve `/setup` flow lives on the
  `package-catalogue-ui` branch. To test admin flows here, insert an
  administrator row with a real PBKDF2 hash into local D1 (hashPassword() in
  auth.ts produces the format), or use that other branch.

## Project management context

- `docs/` holds the full backlog: **52 tickets** (BE-001…019, FE-001…017,
  OPS-001…016) with YAML frontmatter (id, owner, priority, estimate,
  dependencies, status). Most are "Not Started". `docs/README.md` indexes
  them. When asked "what should be done next", start from the P0 tickets and
  their dependency chains rather than inventing scope.
- Local run: `npm install` → copy `.dev.vars.example` to `.dev.vars` →
  `npm run db:migrate:local` (+ optional `db:seed:local`) → `npm run dev`
  (http://localhost:5173). Checks: `npm run check`, `npm run deploy:dry-run`.
- A sibling copy of this repositorymay exist one
  directory up. Confirm which copy you are working in before making changes.

## How to behave here

- Prefer small, reviewable changes on a branch with a PR; never merge or
  deploy on your own; never write to production D1 or apply `seed.sql`
  remotely.
- Off-limits without an experienced human driving: secrets/`.dev.vars`,
  `wrangler.jsonc` env blocks, `prisma/` schema + `migrations/`,
  `src/lib/server/auth.ts`, `src/lib/server/generated/`.
- Safe territory for beginner/non-tech-driven changes: page copy, Svelte
  component markup/styles (Tailwind + DaisyUI), documentation, translations,
  test data.
- After changes, verify with `npm run check` and, when relevant, exercise the
  affected flow in `npm run dev` rather than assuming.
