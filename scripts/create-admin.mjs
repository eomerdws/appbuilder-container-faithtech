// Bootstrap an administrator row directly in a remote D1 database.
// One-time-per-environment action — NOT part of the deploy chain (see
// docs/DEPLOY.md "Create an administrator"). Mirrors hashPassword() in
// src/lib/server/auth.ts (PBKDF2-HMAC-SHA256, 100k iterations, 16-byte
// salt, 256-bit derived key), then shells out to `wrangler d1 execute`.
//
// Usage:
//   node scripts/create-admin.mjs --env staging --email you@example.org --password "..." [--name "You"]
//   npm run create-admin -- --env staging --email you@example.org --password "..."

import { execFileSync } from "node:child_process";

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, "");
    out[key] = argv[i + 1];
  }
  return out;
}

const { env, email, password, name } = parseArgs(process.argv.slice(2));

if (!env || !["staging", "production"].includes(env)) {
  console.error('Usage: node scripts/create-admin.mjs --env staging|production --email <email> --password "<password>" [--name "<display name>"]');
  process.exit(1);
}
if (!email || !password) {
  console.error('Usage: node scripts/create-admin.mjs --env staging|production --email <email> --password "<password>" [--name "<display name>"]');
  process.exit(1);
}

const ITERATIONS = 100_000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(password),
  "PBKDF2",
  false,
  ["deriveBits"],
);
const bits = await crypto.subtle.deriveBits(
  { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
  key,
  256,
);
const b64 = (bytes) => Buffer.from(bytes).toString("base64");
const passwordHash = `pbkdf2$${ITERATIONS}$${b64(salt)}$${b64(bits)}`;

const id = crypto.randomUUID();
const now = new Date().toISOString();

// Single quotes are the only SQL-meaningful character passed through from
// operator input here; double them so a name/email like "O'Brien" can't
// break out of the string literal.
const sqlEscape = (s) => s.replace(/'/g, "''");

const displayName = name ? `'${sqlEscape(name)}'` : "NULL";

const sql = `INSERT INTO administrators (id,email,display_name,password_hash,disabled,created_at,updated_at)
VALUES ('${id}','${sqlEscape(email)}',${displayName},'${passwordHash}',0,'${now}','${now}')`;

console.log(`Creating administrator ${email} in ${env}...`);

execFileSync(
  "npx",
  ["wrangler", "d1", "execute", "DB", "--remote", "--env", env, "--command", sql],
  { stdio: "inherit" },
);

console.log(`Done. Administrator id: ${id}`);
