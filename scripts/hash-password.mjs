// Generate a PBKDF2 password hash for an administrator row, in the exact format
// src/lib/server/auth.ts expects: pbkdf2$<iterations>$<saltB64>$<hashB64>.
// Mirrors hashPassword() there (PBKDF2-HMAC-SHA256, 100k iterations, 16-byte
// salt, 256-bit derived key). Uses only Node 22 globals (Web Crypto, Buffer).
//
// Usage: node scripts/hash-password.mjs "the-password"
//    or: npm run hash:password -- "the-password"

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "<password>"');
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
console.log(`pbkdf2$${ITERATIONS}$${b64(salt)}$${b64(bits)}`);
