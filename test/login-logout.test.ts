import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { sessionCookieName } from '../src/lib/server/auth';
import { actions as loginActions, load as loadLogin } from '../src/routes/login/+page.server';
import { POST as logout } from '../src/routes/logout/+server';
import { adminEmail, adminPassword, seedAdministrator } from './fixtures';

type LoginLoadData = { form: { valid: boolean }; isLocal: boolean };

async function statusOf(value: unknown): Promise<number | undefined> {
  try {
    const res = (await value) as { status: number };
    return res.status;
  } catch (thrown) {
    return (thrown as { status: number }).status;
  }
}

function fakeCookies() {
  const set: Array<{ name: string; value: string }> = [];
  const deleted: string[] = [];
  return {
    set,
    deleted,
    cookies: {
      get: () => undefined,
      set: (name: string, value: string) => {
        set.push({ name, value });
      },
      delete: (name: string) => {
        deleted.push(name);
      }
    }
  };
}

describe('login page load', () => {
  it('redirects to /admin when already authenticated', async () => {
    const event = { locals: { administratorId: 'admin-test' }, platform: { env } };
    expect(await statusOf(loadLogin(event as never))).toBe(302);
  });

  it('returns an empty form when unauthenticated', async () => {
    const event = { locals: { administratorId: null }, platform: { env } };
    const result = (await loadLogin(event as never)) as LoginLoadData;
    expect(result.form.valid).toBe(false);
    expect(result.isLocal).toBe(false);
  });
});

describe('login action', () => {
  function loginEvent(fields: Record<string, string>) {
    const data = new FormData();
    for (const [key, value] of Object.entries(fields)) data.set(key, value);
    const { cookies, set } = fakeCookies();
    return {
      request: new Request('https://worker.test/login', { method: 'POST', body: data }),
      cookies,
      platform: { env },
      __set: set
    };
  }

  it('fails with 400 on an invalid submission', async () => {
    const event = loginEvent({ email: 'not-an-email', password: '' });
    const result = await loginActions.default(event as never);
    expect(result).toMatchObject({ status: 400 });
  });

  it('rejects incorrect credentials with a 401 form message', async () => {
    await seedAdministrator();
    const event = loginEvent({ email: adminEmail, password: 'wrong-password' });
    const result = (await loginActions.default(event as never)) as {
      status: number;
      data: { message?: unknown };
    };
    expect(result.status).toBe(401);
  });

  it('sets a session cookie and redirects to /admin on success', async () => {
    await seedAdministrator();
    const event = loginEvent({ email: adminEmail, password: adminPassword });
    expect(await statusOf(loginActions.default(event as never))).toBe(303);
    expect(event.__set).toHaveLength(1);
    expect(event.__set[0]?.name).toBe(sessionCookieName);
  });
});

describe('logout', () => {
  it('clears the session cookie and redirects to /login', async () => {
    const { cookies, deleted } = fakeCookies();
    const event = { cookies };
    expect(await statusOf(logout(event as never))).toBe(303);
    expect(deleted).toEqual([sessionCookieName]);
  });
});
