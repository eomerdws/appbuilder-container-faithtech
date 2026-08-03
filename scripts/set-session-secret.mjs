// Generate a strong SESSION_SECRET and set it as a Worker secret for the
// given environment via `wrangler secret put`. Mirrors set-scriptoria-key.mjs
// (same stdin-piping approach — no shell, no trailing newline).
//
// Unlike SCRIPTORIA_API_KEY, this value is never shared with an external
// party — it only signs this Worker's own admin session cookies — so it is
// deliberately never printed. Nothing outside this Worker needs it, and not
// printing it keeps it out of scrollback/terminal history for no reason.
//
// Also mirrors the generated value into .dev.vars as SESSION_SECRET=...
// (creating it from .dev.vars.example first if it doesn't exist yet), so a
// locally running `npm run dev` signs cookies with the same secret as
// whichever environment you just set it for. Skipped on --dry-run, like the
// `wrangler secret put` call itself.
//
// Usage:
//   node scripts/set-session-secret.mjs --env staging|production [--dry-run]
//   npm run set-session-secret -- --env staging

import { execFileSync } from 'node:child_process';
import { writeFileSync, existsSync, readFileSync, copyFileSync } from 'node:fs';
import { ensureWranglerConfig } from './ensure-wrangler-config.mjs';

const DEV_VARS_PATH = '.dev.vars';
const DEV_VARS_EXAMPLE_PATH = '.dev.vars.example';

function upsertDevVarsSecret(key, value) {
  if (!existsSync(DEV_VARS_PATH)) {
    if (existsSync(DEV_VARS_EXAMPLE_PATH)) {
      copyFileSync(DEV_VARS_EXAMPLE_PATH, DEV_VARS_PATH);
    } else {
      writeFileSync(DEV_VARS_PATH, '');
    }
  }

  const lines = readFileSync(DEV_VARS_PATH, 'utf8').split('\n');
  const pattern = new RegExp(`^${key}=`);
  let found = false;
  const updated = lines.map((line) => {
    if (pattern.test(line)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });

  if (!found) {
    if (updated.length > 0 && updated[updated.length - 1] === '') {
      updated.splice(updated.length - 1, 0, `${key}=${value}`);
    } else {
      updated.push(`${key}=${value}`);
    }
  }

  writeFileSync(DEV_VARS_PATH, updated.join('\n'));
}

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

ensureWranglerConfig({ seed: true });

const secret = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');

if (dryRun) {
  console.log(`[dry run] Would set SESSION_SECRET for env "${env}" without deploying it.`);
  console.log(`[dry run] Would also mirror it into ${DEV_VARS_PATH} for local dev.`);
} else {
  console.log(`Setting SESSION_SECRET for env "${env}"...`);
  execFileSync('npx', ['wrangler', 'secret', 'put', 'SESSION_SECRET', '--env', env], {
    input: secret,
    stdio: ['pipe', 'inherit', 'inherit']
  });

  upsertDevVarsSecret('SESSION_SECRET', secret);
  console.log(`Done. SESSION_SECRET is set for env "${env}" and mirrored into ${DEV_VARS_PATH}.`);
}
