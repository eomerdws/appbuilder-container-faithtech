// Ensures wrangler.jsonc exists before a Wrangler-dependent npm script runs,
// so a missing file produces a clear, actionable message instead of
// Wrangler's own generic "no configuration file found" error. An existing
// wrangler.jsonc is never touched or overwritten by either mode.
//
// --seed  : if wrangler.jsonc is missing, copy it from wrangler.jsonc.example
//           and continue. Reserved for the first Wrangler-touching command
//           in a documented flow (see docs/RUNNING.md, docs/DEPLOY.md).
// (default): if wrangler.jsonc is missing, print an error and exit 1.
//           Used by every other Wrangler-dependent command, which assumes
//           the file already exists by that point in the flow.
//
// Usage:
//   node scripts/ensure-wrangler-config.mjs [--seed]

import { copyFileSync, existsSync } from 'node:fs';

const seed = process.argv.includes('--seed');
const configPath = 'wrangler.jsonc';
const examplePath = 'wrangler.jsonc.example';

if (existsSync(configPath)) {
  process.exit(0);
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
