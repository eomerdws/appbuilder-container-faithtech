import { env } from 'cloudflare:test';
import * as v from 'valibot';
import { describe, expect, it } from 'vitest';
import { createPrisma } from '../src/lib/server/db';
import { ingestNotification, scriptoriaNotificationSchema } from '../src/lib/server/notification';
import { moderatePackage } from '../src/lib/server/packages';
import { notification, seedAdministrator } from './fixtures';

describe('notification validation', () => {
  it('accepts a representative payload and normalizes the size', () => {
    const parsed = v.parse(scriptoriaNotificationSchema, notification);
    expect(parsed.app_lang.iso639_3).toBe('gvs');
  });

  it('rejects a payload missing required fields', () => {
    expect(() => v.parse(scriptoriaNotificationSchema, { project_name: 'x' })).toThrow();
  });

  it('rejects a non-http(s) URL scheme', () => {
    const bad = { ...notification, project_url: 'ftp://example.com/project' };
    expect(() => v.parse(scriptoriaNotificationSchema, bad)).toThrow();
  });
});

describe('ingestion', () => {
  it('is idempotent and preserves pending moderation on retry', async () => {
    const first = await ingestNotification(env.DB, notification as never);
    const retry = await ingestNotification(env.DB, notification as never);

    expect(first.created).toBe(true);
    expect(retry.created).toBe(false);
    expect(first.id).toBe(retry.id);

    const packageCount = await env.DB.prepare('SELECT COUNT(*) AS count FROM packages').first<{
      count: number;
    }>();
    const eventCount = await env.DB.prepare(
      'SELECT COUNT(*) AS count FROM package_status_events'
    ).first<{ count: number }>();
    expect(packageCount?.count).toBe(1);
    expect(eventCount?.count).toBe(1);
  });

  it('re-queues an approved package to PENDING when content changes', async () => {
    const adminId = await seedAdministrator();
    const prisma = createPrisma(env.DB);
    try {
      const first = await ingestNotification(env.DB, notification as never);
      const approved = await moderatePackage(env.DB, prisma, {
        id: first.id,
        toStatus: 'ACTIVE',
        administratorId: adminId
      });
      expect(approved).toMatchObject({ ok: true, status: 'ACTIVE' });

      // An identical re-send is an idempotent retry: status is preserved.
      const resend = await ingestNotification(env.DB, notification as never);
      expect(resend.status).toBe('ACTIVE');

      // A changed download URL forces re-review — a live package cannot be
      // silently repointed.
      const changed = {
        ...notification,
        publish_url: `${notification.publish_url}?v=2`
      };
      const updated = await ingestNotification(env.DB, changed as never);
      expect(updated.id).toBe(first.id);
      expect(updated.status).toBe('PENDING');
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});

describe('ingestion failures', () => {
  // `size` accepts any string at the schema layer (see scriptoriaNotificationSchema);
  // it's ingestNotification's internal sizeBytes() that enforces it's an integer.
  it('rejects a size that is not a plain integer string', async () => {
    const bad = { ...notification, size: 'not-a-number' };
    await expect(ingestNotification(env.DB, bad as never)).rejects.toThrow(
      'size must contain a non-negative integer byte count'
    );

    const packageCount = await env.DB.prepare('SELECT COUNT(*) AS count FROM packages').first<{
      count: number;
    }>();
    expect(packageCount?.count).toBe(0);
  });

  it('rejects a size exceeding the supported package size', async () => {
    const bad = { ...notification, size: '9999999999' };
    await expect(ingestNotification(env.DB, bad as never)).rejects.toThrow(
      'size exceeds the supported package size'
    );

    const packageCount = await env.DB.prepare('SELECT COUNT(*) AS count FROM packages').first<{
      count: number;
    }>();
    expect(packageCount?.count).toBe(0);
  });

  // Similarly, permalink_url only needs to be a valid http(s) URL at the schema
  // layer; ingestNotification's internal productId() enforces the UUID it relies
  // on as the idempotency key.
  it('rejects a permalink_url without a product UUID', async () => {
    const bad = {
      ...notification,
      permalink_url:
        'https://app.scriptoria.io/api/products/not-a-uuid/files/published/asset-package'
    };
    await expect(ingestNotification(env.DB, bad as never)).rejects.toThrow(
      'permalink_url does not contain a valid product UUID'
    );

    const packageCount = await env.DB.prepare('SELECT COUNT(*) AS count FROM packages').first<{
      count: number;
    }>();
    expect(packageCount?.count).toBe(0);
  });
});
