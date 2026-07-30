// Fail loudly, before a deploy, if a required Worker secret hasn't been set
// for the given environment — rather than the app silently misbehaving at
// request time (a missing SESSION_SECRET breaks admin login; a missing
// SCRIPTORIA_API_KEY fails closed on every notification with a 401).
//
// Usage:
//   node scripts/verify-secrets.mjs --env staging|production
//   npm run verify:secrets -- --env staging

import { execFileSync } from 'node:child_process';

// Extend this list as more secrets become required for a working deployment.
const REQUIRED_SECRETS = ['SCRIPTORIA_API_KEY', 'SESSION_SECRET'];

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg?.startsWith('--')) {
      out[arg.slice(2)] = argv[i + 1];
      i += 1;
    }
  }
  return out;
}

const { env } = parseArgs(process.argv.slice(2));

if (!env || !['staging', 'production'].includes(env)) {
  console.error('Usage: node scripts/verify-secrets.mjs --env staging|production');
  process.exit(1);
}

let raw;
try {
  raw = execFileSync('npx', ['wrangler', 'secret', 'list', '--env', env], {
    stdio: ['ignore', 'pipe', 'ignore'],
    encoding: 'utf8'
  });
} catch (cause) {
  console.error(`Could not list secrets for env "${env}":`, cause.message);
  process.exit(1);
}

let configured;
try {
  configured = new Set(JSON.parse(raw).map((entry) => entry.name));
} catch {
  console.error(`Could not parse "wrangler secret list --env ${env}" output as JSON.`);
  process.exit(1);
}

const missing = REQUIRED_SECRETS.filter((name) => !configured.has(name));

if (missing.length > 0) {
  console.error(`Missing required secret(s) for env "${env}": ${missing.join(', ')}`);
  console.error('Set them with, e.g.:');
  for (const name of missing) {
    console.error(`  npx wrangler secret put ${name} --env ${env}`);
  }
  process.exit(1);
}

console.log(`All required secrets are set for env "${env}": ${REQUIRED_SECRETS.join(', ')}`);
