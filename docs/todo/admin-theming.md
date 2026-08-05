# Admin-configurable theming

`/admin/settings` currently has two sections (site title, GlobeHero
background image — see `admin-add-title.md` and `Hero-Admin.md`). This note
tracks adding a third: **Theming**, a subsection where an admin can change
the site's colors without touching source — button color, row/background
color, text color, and icon color — so forks can reskin their deployment
from the admin console.

Design: follow the exact pattern already established for the hero image and
site title — a nullable set of columns on the `SiteSetting` singleton row (or
a small dedicated `id`/`key`/`value` `ThemeSetting` table if a flat set of
columns feels too rigid once real values are picked; default to the flat
`SiteSetting` columns unless that turns out to be awkward), a Valibot schema,
a raw D1 upsert, and its own named form action so submitting the theme form
never risks clobbering the title or hero-image forms.

The app already ships Tailwind + DaisyUI, and DaisyUI themes work by setting
CSS custom properties (`--color-primary`, `--color-base-100`, etc.) on a
`data-theme` root. Prefer overriding those same variables at runtime (e.g. a
small inline `<style>` block emitted in `src/app.html` or the root layout,
populated from the stored settings) over hand-rolling parallel color logic in
components — that keeps every existing DaisyUI-styled element (buttons, table
rows, cards) themeable for free instead of requiring a per-component rewrite.
Confirm which DaisyUI variable names actually correspond to "button color",
"row color", "background color", "text color", and "icon color" in the
current DaisyUI version before wiring the form fields — the mapping (e.g. row
color → `--color-base-200`, icon color → may just be `currentColor` following
text color rather than a separate variable) needs to be verified against
`src/app.css`/DaisyUI's config, not assumed.

## Task list

### Stage 0: Research / confirm approach

- [x] Inspect `src/app.css` and the DaisyUI version in use to enumerate the
      actual CSS custom properties driving button, row/background, text, and
      icon colors, and confirm overriding them at runtime (vs. per-component
      `style`/class props) is sufficient — note any element that doesn't
      inherit from a DaisyUI variable and would need special-casing.
- [x] Decide flat `SiteSetting` columns vs. a small separate theme table
      based on that mapping (e.g. if more than ~5 color fields are needed,
      lean toward a table so future colors don't mean repeated migrations).

#### Stage 0 Research: findings

**DaisyUI is present but not actually driving any visuals — the runtime
CSS-variable-override plan in this doc's intro is wrong and needs revising
before Stage 3.** DaisyUI 5 (`^5.0.0`) is loaded as a Tailwind plugin
(`@plugin "daisyui";` in `src/app.css`) and `data-theme="dark"` is set on
`<html>` in `src/app.html`, but a repo-wide search found **no use of DaisyUI
component classes** (`btn`, `card`, `table`, `badge`, `alert`, etc.) and
**no use of DaisyUI's own theme variables** (`--color-primary`,
`--color-base-100`, etc.) anywhere in `src/routes` or `src/lib/components`.
Every page instead uses hand-rolled, component-scoped `<style>` blocks with
mostly literal hex colors. Overriding DaisyUI's variables at runtime — as
originally proposed — would have zero visible effect, since nothing reads
them.

What actually exists today, per requested color:

- **Text color** — the only one that's already centralized: `body { color:
  var(--ink) }` in `src/app.css` (`--ink: #f7f8fb`), plus a `--muted:
  #9ca6b6` for secondary text. However, several components bypass both and
  hardcode their own literal grays instead of using either variable (e.g.
  `admin/+page.svelte`'s `.content-heading span { color: #9aa4b3 }`,
  `.table-header { color: #7f8998 }`, `.queue-summary span, p { color:
  #8e98a7 }`).
- **Background color** — *not* variable-driven at the page level:
  `html`/`body` hardcode `background: #07090c` directly in `src/app.css`.
  `--panel: #171c23` / `--panel-strong: #0b0e12` exist as variables but
  aren't wired to `html`/`body` — they'd need to be if background is to be
  admin-configurable.
- **Button color** — no single variable; each button state hardcodes its
  own colors per component. E.g. `admin/+page.svelte`'s default
  `.action-cell button` uses `background: #242b34; color: #e5e8ec;
  border-color: #3b4552`, its approve variant switches to `color:
  var(--green)` on a tinted green background, and its `.danger` variant uses
  `var(--orange)` on a tinted orange background — three different color
  sources for what the todo calls one "button color".
- **Row color** — `.review-row`/`.table-header` (admin dashboard) don't set
  an explicit background at all (they inherit the page background); only
  hardcoded hex borders (`#2e3540`, `#242b34`) separate rows. There's no
  existing "row color" concept to hook into — one would have to be
  introduced.
- **Icon color** — inconsistent by component: nav icons in
  `src/routes/+layout.svelte` (`.icon-button svg`, `.language-menu summary >
  svg`) correctly use `stroke: currentColor` / `fill: none`, so they already
  follow text color. But `src/lib/components/PackageIcon.svelte` hardcodes
  `fill: #fff9ee; stroke: #c97728` independent of any variable or of text
  color, and its circular background swatch is chosen pseudo-randomly per
  package from a fixed 5-hex array (`#ffbc73`, `#67d0f7`, `#a98af8`,
  `#ff6e79`, `#cbeeff`) unrelated to any theme setting — that swatch logic is
  probably out of scope for "icon color" and should stay as-is.

**Implication for later stages:** this feature can't be built as a thin
runtime override of existing variables, because the existing variables don't
cover buttons, rows, or backgrounds, and even where a variable exists
(`--ink`) components inconsistently bypass it. Stage 3 needs an added
refactor sub-step: introduce a small set of *new*, first-class custom
properties (suggested names: `--theme-button`, `--theme-row`,
`--theme-background`, `--theme-text`, `--theme-icon`) declared in `:root` in
`src/app.css`, then update the hardcoded literals identified above (in
`admin/+page.svelte`, `+page.svelte`, `packages/[id]/+page.svelte`,
`+layout.svelte`, `PackageIcon.svelte`) to reference them instead of literal
hex — *before* Stage 3's inline `<style>` override can have any effect. This
is materially more work than "override DaisyUI's variables" and touches more
files than Stages 1–2 alone suggest; call this out explicitly when picking
the todo back up.

**Schema decision:** flat nullable columns on `SiteSetting` (5 fields:
button, row, background, text, icon) — consistent with the existing
`heroBackgroundImageKey`/`siteTitle` pattern and under the "~5 columns"
threshold mentioned in this doc's design section, so a separate theme table
isn't warranted.

### Stage 1: Schema + data layer

- [x] `prisma/schema.prisma`: add nullable color columns to `SiteSetting`
      (e.g. `themeButtonColor`, `themeRowColor`, `themeBackgroundColor`,
      `themeTextColor`, `themeIconColor`, all `String? @map(...)`) — or the
      alternative table from Stage 0.
- [x] New migration file `migrations/000N_admin_theming.sql` (do not touch
      existing numbered migrations).
- [x] `npm run db:generate`, then `npm run db:migrate:local` to apply
      locally.
- [x] `src/lib/validation.ts`: add a `themeSettingsSchema` validating each
      color as a hex string (e.g.
      `v.pipe(v.string(), v.trim(), v.regex(/^#[0-9a-fA-F]{6}$/, () => m.validation_theme_color_invalid()))`),
      each field optional/nullable — blank clears back to the DaisyUI
      default for that variable.
- [x] `src/lib/server/settings.ts`: extend `getSiteSettings()` to also return
      the theme fields, and add `setThemeSettings(db, prisma, { ...colors,
      administratorId })` following the same raw D1
      `INSERT ... ON CONFLICT DO UPDATE SET` upsert pattern as
      `setSiteTitle`/`setHeroBackgroundImage`, naming only the theme columns
      plus `updated_at`/`updated_by_id` so the other sections' columns are
      left untouched on conflict.

### Stage 2: Admin settings UI

- [x] `src/routes/admin/settings/+page.server.ts`: `load` returns the theme
      fields alongside the existing ones; add a `updateTheme` action (parse
      with `themeSettingsSchema`, call `setThemeSettings`, blank → `null`
      per field), guarded by the same
      `if (!event.locals.administratorId) return fail(401)` check as the
      other actions.
- [x] `src/routes/admin/settings/+page.svelte`: add a "Theming" section below
      the existing two, with a color input per field (button, row/background,
      text, icon), each pre-filled from `data.theme*` or the DaisyUI default
      swatch, a live preview (e.g. a sample button/row rendered with the
      in-progress values before saving), and its own submit button posting
      to `?/updateTheme`.

### Stage 3: Apply the theme site-wide

- [x] Root layout (`src/routes/+layout.server.ts` load, or `src/app.html`
      via `%sveltekit.*%`-style injection — confirm which is reachable for
      per-request DB-backed values) fetches the current theme settings and
      emits the resolved DaisyUI CSS custom properties as an inline
      `<style>` block (only overriding variables that have a non-null stored
      value; unset ones fall through to the existing DaisyUI theme so
      untouched deployments look identical to today).
- [x] Verify the override reaches both the public catalog and the admin
      console itself (confirm whether the admin console should also reflect
      custom theming, or intentionally stay on the default theme so the
      admin UI doesn't become unreadable from a bad color choice — flag this
      as an explicit product decision before implementing, don't assume
      either way).

#### Stage 3 implementation notes

**Product decision (confirmed before implementing):** the admin console
(`/admin`, `/admin/settings`, `/login`) always stays on the default look;
only the public catalog and package detail pages reflect custom theme
colors.

**Mechanism ended up being an inline `style` attribute on `.app-shell`, not
a global `:root` `<style>` block.** `src/routes/+layout.server.ts` (new)
fetches the 5 theme fields via `getSiteSettings()` on every request.
`+layout.svelte` builds a `--theme-*: <hex>` declaration string from the
non-null fields and — only when the route is neither `/admin*` nor
`/login` — sets it as the `style=` attribute directly on the `.app-shell`
wrapper div that already contains `{@render children()}`. Custom
properties inherit down through descendants exactly like a `:root`
override would, but scoped to that element, so admin/login pages (which
never receive the attribute) are pixel-identical to today regardless of
what's stored. An earlier attempt injected the override as a dynamic
`<style>` block via `<svelte:head>`; that works in the browser but breaks
`npm run lint:check` because eslint-plugin-svelte's Prettier integration
tries to parse a `<style>` tag's contents as static CSS and chokes on the
`${...}` interpolation — the inline-`style`-attribute approach avoids a
`<style>` tag entirely, which is why it needed to replace body/html-level
theming with an `.app-shell`-level override (see below).

**Refactored per Stage 0's flagged sub-step, scoped down to only the
public-facing files** (`admin/+page.svelte` was intentionally left
untouched since admin isn't themed): introduced `--theme-button`,
`--theme-row`, `--theme-background`, `--theme-text`, `--theme-icon`, each
used as `var(--theme-x, <original literal>)` at its call site rather than
given a global default in `:root` — so with no override present (every
admin/login render, and any public render before an admin sets a color)
every declaration falls through to the exact original literal, byte-for-byte
identical to pre-Stage-3 output:
- `+layout.svelte`: `.app-shell` background (solid layer only, gradient
  overlay untouched) and text color; `.icon-button svg` / `.language-menu
  summary > svg` stroke (was `currentColor`).
- `+page.svelte` (public catalog): `.hero-copy h1`/`.results-heading h1`
  text color; `.package-card` background (row); the shared
  button rule (search/results/empty-state, previously `var(--blue)`) and
  `.package-cta a`'s pill (previously `var(--green)`) both now resolve
  through `--theme-button` — so a fork's single configured button color
  applies uniformly to every public CTA, not just the ones that were blue
  before.
- `packages/[id]/+page.svelte`: `.download-card` background (row);
  `.download-button` background (previously `var(--green)`).
- `PackageIcon.svelte` intentionally left untouched (Stage 0 called its
  per-package swatch/glyph colors out of scope).
- Muted/secondary text colors (`--muted`, and the various one-off grays
  like `.package-copy .secondary`) were left as literal — only the primary
  heading/body text and the specific elements above were wired up; Stage 0
  only flagged the *admin* dashboard's stray grays as needing conversion,
  and admin is out of scope here.

Verified live via `wrangler dev` against local D1: set all 5 fields to
distinct colors, confirmed the inline `style` attribute (and the resulting
button/row/background/text/icon colors) appears on `/`, `/packages/{id}`,
but is entirely absent from `/admin` and `/login`; cleared all 5 back to
`null` and confirmed the `style` attribute disappears completely, restoring
the exact pre-Stage-3 markup.

### Stage 4: Messages (all 9 locale files under `src/lib/messages/`)

- [x] Add keys (English wording below; translate the rest):
      `admin_settings_theme_section_heading` ("Theming"),
      `admin_settings_theme_button_label` ("Button color"),
      `admin_settings_theme_row_label` ("Row color"),
      `admin_settings_theme_background_label` ("Background color"),
      `admin_settings_theme_text_label` ("Text color"),
      `admin_settings_theme_icon_label` ("Icon color"),
      `admin_settings_theme_hint` ("Leave a field blank to use the default
      color."),
      `admin_settings_theme_button` ("Save theme"),
      `admin_settings_theme_success` ("Theme updated."),
      `validation_theme_color_invalid` ("Enter a valid hex color (e.g.
      #336699).").
- [x] Broaden `admin_settings_description` to also mention theming.
- [x] `npm run paraglide:compile`.

### Stage 5: Tests

- [x] `test/settings.test.ts`: add cases for `setThemeSettings`
      (set, then clear back to null) and an unauthenticated-`updateTheme`
      401 case, following the existing `updateTitle`/`uploadHeroImage`
      pattern.
- [x] `test/validation.test.ts`: valid/invalid hex color cases for
      `themeSettingsSchema`.
- [x] ~~`test/admin.test.ts` (component suite)~~ `test/admin_settings.test.ts`
      (new component-suite file — `test/admin.test.ts` actually covers the
      `/admin` dashboard, not `/admin/settings`; a settings-page component
      test needed its own flat filename, registered in both
      `vitest.config.ts`'s `exclude` and `vitest.config.components.ts`'s
      `include`, per the convention `AGENTS.md` documents): render the
      settings page with custom theme values present and assert the new
      section's inputs are pre-filled; confirm existing hero-image/title
      sections still render unaffected.
- [x] Stage 3's inline theme override ended up living in `+layout.svelte`
      itself (an inline `style=` attribute on `.app-shell`), not a load
      function — `src/routes/+layout.server.ts`'s load only returns the raw
      theme fields. Added cases to `test/layout.test.ts` instead: only
      non-null fields produce a custom property, no `style` attribute at
      all when every field is null, and the override never appears on
      `/admin` or `/login` even when the fields are set.

### Stage 6: Docs

- [ ] Update `docs/code-breakdown.md` and `AGENTS.md`'s settings bullet to
      mention theming as a third admin-configurable section, and note the
      DaisyUI variable mapping decided in Stage 0 so a future contributor
      doesn't have to re-derive it.

## Verification

- `npm run check` (typecheck, lint, both test suites).
- `npm run dev`, log in as a seeded admin (see the "Known caveat" in
  `CLAUDE.md`), visit `/admin/settings`, set custom colors for buttons, rows,
  background, text, and icons, confirm they render on the public catalog,
  clear them and confirm the site reverts to the default DaisyUI theme, and
  re-verify the title and hero-image sections still save independently.
