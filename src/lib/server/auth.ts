import type { DatabaseClient } from "./db";

export class AuthenticationError extends Error {}
export class AuthorizationError extends Error {}

// `timingSafeEqual` is a Workers runtime extension to SubtleCrypto that the DOM
// lib types do not describe, so it is accessed through a typed wrapper.
const subtle = crypto.subtle as SubtleCrypto & {
  timingSafeEqual(
    a: ArrayBufferView | ArrayBuffer,
    b: ArrayBufferView | ArrayBuffer,
  ): boolean;
};

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours
const PBKDF2_ITERATIONS = 100_000;

// ---------------------------------------------------------------------------
// Password hashing (PBKDF2 via Web Crypto — native on Workers; bcrypt/argon2
// are not). Stored format: pbkdf2$<iterations>$<saltB64>$<hashB64>.
// ---------------------------------------------------------------------------

function toBase64(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function pbkdf2(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256,
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt.buffer)}$${toBase64(derived)}`;
}

async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, iterationsRaw, saltRaw, hashRaw] = stored.split("$");
  if (scheme !== "pbkdf2" || !iterationsRaw || !saltRaw || !hashRaw) {
    return false;
  }
  const iterations = Number(iterationsRaw);
  if (!Number.isSafeInteger(iterations) || iterations < 1) return false;
  const derived = await pbkdf2(password, fromBase64(saltRaw), iterations);
  const expected = fromBase64(hashRaw);
  if (derived.byteLength !== expected.byteLength) return false;
  return subtle.timingSafeEqual(derived, expected);
}

// Decoy hash verified when no account exists, so authentication performs the
// same PBKDF2 work whether or not the email is registered — defeating user
// enumeration by response timing. It MUST use the real iteration count (via
// PBKDF2_ITERATIONS) so the decoy path takes the same time as a genuine
// verification. The all-zero salt/digest cannot match any password, and this
// hash never grants access: the `!admin` check below fails the login anyway.
const DUMMY_PASSWORD_HASH =
  `pbkdf2$${PBKDF2_ITERATIONS}$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=`;

/**
 * Verify an administrator's email and password. Runs a hash even when the
 * account is missing or disabled so authentication timing does not reveal
 * which emails exist.
 */
export async function authenticateAdministrator(
  prisma: DatabaseClient,
  email: string,
  password: string,
): Promise<string> {
  const admin = await prisma.administrator.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, passwordHash: true, disabled: true },
  });
  const storedHash = admin?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const ok = await verifyPassword(password, storedHash);
  if (!admin || admin.disabled || !ok) {
    throw new AuthenticationError("Invalid email or password");
  }
  return admin.id;
}

// ---------------------------------------------------------------------------
// Scriptoria notification authentication. The publishing service (Scriptoria's
// build engine, configured via PUBLISH_NOTIFY) sends the REST notification with
// a shared secret in the `Authorization: Bearer <secret>` header. We compare it
// to SCRIPTORIA_API_KEY in constant time. The secret lives only as a Worker
// secret — never in the database, never displayed — so there is nothing to
// leak from the admin UI. Verification fails closed when the secret is unset so
// the intake endpoint can never be unauthenticated by accident.
// ---------------------------------------------------------------------------

const BEARER_PREFIX = "Bearer ";

export async function verifyScriptoriaSecret(
  authorizationHeader: string | null | undefined,
  configuredSecret: string,
): Promise<boolean> {
  if (!configuredSecret) return false; // fail closed: unset secret authorizes nothing
  if (!authorizationHeader || !authorizationHeader.startsWith(BEARER_PREFIX)) {
    return false;
  }
  const encoder = new TextEncoder();
  const provided = authorizationHeader.slice(BEARER_PREFIX.length);
  // Hash both sides to fixed-length SHA-256 digests before comparing. The
  // comparison is then constant-time regardless of input length and leaks
  // nothing about the secret — not even its length.
  const [providedDigest, expectedDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
    crypto.subtle.digest("SHA-256", encoder.encode(configuredSecret)),
  ]);
  return subtle.timingSafeEqual(providedDigest, expectedDigest);
}

// ---------------------------------------------------------------------------
// Stateless signed session cookies (HMAC-SHA256 with SESSION_SECRET).
// Token format: <adminId>.<expiryMs>.<signatureB64url>.
// ---------------------------------------------------------------------------

export const sessionCookieName = SESSION_COOKIE;
export const sessionMaxAge = SESSION_TTL_SECONDS;

function base64url(bytes: ArrayBuffer): string {
  return toBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return base64url(signature);
}

export async function createSessionToken(
  administratorId: string,
  secret: string,
  nowMs: number = Date.now(),
): Promise<string> {
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  const expiry = nowMs + SESSION_TTL_SECONDS * 1000;
  const payload = `${administratorId}.${expiry}`;
  return `${payload}.${await sign(payload, secret)}`;
}

async function readSessionToken(
  token: string | undefined,
  secret: string,
  nowMs: number = Date.now(),
): Promise<string> {
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  const parts = token?.split(".");
  if (!parts || parts.length !== 3) {
    throw new AuthenticationError("Administrator session required");
  }
  const [administratorId, expiryRaw, signature] = parts;
  const expected = await sign(`${administratorId}.${expiryRaw}`, secret);
  const encoder = new TextEncoder();
  if (
    signature!.length !== expected.length ||
    !subtle.timingSafeEqual(
      encoder.encode(signature),
      encoder.encode(expected),
    )
  ) {
    throw new AuthenticationError("Invalid administrator session");
  }
  const expiry = Number(expiryRaw);
  if (!Number.isSafeInteger(expiry) || expiry <= nowMs) {
    throw new AuthenticationError("Administrator session has expired");
  }
  return administratorId!;
}

/**
 * Verify the administrator session cookie and confirm the account is still
 * active. Returns the administrator id for attribution.
 */
export async function verifyAdministrator(
  sessionCookie: string | undefined,
  secret: string,
  prisma: DatabaseClient,
): Promise<string> {
  const administratorId = await readSessionToken(sessionCookie, secret);
  const admin = await prisma.administrator.findUnique({
    where: { id: administratorId },
    select: { disabled: true },
  });
  if (!admin || admin.disabled) {
    throw new AuthorizationError("Administrator access required");
  }
  return administratorId;
}
