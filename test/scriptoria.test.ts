import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { verifyScriptoriaSecret } from '../src/lib/server/auth';
import { POST as scriptoriaIntake } from '../src/routes/api/v1/notifications/scriptoria/+server';
import { notification } from './fixtures';

describe('scriptoria intake authentication', () => {
  const secret = 'test-scriptoria-secret';

  it('accepts the correct bearer secret', async () => {
    expect(await verifyScriptoriaSecret(`Bearer ${secret}`, secret)).toBe(true);
  });

  it('rejects a wrong secret, a missing header, and a non-bearer scheme', async () => {
    expect(await verifyScriptoriaSecret(`Bearer wrong-secret`, secret)).toBe(false);
    expect(await verifyScriptoriaSecret(null, secret)).toBe(false);
    expect(await verifyScriptoriaSecret(secret, secret)).toBe(false); // no "Bearer " prefix
  });

  it('fails closed when the secret is not configured', async () => {
    expect(await verifyScriptoriaSecret(`Bearer anything`, '')).toBe(false);
  });
});

describe('scriptoria intake endpoint', () => {
  const secret = 'test-scriptoria-secret'; // matches the vitest binding

  function intakeEvent(body: unknown, opts: { authorization?: string; env?: unknown } = {}) {
    const headers = new Headers({ 'content-type': 'application/json' });
    if (opts.authorization) headers.set('authorization', opts.authorization);
    const request = new Request('https://worker.test/api/v1/notifications/scriptoria', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    return { request, platform: { env: opts.env ?? env } };
  }

  async function intakeStatus(event: unknown): Promise<number> {
    try {
      const res = await scriptoriaIntake(event as never);
      return res.status;
    } catch (thrown) {
      if (thrown && typeof thrown === 'object' && 'status' in thrown) {
        return (thrown as { status: number }).status;
      }
      throw thrown;
    }
  }

  async function packageCount(): Promise<number> {
    const row = await env.DB.prepare('SELECT COUNT(*) AS count FROM packages').first<{
      count: number;
    }>();
    return row?.count ?? 0;
  }

  it('rejects a missing token with 401 and writes nothing', async () => {
    expect(await intakeStatus(intakeEvent(notification))).toBe(401);
    expect(await packageCount()).toBe(0);
  });

  it('rejects an incorrect token with 401 and writes nothing', async () => {
    expect(
      await intakeStatus(intakeEvent(notification, { authorization: 'Bearer wrong-secret' }))
    ).toBe(401);
    expect(await packageCount()).toBe(0);
  });

  it('accepts the correct token and ingests the package', async () => {
    expect(
      await intakeStatus(intakeEvent(notification, { authorization: `Bearer ${secret}` }))
    ).toBe(201);
    expect(await packageCount()).toBe(1);
  });

  it('fails closed with 500 when the secret binding is unset', async () => {
    const event = intakeEvent(notification, {
      authorization: `Bearer ${secret}`,
      env: { DB: env.DB, SCRIPTORIA_API_KEY: '' }
    });
    expect(await intakeStatus(event)).toBe(500);
    expect(await packageCount()).toBe(0);
  });
});
