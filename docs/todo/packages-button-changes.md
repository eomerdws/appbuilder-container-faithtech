# Catalog card: split "View & download" into View button + whole-card download

Today the public catalog (`src/routes/+page.svelte`) renders one `.package-cta`
link per card (`catalog_card_cta_desktop`/`catalog_card_cta_mobile`, currently
"View & download") that navigates to `/packages/[id]`, where the actual
download link (`pkg.publishUrl`) lives. The ask: make that button a
**View-only** button (still going to the detail page), and make clicking
**anywhere else on the `.package-card`** trigger the package download
directly — `pkg.publishUrl` is already selected for catalog list items via
`publicPackageSelect` (`src/lib/server/packages.ts`), so no query/loader
change is needed to get the URL onto each card.

## Open question to confirm before starting

- [x] Confirm with product/design: should a whole-card click download
      immediately (skip the detail page's confirmation/feedback UI at
      `/packages/[id]`), or just be a bigger click target for navigating to
      view? This list assumes **immediate download**, matching the literal
      ask — flag if that's wrong before implementing.

## Task list

### Stage 1: Button text — View only

- [x] Decide new message key name(s) — renamed `catalog_card_cta_desktop`/
      `catalog_card_cta_mobile` to a single `catalog_card_view_cta` key.
      Collapsing to one key was possible because the new "View" copy is
      short enough for mobile too, so the old desktop/mobile split (and its
      `.desktop-cta`/`.mobile-cta` CSS) is no longer needed — removed both.
- [x] Update `en.json` with the new "View" copy (reference locale).
- [x] Update the other 8 locale files (`es`, `ar`, `de`, `tl`, `fr`, `id`,
      `ru`, `zh`) with matching keys/translations — all message files
      share the exact same key set. Also added a new
      `catalog_card_download_aria` key (all 9 locales) for the whole-card
      button's accessible label, needed for Stage 2.
- [x] Ran `npm run paraglide:compile` to regenerate `src/lib/paraglide/`.
- [x] Updated `src/routes/+page.svelte`'s CTA link to render
      `m.catalog_card_view_cta()`.

### Stage 2: Whole-card click → download

- [x] Added a click handler that opens `pkg.publishUrl` via
      `window.open(pkg.publishUrl, '_blank', 'noopener')`.
- [x] The "View" link's `onclick` calls `event.stopPropagation()` so
      clicking it navigates to the detail page instead of also triggering a
      download.
- [x] Accessibility: added `role="button"`, `tabindex="0"`, a `keydown`
      handler for `Enter`/`Space`, and an `aria-label` via the new
      `catalog_card_download_aria` message (e.g. "Download {title}").
      **Nested-interactive-element issue caught during implementation**:
      putting `role="button"` directly on the `<li>` triggered a real
      compiler warning (`svelte/a11y_no_noninteractive_element_to_interactive_role`,
      confirmed via `npm run typecheck`) — Svelte disallows overriding a
      non-interactive element's implicit role this way. Fixed by keeping
      `<li>` as a plain list item and moving `role="button"`/`tabindex`/the
      event handlers onto an inner `<div class="package-card">` that wraps
      the card content (the nested "View" `<a>` stays a real link inside
      that div, with its own `stopPropagation`). `npm run typecheck` now
      reports 0 warnings. Did not additionally test with a real screen
      reader (VoiceOver/NVDA) — flagging as a follow-up if this ships to
      real users, since automated checks don't fully cover screen-reader
      behavior for a div-wrapping-a-link pattern.
- [x] Added `cursor: pointer` plus a `:hover`/`:focus-visible` border
      highlight on `.package-card`.
- [x] Confirmed nothing else on the card is a link/button (`PackageIcon` is
      a `role="presentation"` SVG) — no other double-meaning click targets.

### Stage 3: Tests

- [x] Updated `test/root.test.ts` for the new "View" copy and added a
      `publishUrl` field to the shared `pkg()` fixture.
- [x] Added a test asserting clicking the card body calls
      `window.open` with `pkg.publishUrl`.
- [x] Added a test asserting clicking the "View" link does **not** also
      call `window.open` (regression test for the `stopPropagation` fix).
- [x] Added a keyboard-activation test (`Enter` and `Space` on the focused
      card) confirming both trigger the download.
- [x] Ran `npm run check` — 0 typecheck errors/warnings, 0 lint errors
      (2 pre-existing unrelated warnings), 114 + 40 tests passing.

### Stage 4: Docs

- [x] No `AGENTS.md`/architecture doc update needed — the CTA key
      rename/consolidation is a routine content change, not a change to the
      documented "add a key to all nine locale files" pattern itself.
