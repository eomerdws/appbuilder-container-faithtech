import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { ingestNotification } from '../src/lib/server/notification';
import { load as loadAdminLayout } from '../src/routes/admin/+layout.server';
import { actions as adminActions, load as loadAdminPage } from '../src/routes/admin/+page.server';
import { notification, seedAdministrator } from './fixtures';

type LayoutData = { administratorId: string; counts: Record<string, number> };
type DashboardData = { selected: string; packages: Array<{ id: string }> };

async function statusOf(value: unknown): Promise<number | undefined> {
  try {
    const res = (await value) as { status: number };
    return res.status;
  } catch (thrown) {
    return (thrown as { status: number }).status;
  }
}

describe('admin layout guard', () => {
  it('redirects to /login when there is no administrator session', async () => {
    const event = { locals: { administratorId: null }, platform: { env } };
    expect(await statusOf(loadAdminLayout(event as never))).toBe(302);
  });

  it('returns the administrator id and per-status package counts', async () => {
    const adminId = await seedAdministrator();
    await ingestNotification(env.DB, notification as never); // one PENDING package

    const event = { locals: { administratorId: adminId }, platform: { env } };
    const result = (await loadAdminLayout(event as never)) as LayoutData;

    expect(result.administratorId).toBe(adminId);
    expect(result.counts).toMatchObject({
      PENDING: 1,
      ACTIVE: 0,
      REJECTED: 0,
      INACTIVE: 0
    });
  });
});

describe('admin dashboard load', () => {
  function loadEvent(url: string) {
    return { url: new URL(url), platform: { env } };
  }

  it('defaults to PENDING packages', async () => {
    const stored = await ingestNotification(env.DB, notification as never);
    const result = (await loadAdminPage(
      loadEvent('https://worker.test/admin') as never
    )) as DashboardData;
    expect(result.selected).toBe('PENDING');
    expect(result.packages.map((p) => p.id)).toEqual([stored.id]);
  });

  it('filters by the requested status', async () => {
    await ingestNotification(env.DB, notification as never);
    const result = (await loadAdminPage(
      loadEvent('https://worker.test/admin?status=ACTIVE') as never
    )) as DashboardData;
    expect(result.selected).toBe('ACTIVE');
    expect(result.packages).toHaveLength(0);
  });
});

describe('admin moderate action', () => {
  function moderateEvent(
    body: Record<string, string>,
    opts: { administratorId?: string | null } = {}
  ) {
    const data = new URLSearchParams(body);
    return {
      locals: { administratorId: opts.administratorId ?? null },
      request: new Request('https://worker.test/admin?/moderate', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: data
      }),
      platform: { env }
    };
  }

  it('redirects to /login when there is no administrator session', async () => {
    const stored = await ingestNotification(env.DB, notification as never);
    expect(
      await statusOf(
        adminActions.moderate(moderateEvent({ id: stored.id, status: 'ACTIVE' }) as never)
      )
    ).toBe(302);
  });

  it('fails with 400 on an invalid submission', async () => {
    const adminId = await seedAdministrator();
    const result = await adminActions.moderate(
      moderateEvent({ id: '', status: 'ACTIVE' }, { administratorId: adminId }) as never
    );
    expect(result).toMatchObject({ status: 400 });
  });

  it('approves a pending package and returns a success message', async () => {
    const adminId = await seedAdministrator();
    const stored = await ingestNotification(env.DB, notification as never);

    const result = await adminActions.moderate(
      moderateEvent({ id: stored.id, status: 'ACTIVE' }, { administratorId: adminId }) as never
    );
    expect(result).toMatchObject({ success: true });

    const row = await env.DB.prepare('SELECT status FROM packages WHERE id = ?')
      .bind(stored.id)
      .first<{ status: string }>();
    expect(row?.status).toBe('ACTIVE');
  });

  it('surfaces a moderation failure (e.g. an invalid transition) via fail()', async () => {
    const adminId = await seedAdministrator();
    const stored = await ingestNotification(env.DB, notification as never);

    const result = await adminActions.moderate(
      moderateEvent({ id: stored.id, status: 'INACTIVE' }, { administratorId: adminId }) as never
    );
    expect(result).toMatchObject({ status: 409 });
  });
});
