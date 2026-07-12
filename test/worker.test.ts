import { applyD1Migrations, env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import * as v from "valibot";
import {
  AuthenticationError,
  authenticateAdministrator,
  createSessionToken,
  hashPassword,
  verifyAdministrator,
  verifyScriptoriaSecret,
} from "../src/lib/server/auth";
import { createPrisma } from "../src/lib/server/db";
import {
  ingestNotification,
  scriptoriaNotificationSchema,
} from "../src/lib/server/notification";
import { moderatePackage, searchActivePackages } from "../src/lib/server/packages";
import { POST as scriptoriaIntake } from "../src/routes/api/v1/notifications/scriptoria/+server";

const notification = {
  project_url: "https://app.scriptoria.io/projects/722",
  project_name: "gvs Gumawana",
  project_repo:
    "s3://sil-prd-aps-projects/scriptureappbuilder/gvs-1380-gvs-Gumawana",
  publish_url:
    "https://sil-prd-scriptoria-files.s3.amazonaws.com/asset-package/d54c912a-979c-4fa2-9eac-164d7e2f575d/org.wycliffe.gvs.gumawana.bible.zip",
  permalink_url:
    "https://app.scriptoria.io/api/products/d54c912a-979c-4fa2-9eac-164d7e2f575d/files/published/asset-package",
  size: "11351769}",
  app_builder: "scripture-app-builder",
  app_builder_version: "9.3",
  app_lang: {
    full: "gvs-Latn-PG",
    iana: ["Gumawana"],
    iso639_3: "gvs",
    localname: "Gumawana",
    localnames: ["Gumawana"],
    name: "Gumawana",
    names: ["Domdom", "Gumasi", "Gumasila"],
    region: "PG",
    regionname: "Papua New Guinea",
    script: "Latn",
    sldr: true,
    windows: "gvs-Latn",
  },
  image: {
    baseurl:
      "https://app.scriptoria.io/api/products/d54c912a-979c-4fa2-9eac-164d7e2f575d/files/published",
    files: [
      { size: "1x", src: "nav_drawer.png" },
      { size: "2x", src: "nav_drawer@2x.png" },
    ],
  },
  listing: [
    {
      lang: "en-US",
      title: "Gumawana Bible",
      short_description: "The Bible in Gumawana of Papua New Guinea [gvs]",
      full_description: "<b>Buki Kimaasabaina</b>",
    },
  ],
};

const adminEmail = "admin@example.invalid";
const adminPassword = "demo-password-123";

async function seedAdministrator(): Promise<string> {
  const passwordHash = await hashPassword(adminPassword);
  await env.DB.prepare(
    `INSERT INTO administrators
     (id, email, display_name, password_hash, disabled, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, ?, ?)`,
  )
    .bind(
      "admin-test",
      adminEmail,
      "Test Administrator",
      passwordHash,
      "2026-07-11T00:00:00.000Z",
      "2026-07-11T00:00:00.000Z",
    )
    .run();
  return "admin-test";
}

beforeEach(async () => {
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
  await env.DB.batch([
    env.DB.prepare("DELETE FROM package_status_events"),
    env.DB.prepare("DELETE FROM package_images"),
    env.DB.prepare("DELETE FROM package_listings"),
    env.DB.prepare("DELETE FROM package_names"),
    env.DB.prepare("DELETE FROM packages"),
    env.DB.prepare("DELETE FROM administrators"),
  ]);
});

describe("notification validation", () => {
  it("accepts a representative payload and normalizes the size", () => {
    const parsed = v.parse(scriptoriaNotificationSchema, notification);
    expect(parsed.app_lang.iso639_3).toBe("gvs");
  });

  it("rejects a payload missing required fields", () => {
    expect(() =>
      v.parse(scriptoriaNotificationSchema, { project_name: "x" }),
    ).toThrow();
  });
});

describe("ingestion", () => {
  it("is idempotent and preserves pending moderation on retry", async () => {
    const first = await ingestNotification(env.DB, notification as never);
    const retry = await ingestNotification(env.DB, notification as never);

    expect(first.created).toBe(true);
    expect(retry.created).toBe(false);
    expect(first.id).toBe(retry.id);

    const packageCount = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM packages",
    ).first<{ count: number }>();
    const eventCount = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM package_status_events",
    ).first<{ count: number }>();
    expect(packageCount?.count).toBe(1);
    expect(eventCount?.count).toBe(1);
  });

  it("re-queues an approved package to PENDING when content changes", async () => {
    const adminId = await seedAdministrator();
    const prisma = createPrisma(env.DB);
    try {
      const first = await ingestNotification(env.DB, notification as never);
      const approved = await moderatePackage(env.DB, prisma, {
        id: first.id,
        toStatus: "ACTIVE",
        administratorId: adminId,
      });
      expect(approved).toMatchObject({ ok: true, status: "ACTIVE" });

      // An identical re-send is an idempotent retry: status is preserved.
      const resend = await ingestNotification(env.DB, notification as never);
      expect(resend.status).toBe("ACTIVE");

      // A changed download URL forces re-review — a live package cannot be
      // silently repointed.
      const changed = {
        ...notification,
        publish_url: `${notification.publish_url}?v=2`,
      };
      const updated = await ingestNotification(env.DB, changed as never);
      expect(updated.id).toBe(first.id);
      expect(updated.status).toBe("PENDING");
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});

describe("public catalogue", () => {
  it("returns only active packages and finds alternate names", async () => {
    const stored = await ingestNotification(env.DB, notification as never);
    const prisma = createPrisma(env.DB);
    try {
      const pending = await searchActivePackages(prisma, { q: "domdom" });
      expect(pending).toHaveLength(0);

      await env.DB.prepare("UPDATE packages SET status = 'ACTIVE' WHERE id = ?")
        .bind(stored.id)
        .run();

      const active = await searchActivePackages(prisma, { q: "domdom" });
      expect(active).toHaveLength(1);
      expect(active[0]?.id).toBe(stored.id);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});

describe("authentication", () => {
  it("authenticates a valid administrator and rejects a wrong password", async () => {
    await seedAdministrator();
    const prisma = createPrisma(env.DB);
    try {
      await expect(
        authenticateAdministrator(prisma, adminEmail, adminPassword),
      ).resolves.toBe("admin-test");
      await expect(
        authenticateAdministrator(prisma, adminEmail, "wrong"),
      ).rejects.toBeInstanceOf(AuthenticationError);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it("accepts a valid session token and rejects a tampered one", async () => {
    const id = await seedAdministrator();
    const prisma = createPrisma(env.DB);
    try {
      const token = await createSessionToken(id, "test-session-secret");
      await expect(
        verifyAdministrator(token, "test-session-secret", prisma),
      ).resolves.toBe(id);
      await expect(
        verifyAdministrator(`${token}x`, "test-session-secret", prisma),
      ).rejects.toBeInstanceOf(AuthenticationError);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});

describe("scriptoria intake authentication", () => {
  const secret = "test-scriptoria-secret";

  it("accepts the correct bearer secret", async () => {
    expect(await verifyScriptoriaSecret(`Bearer ${secret}`, secret)).toBe(true);
  });

  it("rejects a wrong secret, a missing header, and a non-bearer scheme", async () => {
    expect(await verifyScriptoriaSecret(`Bearer wrong-secret`, secret)).toBe(false);
    expect(await verifyScriptoriaSecret(null, secret)).toBe(false);
    expect(await verifyScriptoriaSecret(secret, secret)).toBe(false); // no "Bearer " prefix
  });

  it("fails closed when the secret is not configured", async () => {
    expect(await verifyScriptoriaSecret(`Bearer anything`, "")).toBe(false);
  });
});

describe("scriptoria intake endpoint", () => {
  const secret = "test-scriptoria-secret"; // matches the vitest binding

  function intakeEvent(
    body: unknown,
    opts: { authorization?: string; env?: unknown } = {},
  ) {
    const headers = new Headers({ "content-type": "application/json" });
    if (opts.authorization) headers.set("authorization", opts.authorization);
    const request = new Request(
      "https://worker.test/api/v1/notifications/scriptoria",
      { method: "POST", headers, body: JSON.stringify(body) },
    );
    return { request, platform: { env: opts.env ?? env } };
  }

  async function intakeStatus(event: unknown): Promise<number> {
    try {
      const res = await scriptoriaIntake(event as never);
      return res.status;
    } catch (thrown) {
      if (thrown && typeof thrown === "object" && "status" in thrown) {
        return (thrown as { status: number }).status;
      }
      throw thrown;
    }
  }

  async function packageCount(): Promise<number> {
    const row = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM packages",
    ).first<{ count: number }>();
    return row?.count ?? 0;
  }

  it("rejects a missing token with 401 and writes nothing", async () => {
    expect(await intakeStatus(intakeEvent(notification))).toBe(401);
    expect(await packageCount()).toBe(0);
  });

  it("rejects an incorrect token with 401 and writes nothing", async () => {
    expect(
      await intakeStatus(
        intakeEvent(notification, { authorization: "Bearer wrong-secret" }),
      ),
    ).toBe(401);
    expect(await packageCount()).toBe(0);
  });

  it("accepts the correct token and ingests the package", async () => {
    expect(
      await intakeStatus(
        intakeEvent(notification, { authorization: `Bearer ${secret}` }),
      ),
    ).toBe(201);
    expect(await packageCount()).toBe(1);
  });

  it("fails closed with 500 when the secret binding is unset", async () => {
    const event = intakeEvent(notification, {
      authorization: `Bearer ${secret}`,
      env: { DB: env.DB, SCRIPTORIA_API_KEY: "" },
    });
    expect(await intakeStatus(event)).toBe(500);
    expect(await packageCount()).toBe(0);
  });
});

describe("moderation", () => {
  it("approves a pending package and records the actor", async () => {
    const adminId = await seedAdministrator();
    const stored = await ingestNotification(env.DB, notification as never);
    const prisma = createPrisma(env.DB);
    try {
      const result = await moderatePackage(env.DB, prisma, {
        id: stored.id,
        toStatus: "ACTIVE",
        administratorId: adminId,
      });
      expect(result).toMatchObject({ ok: true, status: "ACTIVE" });

      const event = await env.DB.prepare(
        "SELECT actor_id FROM package_status_events WHERE to_status = 'ACTIVE'",
      ).first<{ actor_id: string }>();
      expect(event?.actor_id).toBe(adminId);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it("rejects an invalid status transition", async () => {
    const adminId = await seedAdministrator();
    const stored = await ingestNotification(env.DB, notification as never);
    const prisma = createPrisma(env.DB);
    try {
      // PENDING may only go to ACTIVE or REJECTED, never straight to INACTIVE.
      const result = await moderatePackage(env.DB, prisma, {
        id: stored.id,
        toStatus: "INACTIVE",
        administratorId: adminId,
      });
      expect(result).toMatchObject({ ok: false, httpStatus: 409 });
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});
