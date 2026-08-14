# Admin-configurable site title

`/admin/settings` currently only lets an admin replace the GlobeHero
background image. The public catalog's browser-tab title and hero `<h1>` are
both hardcoded to the message keys `catalog_title_default` / `catalog_heading`
("Bible Apps" in `en.json`, translated per-locale in the other 8 locale
files). This note tracks turning that into a second admin-editable field on
the same settings page, alongside the hero image, so forks can rename their
own catalog without touching source.

Design: a nullable `siteTitle` column on the existing `SiteSetting` singleton
row, following the exact pattern already used for the hero image (nullable
column, single-statement raw D1 upsert, its own form + action). When unset,
the public site falls back to the existing localized `catalog_title_default()`
/ `catalog_heading()` messages, so untouched deployments keep today's
behavior and translations. When set, the custom title is a proper-noun/brand
string shown as-is in every locale (not translated), replacing both the tab
title and the H1. The settings page becomes two independent
sections/forms (title text, hero image) with their own named form actions,
rather than one combined form, so submitting one never risks clobbering the
other.

## Task list

### Stage 1: Schema + data layer

- [x] `prisma/schema.prisma`: add `siteTitle String? @map("site_title")` to
      the `SiteSetting` model.
- [x] New migration file `migrations/0003_site_title.sql` (do not touch
      `0001`/`0002`): `ALTER TABLE site_settings ADD COLUMN site_title TEXT;`
- [x] `npm run db:generate`, then `npm run db:migrate:local` to apply locally.
- [x] `src/lib/validation.ts`: add `siteTitleSchema` — trimmed string, max
      length (e.g. 200) via
      `v.pipe(v.string(), v.trim(), v.maxLength(200, () => m.validation_site_title_too_long()))`.
      Empty string is allowed through; the action treats it as "clear back to
      default" (store `null`).
- [x] `src/lib/server/settings.ts`: generalize the read into
      `getSiteSettings(prisma)` → `{ heroBackgroundImageKey, siteTitle }`
      (one query, replaces the narrower `getHeroBackgroundImage`; update its
      two callers). Add `setSiteTitle(db, prisma, { siteTitle, administratorId })`
      mirroring `setHeroBackgroundImage`'s raw D1
      `INSERT ... ON CONFLICT DO UPDATE SET` upsert, but only naming
      `site_title`, `updated_at`, `updated_by_id` — leaving
      `hero_background_image_key` untouched on conflict.

### Stage 2: Admin settings page

- [x] `src/routes/admin/settings/+page.server.ts`: `load` returns
      `{ heroBackgroundImageKey, siteTitle }` from `getSiteSettings`. Split
      `actions` into `updateTitle` (parse `siteTitle` with `siteTitleSchema`,
      call `setSiteTitle`, empty string → `null`) and `uploadHeroImage`
      (existing logic, renamed from `default`). Both keep the existing
      `if (!event.locals.administratorId) return fail(401)` guard.
- [x] `src/routes/admin/settings/+page.svelte`: add a "Site title" section
      above the hero-image section — a form posting to `?/updateTitle` with a
      text input pre-filled from `data.siteTitle ?? ''`, a hint that blank
      reverts to the default name, and its own submit button. Point the
      existing hero-image `<form method="post">` at
      `action="?/uploadHeroImage"`.

### Stage 3: Public catalog

- [x] `src/routes/+page.server.ts`: use `getSiteSettings`, return `siteTitle`
      alongside `heroBackgroundImageUrl`.
- [x] `src/routes/+page.svelte`:
      `<title>{data.q ? m.catalog_title_search({ query: data.q }) : (data.siteTitle || m.catalog_title_default())}</title>`
      and `<h1 id="catalog-title">{data.siteTitle || m.catalog_heading()}</h1>`.

### Stage 4: Messages (all 9 locale files under `src/lib/messages/`)

- [x] Add keys (English wording below; translate the rest):
      `admin_settings_title_section_heading` ("Site title"),
      `admin_settings_title_label` ("Display name"),
      `admin_settings_title_hint` ("Shown as the page title and homepage
      heading. Leave blank to use the default."),
      `admin_settings_title_button` ("Save title"),
      `admin_settings_title_success` ("Site title updated."),
      `validation_site_title_too_long` ("Title is too long.").
- [x] Broaden `admin_settings_description` — it currently only mentions the
      background image — to cover both sections.
- [x] `npm run paraglide:compile`.

### Stage 5: Tests

- [x] `test/settings.test.ts`: add cases for `getSiteSettings`/`setSiteTitle`
      (set then clear back to null) and an unauthenticated-`updateTitle`
      401 case. Update the existing hero-upload 401 test to call
      `settingsActions.uploadHeroImage` instead of `settingsActions.default`.
- [x] `test/root.test.ts`: add a case rendering `Page` with `data.siteTitle`
      set to a custom string, asserting the H1 shows that string instead of
      "Bible Apps"; existing tests (no `siteTitle` passed) keep asserting the
      "Bible Apps" fallback.

### Stage 6: Docs

- [x] Update `docs/code-breakdown.md` and `AGENTS.md`'s settings bullet
      ("GlobeHero background image: admin-uploaded...") to mention the site
      title is also configurable there.

## Verification

- `npm run check` (typecheck, lint, both test suites).
- `npm run dev`, log in as a seeded admin (see the "Known caveat" in
  `CLAUDE.md`), visit `/admin/settings`, set a custom title, confirm it shows
  on `/` (tab title + heading), clear it and confirm it reverts to the
  localized default, and re-verify the hero image upload still works
  independently.
