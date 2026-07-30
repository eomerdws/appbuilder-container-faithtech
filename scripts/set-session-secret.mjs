// Generate a strong SESSION_SECRET and set it as a Worker secret for the
// given environment via `wrangler secret put`. Mirrors set-scriptoria-key.mjs
// (same stdin-piping approach — no shell, no trailing newline).
//
// Unlike SCRIPTORIA_API_KEY, this value is never shared with an external
// party — it only signs this Worker's own admin session cookies — so it is
// deliberately never printed. Nothing outside this Worker needs it, and not
// printing it keeps it out of scrollback/terminal history for no reason.
//
// Usage:
//   node scripts/set-session-secret.mjs --env staging|production [--dry-run]
//   npm run set-session-secret -- --env staging

import { execFileSync } from 'node:child_process';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      out.dryRun = true;
      continue;
    }
    if (arg?.startsWith('--')) {
      out[arg.slice(2)] = argv[i + 1];
      i += 1;
    }
  }
  return out;
}

const { env, dryRun } = parseArgs(process.argv.slice(2));

if (!env || !['staging', 'production'].includes(env)) {
  console.error('Usage: node scripts/set-session-secret.mjs --env staging|production [--dry-run]');
  process.exit(1);
}

const secret = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');

if (dryRun) {
  console.log(`[dry run] Would set SESSION_SECRET for env "${env}" without deploying it.`);
} else {
  console.log(`Setting SESSION_SECRET for env "${env}"...`);
  execFileSync('npx', ['wrangler', 'secret', 'put', 'SESSION_SECRET', '--env', env], {
    input: secret,
    stdio: ['pipe', 'inherit', 'inherit']
  });
  console.log(`Done. SESSION_SECRET is set for env "${env}".`);
}
