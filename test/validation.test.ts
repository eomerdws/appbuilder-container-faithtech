import * as v from 'valibot';
import { describe, expect, it } from 'vitest';
import {
  credentialsSchema,
  heroImageMaxBytes,
  heroImageUploadSchema,
  moderationActionSchema,
  moderationSchema,
  searchSchema,
  themeSettingsSchema
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

describe('heroImageUploadSchema', () => {
  it('accepts an allowed MIME type under the size limit', () => {
    const file = new File(['image-bytes'], 'hero.png', { type: 'image/png' });
    expect(v.parse(heroImageUploadSchema, file)).toBe(file);
  });

  it('rejects a disallowed MIME type', () => {
    const file = new File(['not-an-image'], 'hero.gif', { type: 'image/gif' });
    expect(() => v.parse(heroImageUploadSchema, file)).toThrow();
  });

  it('rejects a file over the size limit', () => {
    const file = new File([new Uint8Array(heroImageMaxBytes + 1)], 'hero.png', {
      type: 'image/png'
    });
    expect(() => v.parse(heroImageUploadSchema, file)).toThrow();
  });

  it('rejects a non-file value', () => {
    expect(() => v.parse(heroImageUploadSchema, 'not-a-file')).toThrow();
  });
});

describe('themeSettingsSchema', () => {
  const validColors = {
    themeButtonColor: '#336699',
    themeRowColor: '#000000',
    themeBackgroundColor: '#ffffff',
    themeTextColor: '#abcdef',
    themeIconColor: '#123456'
  };

  it('accepts valid 6-digit hex colors for every field', () => {
    expect(v.parse(themeSettingsSchema, validColors)).toEqual(validColors);
  });

  it('trims whitespace around a hex color', () => {
    const parsed = v.parse(themeSettingsSchema, {
      ...validColors,
      themeButtonColor: '  #336699  '
    });
    expect(parsed.themeButtonColor).toBe('#336699');
  });

  it('accepts a blank string, to be treated as clearing the field', () => {
    const parsed = v.parse(themeSettingsSchema, { ...validColors, themeButtonColor: '' });
    expect(parsed.themeButtonColor).toBe('');
  });

  it('rejects a color missing the leading #', () => {
    expect(() =>
      v.parse(themeSettingsSchema, { ...validColors, themeButtonColor: '336699' })
    ).toThrow();
  });

  it('accepts a 3-digit shorthand hex color', () => {
    const parsed = v.parse(themeSettingsSchema, { ...validColors, themeRowColor: '#369' });
    expect(parsed.themeRowColor).toBe('#369');
  });

  it('rejects a shorthand-length value with a non-hex character', () => {
    expect(() => v.parse(themeSettingsSchema, { ...validColors, themeRowColor: '#3g9' })).toThrow();
  });

  it('rejects a hex color of an unsupported length (4 or 5 digits)', () => {
    expect(() =>
      v.parse(themeSettingsSchema, { ...validColors, themeRowColor: '#3690' })
    ).toThrow();
  });

  it('rejects a non-hex value', () => {
    expect(() =>
      v.parse(themeSettingsSchema, { ...validColors, themeTextColor: 'not-a-color' })
    ).toThrow();
  });

  it('rejects an out-of-range hex character', () => {
    expect(() =>
      v.parse(themeSettingsSchema, { ...validColors, themeIconColor: '#gggggg' })
    ).toThrow();
  });
});
