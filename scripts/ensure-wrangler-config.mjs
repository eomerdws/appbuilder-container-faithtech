// Ensures wrangler.jsonc exists before a Wrangler-dependent npm script runs,
// so a missing file produces a clear, actionable message instead of
// Wrangler's own generic "no configuration file found" error. An existing
// wrangler.jsonc is never touched or overwritten by either mode.
//
// --seed  : if wrangler.jsonc is missing, copy it from wrangler.jsonc.example
//           and continue. Reserved for the first Wrangler-touching command
//           in a documented flow (see docs/local_dev.md, docs/deploying/README.md).
// (default): if wrangler.jsonc is missing, print an error and exit 1.
//           Used by every other Wrangler-dependent command, which assumes
//           the file already exists by that point in the flow.
//
// Callable directly from another script (`import { ensureWranglerConfig } from
// './ensure-wrangler-config.mjs'`) or run standalone as a CLI:
//   node scripts/ensure-wrangler-config.mjs [--seed]

import { copyFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const configPath = 'wrangler.jsonc';
const examplePath = 'wrangler.jsonc.example';

export function ensureWranglerConfig({ seed = false } = {}) {
  if (existsSync(configPath)) {
    return;
  }

  if (!seed) {
    console.error(
      `${configPath} not found. Copy it from the example first:\n` +
        `  cp ${examplePath} ${configPath}\n` +
        'Then fill in the placeholders described in docs/DEPLOY.md.'
    );
    process.exit(1);
  }

  if (!existsSync(examplePath)) {
    console.error(`Neither ${configPath} nor ${examplePath} exists — cannot continue.`);
    process.exit(1);
  }

  copyFileSync(examplePath, configPath);
  console.log(`${configPath} was missing — created it from ${examplePath}.`);
}

const isCliEntryPoint = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCliEntryPoint) {
  ensureWranglerConfig({ seed: process.argv.includes('--seed') });
}
