// Generate a strong SCRIPTORIA_API_KEY and set it as a Worker secret for the
// given environment via `wrangler secret put`. The value is passed straight
// to the child process's stdin (no shell, no trailing newline) — piping
// through `echo` appends a `\n` that becomes part of the stored secret and
// silently breaks every future comparison; this avoids that class of bug
// entirely rather than relying on the operator to remember `printf` instead.
//
// Prints the generated value exactly once, since Cloudflare secrets can
// never be read back after they're set — this is the value to hand to your
// Scriptoria build-engine operator.
//
// If --url is given, also writes endpoint.json to the repo root with that
// URL and the Authorization header. This site doesn't manage Scriptoria's
// PUBLISH_NOTIFY registration or its notify/<server-name>/ storage layout —
// that's entirely Scriptoria's own internal bookkeeping once you hand this
// file's contents to your build-engine operator, so nothing here needs a
// server name. The file contains the live secret in plaintext —
// "endpoint.json" is gitignored so it can't be committed by accident, but
// treat it like any other secret on disk: delete or move it once handed off.
//
// Usage:
//   node scripts/set-scriptoria-key.mjs --env staging|production [--dry-run]
//     [--url https://your-worker.example.workers.dev]
//   npm run set-scriptoria-key -- --env staging --url https://...

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { ensureWranglerConfig } from './ensure-wrangler-config.mjs';

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

const { env, dryRun, url } = parseArgs(process.argv.slice(2));

if (!env || !['staging', 'production'].includes(env)) {
  console.error(
    'Usage: node scripts/set-scriptoria-key.mjs --env staging|production [--dry-run]\n' +
      '  [--url https://your-worker.example.workers.dev]'
  );
  process.exit(1);
}

ensureWranglerConfig({ seed: true });

const secret = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');

if (dryRun) {
  console.log(`[dry run] Would set SCRIPTORIA_API_KEY for env "${env}" without deploying it.`);
} else {
  console.log(`Setting SCRIPTORIA_API_KEY for env "${env}"...`);
  execFileSync('npx', ['wrangler', 'secret', 'put', 'SCRIPTORIA_API_KEY', '--env', env], {
    input: secret,
    stdio: ['pipe', 'inherit', 'inherit']
  });
}

console.log('\n=== Send this exact value to your Scriptoria build-engine operator ===');
console.log(`SCRIPTORIA_API_KEY (${env}): ${secret}`);
console.log(
  'It goes in the Authorization header as:\n' +
    `  "Authorization: Bearer ${secret}"\n` +
    'This value cannot be retrieved again once you close this terminal — copy it now.'
);

if (url) {
  const endpointPath = 'endpoint.json';
  const notifyUrl = `${url.replace(/\/+$/, '')}/api/v1/notifications/scriptoria`;
  const endpoint = {
    url: notifyUrl,
    headers: [`Authorization: Bearer ${secret}`]
  };

  writeFileSync(endpointPath, `${JSON.stringify(endpoint, null, 2)}\n`);

  console.log(`\nWrote ${endpointPath} (gitignored — never commit it).`);
  console.log('Hand this file to your Scriptoria build-engine operator, then delete or move it.');
}
