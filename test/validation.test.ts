import * as v from 'valibot';
import { describe, expect, it } from 'vitest';
import {
  credentialsSchema,
  moderationActionSchema,
  moderationSchema,
  searchSchema
} from '../src/lib/validation';

describe('credentialsSchema', () => {
  it('accepts a valid email/password and trims the email', () => {
    const parsed = v.parse(credentialsSchema, {
      email: '  admin@example.com  ',
      password: 'secret'
    });
    expect(parsed.email).toBe('admin@example.com');
    expect(parsed.password).toBe('secret');
  });

  it('rejects a malformed email', () => {
    expect(() =>
      v.parse(credentialsSchema, { email: 'not-an-email', password: 'secret' })
    ).toThrow();
  });

  it('rejects an empty password', () => {
    expect(() =>
      v.parse(credentialsSchema, { email: 'admin@example.com', password: '' })
    ).toThrow();
  });

  it('rejects an email over 320 characters', () => {
    const longEmail = `${'a'.repeat(310)}@example.com`;
    expect(() => v.parse(credentialsSchema, { email: longEmail, password: 'secret' })).toThrow();
  });
});

describe('moderationSchema', () => {
  it('accepts a status with no reason', () => {
    const parsed = v.parse(moderationSchema, { status: 'ACTIVE' });
    expect(parsed).toEqual({ status: 'ACTIVE', reason: undefined });
  });

  it('accepts a status with a trimmed reason', () => {
    const parsed = v.parse(moderationSchema, {
      status: 'REJECTED',
      reason: '  not appropriate  '
    });
    expect(parsed.reason).toBe('not appropriate');
  });

  it('rejects a status outside the known package statuses', () => {
    expect(() => v.parse(moderationSchema, { status: 'DELETED' })).toThrow();
  });

  it('rejects a reason that is empty after trimming', () => {
    expect(() => v.parse(moderationSchema, { status: 'REJECTED', reason: '   ' })).toThrow();
  });
});

describe('moderationActionSchema', () => {
  it('accepts an id, status, and optional reason', () => {
    const parsed = v.parse(moderationActionSchema, { id: 'pkg-1', status: 'ACTIVE' });
    expect(parsed).toMatchObject({ id: 'pkg-1', status: 'ACTIVE' });
  });

  it('rejects a missing id', () => {
    expect(() => v.parse(moderationActionSchema, { status: 'ACTIVE' })).toThrow();
  });

  it('rejects an empty id', () => {
    expect(() => v.parse(moderationActionSchema, { id: '', status: 'ACTIVE' })).toThrow();
  });
});

describe('searchSchema', () => {
  it('defaults the limit to 25 when omitted', () => {
    const parsed = v.parse(searchSchema, {});
    expect(parsed.limit).toBe(25);
    expect(parsed.q).toBeUndefined();
  });

  it('trims the query string', () => {
    const parsed = v.parse(searchSchema, { q: '  gumawana  ' });
    expect(parsed.q).toBe('gumawana');
  });

  it('coerces a string limit to a number', () => {
    const parsed = v.parse(searchSchema, { limit: '50' });
    expect(parsed.limit).toBe(50);
  });

  it('accepts the boundary values 1 and 100', () => {
    expect(v.parse(searchSchema, { limit: 1 }).limit).toBe(1);
    expect(v.parse(searchSchema, { limit: 100 }).limit).toBe(100);
  });

  it('rejects a limit below 1 or above 100', () => {
    expect(() => v.parse(searchSchema, { limit: 0 })).toThrow();
    expect(() => v.parse(searchSchema, { limit: 101 })).toThrow();
  });

  it('rejects a non-numeric limit', () => {
    expect(() => v.parse(searchSchema, { limit: 'abc' })).toThrow();
  });

  it('rejects a non-integer limit', () => {
    expect(() => v.parse(searchSchema, { limit: 3.5 })).toThrow();
  });

  it('rejects a query string over 200 characters', () => {
    expect(() => v.parse(searchSchema, { q: 'a'.repeat(201) })).toThrow();
  });
});
