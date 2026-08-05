import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { requireEnv } from '../src/lib/server/platform';

describe('requireEnv', () => {
  it('returns the platform env when the platform is available', () => {
    const event = { platform: { env } };
    expect(requireEnv(event as never)).toBe(env);
  });

  it('throws a 503 when the platform is unavailable', () => {
    const event = { platform: undefined };
    try {
      requireEnv(event as never);
      expect.unreachable('expected a thrown 503');
    } catch (thrown) {
      expect((thrown as { status: number }).status).toBe(503);
    }
  });
});
