import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { createPrisma } from '../src/lib/server/db';
import { getHeroBackgroundImage, setHeroBackgroundImage } from '../src/lib/server/settings';
import { load as adminLayoutLoad } from '../src/routes/admin/+layout.server';
import { actions as settingsActions } from '../src/routes/admin/settings/+page.server';
import { GET as heroBackground } from '../src/routes/hero-background/+server';
import { seedAdministrator } from './fixtures';

describe('hero background settings', () => {
  it('returns null when no background image has been set', async () => {
    const prisma = createPrisma(env.DB);
    try {
      expect(await getHeroBackgroundImage(prisma)).toBeNull();
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it('uploads a new image, records the key, and cleans up the previous object', async () => {
    const adminId = await seedAdministrator();
    const prisma = createPrisma(env.DB);
    try {
      const first = await setHeroBackgroundImage(env.DB, prisma, env.HERO_IMAGES, {
        file: new Blob(['first-image'], { type: 'image/png' }),
        contentType: 'image/png',
        administratorId: adminId
      });
      expect(await getHeroBackgroundImage(prisma)).toBe(first.key);
      expect(await env.HERO_IMAGES.get(first.key)).not.toBeNull();

      const second = await setHeroBackgroundImage(env.DB, prisma, env.HERO_IMAGES, {
        file: new Blob(['second-image'], { type: 'image/webp' }),
        contentType: 'image/webp',
        administratorId: adminId
      });
      expect(await getHeroBackgroundImage(prisma)).toBe(second.key);
      expect(await env.HERO_IMAGES.get(second.key)).not.toBeNull();
      expect(await env.HERO_IMAGES.get(first.key)).toBeNull();

      const setting = await env.DB.prepare('SELECT updated_by_id FROM site_settings WHERE id = ?')
        .bind('default')
        .first<{ updated_by_id: string }>();
      expect(setting?.updated_by_id).toBe(adminId);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});

describe('admin settings authorization', () => {
  it('redirects an unauthenticated visitor to /login instead of loading /admin/settings', async () => {
    try {
      await adminLayoutLoad({
        locals: { administratorId: null },
        platform: { env }
      } as never);
      expect.unreachable('expected a thrown redirect');
    } catch (thrown) {
      expect((thrown as { status: number; location: string }).status).toBe(302);
      expect((thrown as { status: number; location: string }).location).toBe('/login');
    }
  });

  it('rejects an unauthenticated hero-image upload without touching storage', async () => {
    const result = await settingsActions.default({
      locals: { administratorId: null },
      request: new Request('https://worker.test/admin/settings', { method: 'POST' })
    } as never);

    expect(result).toMatchObject({ status: 401 });

    const prisma = createPrisma(env.DB);
    try {
      expect(await getHeroBackgroundImage(prisma)).toBeNull();
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});

describe('GET /hero-background', () => {
  function requestEvent() {
    return {
      request: new Request('https://worker.test/hero-background'),
      platform: { env }
    };
  }

  it('404s when no background image has been set', async () => {
    try {
      await heroBackground(requestEvent() as never);
      expect.unreachable('expected a thrown 404');
    } catch (thrown) {
      expect((thrown as { status: number }).status).toBe(404);
    }
  });

  it('streams the current image with cache headers', async () => {
    const adminId = await seedAdministrator();
    const prisma = createPrisma(env.DB);
    try {
      await setHeroBackgroundImage(env.DB, prisma, env.HERO_IMAGES, {
        file: new Blob(['image-bytes'], { type: 'image/jpeg' }),
        contentType: 'image/jpeg',
        administratorId: adminId
      });
    } finally {
      await prisma.$disconnect().catch(() => {});
    }

    const response = await heroBackground(requestEvent() as never);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/jpeg');
    expect(response.headers.get('cache-control')).toContain('max-age');
    expect(await response.text()).toBe('image-bytes');
  });
});
