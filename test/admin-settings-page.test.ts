import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { createPrisma } from '../src/lib/server/db';
import { setHeroBackgroundImage } from '../src/lib/server/settings';
import {
  actions as settingsActions,
  load as loadSettings
} from '../src/routes/admin/settings/+page.server';
import { seedAdministrator } from './fixtures';

type SettingsData = { heroBackgroundImageKey: string | null };

describe('admin settings load', () => {
  it('returns null when no hero image has been set', async () => {
    const result = (await loadSettings({ platform: { env } } as never)) as SettingsData;
    expect(result.heroBackgroundImageKey).toBeNull();
  });

  it('returns the current hero image key', async () => {
    const adminId = await seedAdministrator();
    const prisma = createPrisma(env.DB);
    let key: string;
    try {
      const stored = await setHeroBackgroundImage(env.DB, prisma, env.HERO_IMAGES, {
        file: new Blob(['bytes'], { type: 'image/png' }),
        contentType: 'image/png',
        administratorId: adminId
      });
      key = stored.key;
    } finally {
      await prisma.$disconnect().catch(() => {});
    }

    const result = (await loadSettings({ platform: { env } } as never)) as SettingsData;
    expect(result.heroBackgroundImageKey).toBe(key);
  });
});

describe('admin settings upload action', () => {
  function uploadEvent(file: File | null, opts: { administratorId?: string | null } = {}) {
    const data = new FormData();
    if (file) data.set('heroImage', file);
    return {
      locals: { administratorId: opts.administratorId ?? null },
      request: new Request('https://worker.test/admin/settings', { method: 'POST', body: data }),
      platform: { env }
    };
  }

  it('rejects an unauthenticated request with 401', async () => {
    const file = new File(['bytes'], 'hero.png', { type: 'image/png' });
    const result = await settingsActions.default(uploadEvent(file) as never);
    expect(result).toMatchObject({ status: 401 });
  });

  it('rejects a missing file with 400', async () => {
    const adminId = await seedAdministrator();
    const result = await settingsActions.default(
      uploadEvent(null, { administratorId: adminId }) as never
    );
    expect(result).toMatchObject({ status: 400 });
  });

  it('rejects an unsupported file type with 400', async () => {
    const adminId = await seedAdministrator();
    const file = new File(['not-an-image'], 'hero.txt', { type: 'text/plain' });
    const result = await settingsActions.default(
      uploadEvent(file, { administratorId: adminId }) as never
    );
    expect(result).toMatchObject({ status: 400 });
  });

  it('stores a valid upload and returns a success message', async () => {
    const adminId = await seedAdministrator();
    const file = new File(['bytes'], 'hero.png', { type: 'image/png' });
    const result = await settingsActions.default(
      uploadEvent(file, { administratorId: adminId }) as never
    );
    expect(result).toMatchObject({ success: true });

    const setting = await env.DB.prepare('SELECT updated_by_id FROM site_settings WHERE id = ?')
      .bind('default')
      .first<{ updated_by_id: string }>();
    expect(setting?.updated_by_id).toBe(adminId);
  });
});
