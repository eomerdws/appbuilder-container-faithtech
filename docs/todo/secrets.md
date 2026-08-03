# Deployment ease-of-use: SCRIPTORIA_API_KEY and SESSION_SECRET

Both of these are Worker secrets (`wrangler secret put`, never in `wrangler.jsonc`),
set manually per environment today per `docs/DEPLOY.md`. Two real incidents this
session motivate this list: a one-character typo in a staging `SCRIPTORIA_API_KEY`
caused a silent, hard-to-diagnose 401 on the Scriptoria intake endpoint, and
production is currently missing `SESSION_SECRET` entirely (admin login is broken
there right now). The target audience for the deploy flow is a proficient
non-developer power user, not necessarily someone comfortable debugging a raw
`wrangler tail` session — so the fixes below favor scripts and self-checks over
more documentation to read carefully.

## Task list

### Stage 1: Streamline SCRIPTORIA_API_KEY setup

- [x] Write a script (e.g. `scripts/set-scriptoria-key.mjs`) that generates a
      strong random value and pipes it into `wrangler secret put
      SCRIPTORIA_API_KEY --env <env>` via stdin without a trailing newline
      (`echo` appends one and was the original suspect for this session's bug —
      use a `printf`-equivalent instead). The operator should never have to
      invent or hand-type the value.
- [x] After setting it, print the generated value exactly once in a clearly
      labeled, copy-paste-ready block — e.g. "Send this exact value to your
      Scriptoria build-engine operator for `notify/<server-name>/endpoint.json`"
      — since Cloudflare secrets can never be read back later.
- [x] Document the safe self-test in `docs/DEPLOY.md`: POST an empty `{}` body
      with the `Authorization` header to `/api/v1/notifications/scriptoria` —
      a `400 "Invalid notification payload"` confirms the key matches, a `401`
      confirms it doesn't. Lets an operator self-diagnose without needing
      `wrangler tail` or developer help.
- [x] Add a preflight check (e.g. `npm run verify:secrets -- --env <env>`) that
      runs `wrangler secret list --env <env>` and fails loudly if
      `SCRIPTORIA_API_KEY` is missing. Wire it into `deploy:staging:full` /
      `deploy:production:full` so a missing secret blocks deploy rather than
      failing silently at request time.

### Stage 2: Streamline SESSION_SECRET setup

- [x] Extend the same generate-and-pipe approach used for
      `SCRIPTORIA_API_KEY` to `SESSION_SECRET`, so an operator never has to
      run `openssl rand -base64 32` manually or remember the exact
      `wrangler secret put` invocation.
- [x] Extend (or add a parallel) preflight check confirming `SESSION_SECRET`
      is set per environment before deploy — this would have caught the
      current production gap automatically.
- [x] Update `docs/DEPLOY.md`'s Staging and Production sections to reference
      the new scripted flow for both secrets instead of the manual
      `openssl rand` + interactive `wrangler secret put` instructions.
