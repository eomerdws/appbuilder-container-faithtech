# Rename "glocal-packages" → "appbuilder-container"

Full-repo audit for every "glocal" reference (case-insensitive), 86 hits
total, minus the 52 hackathon-ticket frontmatter lines (`source:
"Glocal_Hackathon_Implementation_Tickets.xlsx"`) — those name a real
historical source spreadsheet and should **not** change; renaming them would
misrepresent where the tickets actually came from. That leaves 34 real hits,
none of them in `src/`, `scripts/`, or any test file — confirmed by grepping
`src/ scripts/ test/*.ts *.mjs *.svelte` and getting zero matches. So this is
almost entirely a configuration + documentation rename, not a code rename.

**Naming proposal** (confirm before executing): `glocal-packages` → the base
identifier `appbuilder-container`, then per-environment suffixes as today —
`appbuilder-container-staging`, `appbuilder-container-production`,
`appbuilder-container-local`, `appbuilder-container-test`. One thing worth
resolving before Stage 1: the *actually deployed* staging/production D1
database is already named plain `appbuilder-container` (shared between both
environments, database_id `20facaec-82af-4d68-9d1e-c27bd42a9f6a` — seen live
this session), which doesn't match `wrangler.jsonc.example`'s template
naming (`glocal-packages-staging` / `glocal-packages-production` as two
separate names). Decide whether the template should match the real deployed
name (one shared `appbuilder-container` D1) or the per-environment suffix
convention (`appbuilder-container-staging`/`-production`, implying separate
databases) before editing the example file, so the template stops lying
about what's actually deployed.

**Important — a text rename here does not rename anything live.** Per
Wrangler's own behavior (no `wrangler rename` command exists): changing
`name`/`database_name` in `wrangler.jsonc` and redeploying creates a **new**
Worker under the new name; the old one (`glocal-packages-api-staging`, etc.)
keeps running untouched until manually deleted, and secrets don't carry over
to the new Worker. Stage 1 below only covers renaming identifiers in the
*committed template* (`wrangler.jsonc.example`) and the fully local/ephemeral
`test/wrangler.test.jsonc` — actually renaming the live staging/production
Workers is a separate, higher-risk follow-up (redeploy under new name →
re-run `set-session-secret`/`set-scriptoria-key` → re-hand-off the new
Scriptoria key → delete the old Worker) that should be its own deliberate
step, not bundled silently into a find-and-replace.

## Task list

### Stage 1 — Configuration

- [x] Resolve the staging/production D1 naming question above before editing
      anything. **Resolved: separate per-environment names** —
      `appbuilder-container-staging` / `appbuilder-container-production` —
      chosen over matching the currently-deployed shared database name.
- [x] `wrangler.jsonc.example`:
      - line 3: `"name": "glocal-packages-api"` → `"appbuilder-container"`
      - line 30: `"database_name": "glocal-packages-local"` → `"appbuilder-container-local"`
      - line 37: `"name": "glocal-packages-api-staging"` → `"appbuilder-container-staging"`
      - line 45: `"database_name": "glocal-packages-staging"` → `"appbuilder-container-staging"`
      - line 52: `"name": "glocal-packages-api-production"` → `"appbuilder-container-production"`
      - line 60: `"database_name": "glocal-packages-production"` → `"appbuilder-container-production"`
      - Confirmed clean: no "glocal" matches remain in this file.
- [x] Your own local `wrangler.jsonc` (gitignored, not committed) — it was
      still just the unmodified placeholder copy (no real values filled in
      yet, confirmed by diffing against the example before this change), so
      re-copied fresh from the updated `wrangler.jsonc.example` rather than
      hand-patching.
- [x] `test/wrangler.test.jsonc` (fully local/ephemeral, no live infra impact
      — safe to rename outright):
      - line 2: `"name": "glocal-packages-test"` → `"appbuilder-container-test"`
      - line 9: `"database_name": "glocal-packages-test"` → `"appbuilder-container-test"`
      - `npm run test` re-run afterward: 46/46 tests still pass.
- [ ] `scriptoria-poller/wrangler.jsonc:31` — `"database_name":
      "glocal-packages-staging"`. This is a separate, mostly-scaffolded
      subproject (per `CLAUDE.md`, not wired into the main app's build/deploy)
      — flagging rather than including by default; rename only if you want
      that subproject touched too.
- [ ] **Separate follow-up, not part of this pass:** actually redeploy the
      live staging/production Workers under the new names and retire the old
      ones (see the caution above) — plan this as its own step when ready.

### Stage 2 — Code

- [x] Verified: zero "glocal" matches anywhere in `src/`, `scripts/`, or any
      `test/*.ts`/`*.mjs`/`*.svelte` file. Nothing to rename in code.

### Stage 3 — Documentation

- [x] `README.md`:
      - line 1: `# Glocal Packages container app` → `# AppBuilder Container app`
      - line 3: "the Glocal container application" → "the AppBuilder Container application"
      - line 32: `` `glocal-packages-staging` `` → `` `appbuilder-container-staging` ``
      - lines 121, 122, 129: `glocal-packages-staging` in example commands → `appbuilder-container-staging`
      - Confirmed clean: no "glocal" matches remain.
- [x] `CLAUDE.md:9` — `"Glocal Packages" (FaithTech/SIL hackathon project)` →
      `"AppBuilder Container" (FaithTech/SIL hackathon project, formerly
      "Glocal Packages")`. Kept the "formerly" note here specifically, since
      this file orients agents who may run into old commit messages/branch
      names referencing the old name.
- [x] `AGENTS.md`:
      - line 1: `# Glocal Packages Container — Agent Context` → `# AppBuilder Container — Agent Context`
      - line 210: `https://glocal-packages-api-staging...` example URL → `https://appbuilder-container-staging...`
      - Confirmed clean.
- [x] `docs/deploy.md`:
      - line 4: `` `glocal-packages-api-staging` `` → `` `appbuilder-container-staging` ``
      - line 56: `npx wrangler d1 create glocal-packages-staging` → `appbuilder-container-staging`
      - line 75: example URL → `appbuilder-container-staging`
      - line 162: `npx wrangler d1 create glocal-packages-production` → `appbuilder-container-production`
      - Confirmed clean.
- [x] `docs/SOURCE-CODE-BREAKDOWN.md`:
      - line 1: `# Codebase Breakdown — Glocal Packages` → `# Codebase Breakdown — AppBuilder Container`
      - line 54: fixed the stale/inaccurate logo description — reworded to
        "header with a home icon (no text logo)", matching what
        `src/routes/+layout.svelte` actually renders (an SVG icon, no text).
      - line 345: `npx wrangler d1 create glocal-packages-staging` → `appbuilder-container-staging`
      - Confirmed clean.
- [x] `docs/tickets/NON-TECH.md:1` — `# Non-Technical Contributor Guide — Glocal Packages` → `— AppBuilder Container`. Confirmed clean.
- [x] `docs/tickets/README.md` — resolved the judgment calls:
      - line 16 (`## Glocal Hackathon Tickets`) and line 20 (the `.xlsx`
        filename citation) kept unchanged — literal historical names, same
        reasoning as the excluded ticket frontmatter.
      - line 22: kept the original name-origin explanation and appended
        "The project was later renamed to AppBuilder Container; these
        tickets are kept under their original hackathon name as a historical
        record."
- [ ] `scriptoria-poller/README.md` (lines 85, 88, 128, 143) — same subproject
      caveat as its `wrangler.jsonc` above; only touch if scriptoria-poller is
      included in this rename.

### Explicitly excluded — leave unchanged

- All 52 `docs/tickets/*.md` frontmatter lines: `source:
  "Glocal_Hackathon_Implementation_Tickets.xlsx"` — names a real historical
  file; changing it would misrepresent where the tickets came from.
- `docs/tickets/FE-013-build-api-credential-management-ui.md:27` — cites
  `Glocal Hackathon SIL.md` as a source document; same reasoning.
- Every other file under `docs/todo/` (e.g. `wrangler_config_guard.md:77`'s
  `glocal-packages-staging`/`glocal-packages-production` example) — these are
  historical records of already-completed work and are left as they were
  written, not retroactively updated to match a later rename.
