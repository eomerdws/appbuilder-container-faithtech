import type { Handle } from '@sveltejs/kit';
import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { handle } from '../src/hooks.server';
import { createSessionToken, sessionCookieName } from '../src/lib/server/auth';
import { seedAdministrator } from './fixtures';

type FakeEvent = Parameters<Handle>[0]['event'];

function fakeEvent(
  opts: {
    requestIdHeader?: string;
    cookie?: string;
    platform?: unknown;
  } = {}
): FakeEvent {
  const headers = new Headers();
  if (opts.requestIdHeader) headers.set('x-request-id', opts.requestIdHeader);

  return {
    request: new Request('https://worker.test/', { headers }),
    cookies: {
      get: (name: string) => (name === sessionCookieName ? opts.cookie : undefined)
    },
    platform: opts.platform,
    locals: {}
  } as unknown as FakeEvent;
}

const resolve = async () =>
  new Response('sentinel-body', { status: 234, headers: { 'x-sentinel': 'yes' } });

describe('request id', () => {
  it('generates a request id when the header is absent', async () => {
    const event = fakeEvent();
    const response = await handle({ event, resolve });

    expect(event.locals.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
    expect(response.headers.get('x-request-id')).toBe(event.locals.requestId);
  });

  it('echoes an incoming request id instead of generating one', async () => {
    const event = fakeEvent({ requestIdHeader: 'client-supplied-id' });
    const response = await handle({ event, resolve });

    expect(event.locals.requestId).toBe('client-supplied-id');
    expect(response.headers.get('x-request-id')).toBe('client-supplied-id');
  });
});

describe('response passthrough', () => {
  it('preserves status, body, and other headers from resolve()', async () => {
    const response = await handle({ event: fakeEvent(), resolve });

    expect(response.status).toBe(234);
    expect(response.headers.get('x-sentinel')).toBe('yes');
    expect(await response.text()).toBe('sentinel-body');
  });
});

describe('administrator session resolution', () => {
  it('stays unauthenticated when there is no session cookie', async () => {
    const event = fakeEvent({ platform: { env } });
    await handle({ event, resolve });

    expect(event.locals.administratorId).toBeNull();
  });

  it('stays unauthenticated when platform is unavailable, even with a valid cookie', async () => {
    const id = await seedAdministrator();
    const token = await createSessionToken(id, env.SESSION_SECRET);
    const event = fakeEvent({ cookie: token });

    await handle({ event, resolve });

    expect(event.locals.administratorId).toBeNull();
  });

  it('resolves the administrator id for a valid session cookie', async () => {
    const id = await seedAdministrator();
    const token = await createSessionToken(id, env.SESSION_SECRET);
    const event = fakeEvent({ cookie: token, platform: { env } });

    await handle({ event, resolve });

    expect(event.locals.administratorId).toBe(id);
  });

  it('fails closed (stays unauthenticated) for a tampered session cookie', async () => {
    const id = await seedAdministrator();
    const token = await createSessionToken(id, env.SESSION_SECRET);
    const event = fakeEvent({ cookie: `${token}x`, platform: { env } });

    await handle({ event, resolve });

    expect(event.locals.administratorId).toBeNull();
  });
});
