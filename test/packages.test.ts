import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { createPrisma } from '../src/lib/server/db';
import { ingestNotification } from '../src/lib/server/notification';
import { moderatePackage, searchActivePackages } from '../src/lib/server/packages';
import { notification, seedAdministrator } from './fixtures';

describe('public catalogue', () => {
  it('returns only active packages and finds alternate names', async () => {
    const stored = await ingestNotification(env.DB, notification as never);
    const prisma = createPrisma(env.DB);
    try {
      const pending = await searchActivePackages(prisma, { q: 'domdom' });
      expect(pending).toHaveLength(0);

      await env.DB.prepare("UPDATE packages SET status = 'ACTIVE' WHERE id = ?")
        .bind(stored.id)
        .run();

      const active = await searchActivePackages(prisma, { q: 'domdom' });
      expect(active).toHaveLength(1);
      expect(active[0]?.id).toBe(stored.id);

      const byCountryName = await searchActivePackages(prisma, { q: 'papua new guinea' });
      expect(byCountryName).toHaveLength(1);
      expect(byCountryName[0]?.id).toBe(stored.id);

      const byCountryCode = await searchActivePackages(prisma, { q: 'pg' });
      expect(byCountryCode).toHaveLength(1);
      expect(byCountryCode[0]?.id).toBe(stored.id);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});

describe('moderation', () => {
  it('approves a pending package and records the actor', async () => {
    const adminId = await seedAdministrator();
    const stored = await ingestNotification(env.DB, notification as never);
    const prisma = createPrisma(env.DB);
    try {
      const result = await moderatePackage(env.DB, prisma, {
        id: stored.id,
        toStatus: 'ACTIVE',
        administratorId: adminId
      });
      expect(result).toMatchObject({ ok: true, status: 'ACTIVE' });

      const event = await env.DB.prepare(
        "SELECT actor_id FROM package_status_events WHERE to_status = 'ACTIVE'"
      ).first<{ actor_id: string }>();
      expect(event?.actor_id).toBe(adminId);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it('rejects an invalid status transition', async () => {
    const adminId = await seedAdministrator();
    const stored = await ingestNotification(env.DB, notification as never);
    const prisma = createPrisma(env.DB);
    try {
      // PENDING may only go to ACTIVE or REJECTED, never straight to INACTIVE.
      const result = await moderatePackage(env.DB, prisma, {
        id: stored.id,
        toStatus: 'INACTIVE',
        administratorId: adminId
      });
      expect(result).toMatchObject({ ok: false, httpStatus: 409 });
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});
