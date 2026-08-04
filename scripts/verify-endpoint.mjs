// Verifies endpoint.json — the file `set-scriptoria-key.mjs --url` writes
// for handing off to the Scriptoria build-engine operator — is actually
// correct before you hand it off:
//   1. it exists
//   2. its url is a production URL (contains "production", not "staging")
//   3. its Authorization: Bearer token matches the SCRIPTORIA_API_KEY
//      currently in .dev.vars
//
// Anything wrong gets fixed in place rather than just reported. Fixing the
// URL needs a human: pass --url, or (in a TTY) you'll be prompted for one.
//
// Usage:
//   node scripts/verify-endpoint.mjs [--url https://your-production-worker.workers.dev]
//   npm run verify:endpoint -- --url https://appbuilder-container-production.<subdomain>.workers.dev

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';

const ENDPOINT_PATH = 'endpoint.json';
const DEV_VARS_PATH = '.dev.vars';
const NOTIFY_PATH_SUFFIX = '/api/v1/notifications/scriptoria';

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

function readScriptoriaKey() {
  if (!existsSync(DEV_VARS_PATH)) {
    console.error(`${DEV_VARS_PATH} not found. Copy .dev.vars.example to ${DEV_VARS_PATH} first.`);
    process.exit(1);
  }
  const match = readFileSync(DEV_VARS_PATH, 'utf8').match(/^SCRIPTORIA_API_KEY=(.*)$/m);
  if (!match || !match[1]) {
    console.error(`SCRIPTORIA_API_KEY is not set in ${DEV_VARS_PATH}.`);
    console.error('Set it with: npm run set-scriptoria-key -- --env staging');
    process.exit(1);
  }
  return match[1].trim();
}

function isProductionNotStaging(url) {
  return typeof url === 'string' && url.includes('production') && !url.includes('staging');
}

function toNotifyUrl(rawUrl) {
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith(NOTIFY_PATH_SUFFIX) ? trimmed : `${trimmed}${NOTIFY_PATH_SUFFIX}`;
}

async function promptForUrl() {
  if (!process.stdin.isTTY) {
    console.error(
      'endpoint.json needs a production URL and none was given.\n' +
        'Re-run with: npm run verify:endpoint -- --url https://your-production-worker.workers.dev'
    );
    process.exit(1);
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    for (;;) {
      const answer = await rl.question(
        'Production worker URL (e.g. https://appbuilder-container-production.<subdomain>.workers.dev): '
      );
      const candidate = toNotifyUrl(answer);
      if (isProductionNotStaging(candidate)) return candidate;
      console.log('That URL must contain "production" and must not contain "staging". Try again.');
    }
  } finally {
    rl.close();
  }
}

const { url: urlArg } = parseArgs(process.argv.slice(2));
const scriptoriaKey = readScriptoriaKey();
const expectedHeader = `Authorization: Bearer ${scriptoriaKey}`;

let endpoint = null;
if (existsSync(ENDPOINT_PATH)) {
  try {
    endpoint = JSON.parse(readFileSync(ENDPOINT_PATH, 'utf8'));
  } catch (cause) {
    console.error(`${ENDPOINT_PATH} exists but is not valid JSON: ${cause.message}`);
  }
}

const problems = [];
if (!endpoint) {
  problems.push(`${ENDPOINT_PATH} is missing or unreadable`);
} else {
  if (!isProductionNotStaging(endpoint.url)) {
    problems.push(
      'url is not a production URL (must contain "production", must not contain "staging")'
    );
  }
  const headers = Array.isArray(endpoint.headers) ? endpoint.headers : [];
  if (!headers.includes(expectedHeader)) {
    problems.push(`Authorization header does not match SCRIPTORIA_API_KEY in ${DEV_VARS_PATH}`);
  }
}

if (problems.length === 0) {
  console.log(
    `${ENDPOINT_PATH} is valid: production URL, and Authorization token matches ${DEV_VARS_PATH}.`
  );
  process.exit(0);
}

console.log(`${ENDPOINT_PATH} has issue(s):`);
for (const problem of problems) console.log(`  - ${problem}`);

const needsUrl = !isProductionNotStaging(endpoint?.url);
let notifyUrl = needsUrl ? null : endpoint.url;

if (needsUrl) {
  if (urlArg) {
    notifyUrl = toNotifyUrl(urlArg);
    if (!isProductionNotStaging(notifyUrl)) {
      console.error(
        '--url must point at a production URL (must contain "production", must not contain "staging").'
      );
      process.exit(1);
    }
  } else {
    notifyUrl = await promptForUrl();
  }
}

writeFileSync(
  ENDPOINT_PATH,
  `${JSON.stringify({ url: notifyUrl, headers: [expectedHeader] }, null, 2)}\n`
);

console.log(`\nWrote corrected ${ENDPOINT_PATH} (gitignored — never commit it):`);
console.log(`  url: ${notifyUrl}`);
console.log('Hand this file to your Scriptoria build-engine administrator.');
