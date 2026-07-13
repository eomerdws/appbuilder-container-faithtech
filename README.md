# Glocal Packages container app

This repository contains the Glocal container application: a single SvelteKit
app deployed as one Cloudflare Worker, backed by Cloudflare D1 (so the Prisma
datasource is SQLite-compatible). It serves the public package catalogue, the
public JSON API consumed by the iOS container app, the Scriptoria intake
endpoint, and the admin console for reviewing packages, alongside the Prisma
schema, migrations, and representative seed data.

## Documentation

All project documentation lives in [`docs/`](./docs).

### Guides

- [`docs/RUNNING.md`](./docs/RUNNING.md) — local development: prerequisites, secrets, database setup, and the route list.
- [`docs/DEPLOY.md`](./docs/DEPLOY.md) — deploying the Worker to Cloudflare staging and production.
- [`docs/SOURCE-CODE-BREAKDOWN.md`](./docs/SOURCE-CODE-BREAKDOWN.md) — beginner-friendly map of the codebase for readers new to SvelteKit.
- [`docs/NON-TECH.md`](./docs/NON-TECH.md) — how non-technical collaborators can contribute, including working through AI assistants.
- [`docs/AGENT-CONTEXT.md`](./docs/AGENT-CONTEXT.md) — handoff notes for AI assistants working in this repository.

Hackathon tickets (indexed in [`docs/README.md`](./docs/README.md), one file per ticket with story, acceptance criteria, and dependencies):

- `docs/BE-001` … `BE-019` — backend tickets (schema, ingestion, sessions, roles, tests).
- `docs/FE-001` … `FE-017` — frontend tickets (app shell, search, localization, admin UI).
- `docs/OPS-001` … `OPS-016` — DevOps/deployment tickets (environments, CI, secrets, monitoring).

## Current decisions

- Cloudflare D1 is the hackathon database.
- The future Worker binding will be named `DB`.
- The staging database will be named `glocal-packages-staging`.
- Public package consumers do not sign in. Only administrators have application
  accounts, using app-managed credentials.
- Every administrator requires a password hash. The development seed contains
  an intentionally unusable placeholder until the bootstrap flow is built.
- The Scriptoria product UUID is the external idempotency key.
- Every newly received package begins in `PENDING` status. The notification
  payload is never allowed to choose its own moderation status.
- The public catalogue returns only `ACTIVE` packages.
- API credentials remain Worker secrets for the MVP and are not stored in this
  schema yet.

## Data model

```mermaid
erDiagram
    ADMINISTRATORS ||--o{ PACKAGES : reviews
    ADMINISTRATORS ||--o{ PACKAGE_STATUS_EVENTS : performs
    PACKAGES ||--o{ PACKAGE_NAMES : has
    PACKAGES ||--o{ PACKAGE_LISTINGS : has
    PACKAGES ||--o{ PACKAGE_IMAGES : has
    PACKAGES ||--o{ PACKAGE_STATUS_EVENTS : records
```

The minimum models are:

- `Package`: one logical Scriptoria product and its current moderation status.
- `PackageName`: searchable primary and alternative language names.
- `PackageListing`: localized public title and descriptions.
- `PackageImage`: resolved image URLs for each scale.
- `Administrator`: app-native account for package review and management.
- `PackageStatusEvent`: append-only moderation history.

The full notification can optionally be retained as `rawNotificationJson`, but
the application must use the normalized columns and relations for business
logic. Listing descriptions are untrusted HTML and must be sanitized before
rendering.

## Install and validate

```bash
npm install
npm run db:check
```

Useful individual commands:

```bash
npm run db:format
npm run db:validate
npm run db:generate
```

The generated Prisma client is ignored by Git and will be created at
`src/lib/server/generated/prisma`. The future Cloudflare MVP can import it from
server-only code and construct it with `@prisma/adapter-d1` and `env.DB`.

## Initial migration

`migrations/0001_initial.sql` is generated from `prisma/schema.prisma` using:

```bash
npm run db:migration:initial
```

Do not overwrite a migration after it has been applied to a shared database.
For later changes, create a new numbered migration and compare the current local
D1 schema to the updated Prisma schema.

When the Cloudflare MVP adds Wrangler configuration, apply the committed
migrations locally first:

```bash
npx wrangler d1 migrations apply glocal-packages-staging --local
npx wrangler d1 execute glocal-packages-staging --local --file prisma/seed.sql
```

After local integration succeeds and the SQL has been reviewed, apply it to the
remote staging database:

```bash
npx wrangler d1 migrations apply glocal-packages-staging --remote
```

The seed is representative development data only. Do not apply it to production.

## REST notification mapping

| Notification field | Database destination |
|---|---|
| Product UUID from `permalink_url` | `Package.scriptoriaProductId` |
| Project, publish, and permalink fields | `Package` |
| Cleaned `size` | `Package.sizeBytes` |
| `app_lang` | `Package` and `PackageName` |
| `listing[]` | `PackageListing` |
| `image.files[]` | `PackageImage` |
| Request receipt | `Package.lastNotificationAt` |

The ingestion handler must validate and normalize the notification before
writing it. In particular, the supplied example's `"11351769}"` size becomes the
integer `11351769`.

## Intentionally deferred

The following are not required to close the first notification-to-download
workflow and should be added through later migrations only when their behavior
is confirmed:

- Managed API-credential lifecycle
- Interface and branding settings
- Email delivery history
- R2 object metadata
- Multiple package-publication versions
- General administrative audit events beyond package status changes

One product decision remains open: whether a republished `ACTIVE` package stays
active or returns to `PENDING`. The schema supports either policy; the ingestion
service must not silently choose it without SIL confirmation.
