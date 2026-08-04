# Admin-configurable GlobeHero background image

`src/lib/components/GlobeHero.svelte` currently hardcodes its background image
to the static asset `/earth-cut.jpg`. This makes it admin-configurable:
administrators upload a replacement image from the admin console, it's stored
in a new Cloudflare R2 bucket, and the public catalog (`src/routes/+page.svelte`)
renders whichever image is currently set.

This touches `prisma/schema.prisma`/migrations and `wrangler.jsonc`, both
flagged in `CLAUDE.md` as off-limits without an experienced human driving —
proceed on a branch with a PR, and call out each such edit as it's made rather
than folding it in silently.

## Task list

- [x] **R2 bucket binding** — add a binding (e.g. `HERO_IMAGES`) to
      `wrangler.jsonc.example` for local/staging/production, regenerate
      `worker-configuration.d.ts` via `wrangler types`, and document bucket
      creation (`wrangler r2 bucket create`) for staging/production in
      `docs/deploy.md`.
- [x] **`SiteSetting` model + migration** — add a singleton-style model to
      `prisma/schema.prisma` (e.g. `SiteSetting` with
      `heroBackgroundImageKey`, `updatedAt`, `updatedById`) and hand-write a
      new numbered migration file — never touch `0001_initial.sql`.
- [x] **`src/lib/server/settings.ts`** — `getHeroBackgroundImage()` /
      `setHeroBackgroundImage()` against Prisma/D1, following the existing
      raw-D1-`batch()` pattern for the multi-statement write (R2 upload, then
      DB update, then cleanup of the orphaned previous R2 object).
- [x] **Upload validation** — valibot schema in `src/lib/validation.ts` for
      the uploaded file: allowed MIME types (jpg/png/webp) and a max file
      size.
- [x] **Admin settings UI** — new admin route (e.g.
      `src/routes/admin/settings/`) with a file upload form, a preview of the
      current image, and a POST action that validates the file, stores it in
      R2, and updates the `SiteSetting` row.
- [x] **Serving route** — a `+server.ts` (e.g. `/hero-background`) that reads
      the current key from settings and streams the object from the R2
      binding with sensible `Cache-Control`/`ETag` headers — R2 objects
      aren't public by default, so this proxies through the Worker.
- [x] **Wire up `GlobeHero.svelte`** — add an optional `backgroundImageUrl`
      prop (default `/earth-cut.jpg`), and have the public catalog's
      `src/routes/+page.server.ts` load the current setting and pass it
      through `+page.svelte` into `GlobeHero`.
- [x] **Tests** — workerd tests for settings get/set, upload validation, and
      the serving route; update `test/root.test.ts` and any admin component
      tests affected by the new UI/prop.
- [x] **Docs** — update `docs/code-breakdown.md` and `AGENTS.md`'s directory
      listing for the new routes/files/R2 binding; note the R2 setup step in
      `docs/deploy.md` and `docs/running.md`.
- [x] **Verify end-to-end** — `npm run check`, then manually exercise the
      upload flow with `npm run dev` / `wrangler dev` (upload an image as
      admin, confirm it renders on the public catalog's `GlobeHero`).
