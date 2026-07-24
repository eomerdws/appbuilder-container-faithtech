# Add ESLint (+ Prettier)

This repo currently has no lint tooling at all: no `eslint`/`prettier` deps, no config, no CI. `elint.config.js` at the repo root is an empty, 0-byte file committed since the initial setup commit — a typo'd placeholder, not an alternate config for anything (confirmed: no other eslint-flavored file anywhere, no `lint` script, and the file is identical on `main`).

The roadmap below mirrors [`sillsdev/appbuilder-portal`](https://github.com/sillsdev/appbuilder-portal/blob/develop/eslint.config.js) — a sister SvelteKit/Svelte 5/TypeScript/Prisma project already running this exact stack — adapted for this repo's differences:

| | appbuilder-portal | this repo |
|---|---|---|
| Prisma target | Postgres (Node) | D1/SQLite (Workers, via `prisma.config.ts`) |
| Runtime | Node | Cloudflare Workers (`workerd`) |
| Lint/format tooling | Full ESLint + Prettier stack already | None |
| Custom rule `sveltekit-sec/require-security-check` | Enforces `locals.security.require*()` in every `.server.ts`/`+server.ts`/`.remote.ts` export | Not portable as-is — this repo's auth pattern is different (`event.locals.administratorId` set in `hooks.server.ts`, checked manually in `admin/+layout.server.ts`), there's no `locals.security` namespace to match against |
| CI | GitHub Actions (`pr.yml` → `setup.yml`) with a `lint` job | None currently |

## Task list

### Cleanup

- [ ] Delete the empty `elint.config.js` — dead file, not a real config.

### Dependencies

- [ ] Install devDependencies (versions validated against Svelte 5 + this SvelteKit version by appbuilder-portal):
  ```
  eslint @eslint/js typescript-eslint
  eslint-plugin-svelte eslint-plugin-import eslint-import-resolver-typescript
  eslint-plugin-prettier eslint-config-prettier
  prettier prettier-plugin-svelte
  globals
  ```
- [ ] Skip `prettier-plugin-prisma` unless schema formatting via Prettier is wanted too — redundant with the existing `npm run db:format`.

### ESLint config

- [ ] Add `eslint.config.js` at root, adapted from appbuilder-portal's flat config:
  - Base: `js.configs.recommended`, `ts.configs.recommended`, `prettierConfig`, `svelte.configs['flat/recommended']`, `svelte.configs['flat/prettier']`, `importPlugin.flatConfigs.recommended` + `.typescript`.
  - `languageOptions.globals`: `globals.node` for dev/build tooling — evaluate whether a Workers-specific global set is also needed, since routes run under `workerd` at runtime, not Node (appbuilder-portal doesn't have this wrinkle).
  - TS project-service block for `**/*.svelte`, `**/*.svelte.ts`, `**/*.svelte.js`, `**/*.ts`, importing `svelteConfig` from `./svelte.config.js`.
  - Check whether `allowDefaultProject` needs `prisma.config.ts`, `vite.config.ts`, `vitest.config.ts` — this repo's `tsconfig.json` has no explicit `include`, so these may already be covered by default; verify with `npx eslint .` rather than assuming.
  - Do **not** port `require-security-check.js` verbatim — it hardcodes appbuilder-portal's `locals.security.require*()` convention, which doesn't exist here. An equivalent guard for this repo's auth pattern (checking for `locals.administratorId` handling) would be a separate follow-up task, not a lift-and-shift.
  - `globalIgnores`: appbuilder-portal's list plus this repo's specifics — `.wrangler`, `src/lib/server/generated`, `.local`, `worker-configuration.d.ts` (551KB generated file), and likely `scriptoria-poller/**` (per CLAUDE.md, treat as unrelated scaffolded WIP unless a task specifically targets it).

### Prettier config

- [ ] Add `.prettierrc` (appbuilder-portal's settings: `singleQuote`, `trailingComma: none`, `printWidth: 100`, `plugins: ["prettier-plugin-svelte"]`, svelte parser override).
- [ ] Add `.prettierignore` (same ignore list as ESLint's `globalIgnores`).

### Editor integration (optional)

- [ ] Add `.vscode/settings.json` with `editor.codeActionsOnSave: { "source.fixAll.eslint": "always" }` for editor auto-fix parity.

### npm scripts

- [ ] Add to `package.json`:
  ```
  "lint": "eslint .",
  "format": "eslint --fix ."
  ```
- [ ] Fold `lint` into `npm run check` (CLAUDE.md treats `check` as the pre-commit gate, currently typecheck + test only) — either update the `check` script to `typecheck && lint && test`, or keep `lint` separate and update CLAUDE.md's description of `check` accordingly.

### First run

- [ ] Run `npx eslint .` cold and fix real findings (or add justified `eslint-disable` comments) rather than tuning rules down to silence everything.

### CI

- [ ] Add a GitHub Actions workflow (`.github/workflows/` doesn't exist yet, unlike appbuilder-portal's `pr.yml`/`setup.yml`): on PRs, run `npm ci`, `npm run check` (now including lint), and `npm test`. Lighter than appbuilder-portal's setup since there's no Docker/Playwright/Postgres seeding here.

### Docs

- [ ] Update `AGENTS.md`'s command table with the new `lint`/`format` scripts (per CLAUDE.md's working-conventions rule that `AGENTS.md` must not drift out of sync, since other tools read it).
- [ ] Update `docs/SOURCE-CODE-BREAKDOWN.md` if it enumerates root config files.
