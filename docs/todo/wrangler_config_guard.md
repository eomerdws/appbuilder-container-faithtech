# Guard npm scripts against a missing wrangler.jsonc

Since `wrangler.jsonc` was moved to a gitignored file (created from the
committed `wrangler.jsonc.example`, see the "Changed wrangler.jsonc to
example" commit), every npm script that shells out to `wrangler deploy`,
`wrangler d1 ...`, or `wrangler secret ...` fails immediately with Wrangler's
own generic "no configuration file found" error if that copy step was never
done. Confirmed by actually running each of these commands with the file
absent.

Two behaviors, per the request:

- **Seed mode** — for whichever command is the *first* Wrangler-touching
  step in `docs/RUNNING.md`'s or `docs/DEPLOY.md`'s documented sequence: if
  `wrangler.jsonc` is missing, copy `wrangler.jsonc.example` → `wrangler.jsonc`
  automatically and continue. If it's already there, leave it untouched and
  continue with the existing file.
- **Guard mode** — for every other affected command: if `wrangler.jsonc` is
  missing, print a clear, actionable error (not Wrangler's generic one) and
  stop. Never auto-copy here — by this point in either doc's flow the file
  is assumed to already exist, possibly already filled in with real values.

Both modes share one rule: an *existing* `wrangler.jsonc` is never touched or
overwritten, only its absence is handled differently.

## Task list

### Foundational

- [ ] Build a shared helper, e.g. `scripts/ensure-wrangler-config.mjs`, that
      checks for `wrangler.jsonc` in the cwd and either:
      - copies it from `wrangler.jsonc.example` and prints a short confirmation
        (seed mode, `--seed` flag), or
      - prints a clear error naming the missing file and the fix
        (`cp wrangler.jsonc.example wrangler.jsonc`) and exits non-zero (guard
        mode, default).
      For the raw-`wrangler`-command scripts in `package.json` (no backing
      `.mjs` file), prefix the script string with
      `node scripts/ensure-wrangler-config.mjs [--seed] &&`. For the scripts
      that already have their own `.mjs` file, call the same check directly
      at the top of that file instead of shelling out to a second process.

### Seed mode — first command per documented flow

- [ ] `db:migrate:local` (`package.json:26`) — the first Wrangler-touching
      command in `docs/RUNNING.md`'s Local development sequence (step 3,
      right after the `.dev.vars` copy step).
- [ ] `set-session-secret` (`package.json:33`, `scripts/set-session-secret.mjs`)
      — the first Wrangler-touching command in `docs/DEPLOY.md`'s Staging
      deploy sequence (step 2), and identical for Production.
      **Open question:** `set-scriptoria-key` (`package.json:32`) is documented
      immediately after it in the same step, and the two are independent —
      someone rotating just one secret later could hit either first. Leaning
      toward giving `set-scriptoria-key` seed mode too for robustness, but
      flagging rather than deciding unilaterally — confirm before implementing.

### Guard mode — every other affected command

- [ ] `deploy:staging` (`package.json:10`)
- [ ] `deploy:production` (`package.json:11`)
- [ ] `deploy:dry-run` (`package.json:12`)
- [ ] `db:seed:local` (`package.json:27`)
- [ ] `db:seed:dev` (`package.json:28`)
- [ ] `db:migrate:staging` (`package.json:29`)
- [ ] `db:migrate:production` (`package.json:30`)
- [ ] `create-admin` (`package.json:31`, `scripts/create-admin.mjs`)
- [ ] `set-scriptoria-key` (`package.json:32`, `scripts/set-scriptoria-key.mjs`)
      — pending the open question above
- [ ] `verify:secrets` (`package.json:34`, `scripts/verify-secrets.mjs`)
- [ ] `deploy:staging:full` (`package.json:35`) — no separate guard needed;
      it chains `verify:secrets && db:migrate:staging && deploy:staging`, each
      already guarded individually, so the chain fails fast at the first one.
- [ ] `deploy:production:full` (`package.json:36`) — same, transitively covered.

### Out of scope (flagged, not part of this todo)

- `npx wrangler d1 create glocal-packages-staging` / `glocal-packages-production`
  (`docs/DEPLOY.md:56, 162`) — also fails without config, but isn't an npm
  script, so not covered here unless requested separately.
