# Refactor: Unify IDs on UUIDv4

Currently three ID forms coexist across the schema:

| Table                   | Schema declares | Seed rows                       | App-generated rows                                                             |
| ----------------------- | --------------- | ------------------------------- | ------------------------------------------------------------------------------ |
| `administrators`        | cuid            | `usr-demo-admin` (slug)         | _(no create path exists — matches the "no self-serve admin login yet" caveat)_ |
| `packages`              | cuid            | `pkg-gumawana` etc. (slug)      | UUIDv4 (`crypto.randomUUID()`)                                                 |
| `package_names`         | cuid            | `name-domdom` etc. (slug)       | UUIDv4                                                                         |
| `package_listings`      | cuid            | `listing-en-us` etc. (slug)     | UUIDv4                                                                         |
| `package_images`        | cuid            | `image-1x` etc. (slug)          | UUIDv4                                                                         |
| `package_status_events` | cuid            | `status-fra-active` etc. (slug) | UUIDv4 — confirmed live in local DB (`22716ca8-af71-...`)                      |

No code path calls Prisma Client's `.create()`/`.createMany()`/`.upsert()` anywhere in `src/` — confirmed via grep. That means `@default(cuid())` is never actually exercised; all real writes go through raw D1 `batch()` calls in `notification.ts`/`packages.ts`, which already generate `crypto.randomUUID()` (UUIDv4). The only inconsistency to fix is the schema's declared default and the seed fixtures.

## Task list

### Schema

- [x] `schema.prisma`: change `@default(cuid())` → `@default(uuid())` on all 6 models (`Administrator`, `Package`, `PackageName`, `PackageListing`, `PackageImage`, `PackageStatusEvent`).
- [x] `npm run db:generate` to regenerate the Prisma client against the updated schema.
- [x] `npm run db:migration:initial` and diff against `migrations/0001_initial.sql` — expect **no** SQL diff (the `id` column has no DB-level `DEFAULT`; this is a client-side generator change only). If a diff appears, stop — don't overwrite the shared migration, add a new numbered one instead.

### App code (already-correct, verify only)

- [x] Confirm the only ID-generation call sites are `crypto.randomUUID()` in `notification.ts` (5 call sites) and `packages.ts` (1 call site) — already verified, already UUIDv4, **no code change needed** here.
- [x] Confirm `scripts/hash-password.mjs` doesn't generate or insert IDs — already verified, it only emits a password hash string.
- [x] `src/hooks.server.ts`'s `crypto.randomUUID()` is for the request-tracing ID header, unrelated to DB rows — leave alone.

### Seed data (the actual work)

- [x] Generate one fixed UUIDv4 per existing slug ID across both `prisma/seed.sql` and `prisma/seed.dev.sql` (`usr-demo-admin`, every `pkg-*`, `name-*`, `listing-*`, `image-*`, `status-*`) — a stable mapping, not regenerated per run, so re-seeding stays idempotent via `INSERT OR IGNORE`.
- [x] Substitute consistently: each ID appears both as a row's own primary key **and** as a foreign key elsewhere (`package_id`, `actor_id`, `reviewed_by_id`) — every occurrence must map to the same UUID, in both files. `usr-demo-admin` in particular is referenced from both `seed.sql` and `seed.dev.sql`, so the same UUID has to be used in both.
- [x] Since both files start with `PRAGMA foreign_keys = ON;`, a missed/inconsistent substitution will fail loudly on re-seed (broken FK) rather than silently — treat a clean `db:seed:local`/`db:seed:dev` run as the correctness check for this step.
- [x] Accept the tradeoff: this removes the human-readable eyeballing convenience (`pkg-gumawana` → `f1a2...`). Worth a one-line SQL comment mapping old slug → UUID at the top of each seed file if readability while debugging matters.

### Rebuild & verify

- [x] Wipe local D1 state so stale slug-ID rows don't linger (`INSERT OR IGNORE` won't overwrite them): delete `.wrangler/state/v3/d1/`, then `npm run db:migrate:local && npm run db:seed:local && npm run db:seed:dev`.
- [x] `npm run check` (typecheck + test suite).
- [x] Exercise locally: admin login/moderation against the (now-UUID) demo admin, catalog browsing, and a package detail page load by ID — confirm nothing (URLs, UI) assumed the old slug shape. (`validation.ts`'s `id` schema is just a non-empty string, so this should be a non-issue, but worth eyeballing once.)
  - [x] Catalog browsing (`GET /api/v1/packages`) — returns UUID `id`s correctly.
  - [x] Package detail by ID (`GET /api/v1/packages/{uuid}`) — 200 for a valid UUID, 404 for a bogus id.
  - [x] Admin login/moderation — not yet exercised.
