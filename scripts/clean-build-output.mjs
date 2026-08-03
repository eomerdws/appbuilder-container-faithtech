// Removes SvelteKit/Wrangler build-output directories left over from an
// earlier `vite build` (npm run build / deploy:dry-run). tsconfig.json's
// `exclude` does NOT stop these from being type-checked — exclude only
// filters which files are picked as *root* files, not files reached
// transitively through imports (e.g. .svelte-kit/cloudflare/_worker.js
// imports ../output/server/index.js) — so a stale build floods `npm run
// typecheck` with hundreds of irrelevant errors from Svelte's own compiled
// runtime. Deleting these first guarantees a clean state regardless of
// what ran before; `vite build` regenerates all three from scratch.
import { rmSync } from 'node:fs';

const BUILD_OUTPUT_DIRS = [
  '.svelte-kit/output',
  '.svelte-kit/cloudflare',
  '.svelte-kit/cloudflare-tmp'
];

for (const dir of BUILD_OUTPUT_DIRS) {
  rmSync(dir, { recursive: true, force: true });
}
