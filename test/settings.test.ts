import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { createPrisma } from '../src/lib/server/db';
import {
  getCustomHeroImage,
  getSiteSettings,
  setCustomHeroImage,
  setHeroBackgroundImage,
  setSiteTitle,
  setThemeSettings
} from '../src/lib/server/settings';
import { load as adminLayoutLoad } from '../src/routes/admin/+layout.server';
import { actions as settingsActions } from '../src/routes/admin/settings/+page.server';
import { GET as heroBackground } from '../src/routes/hero-background/+server';
import { seedAdministrator } from './fixtures';

function pngFile(name = 'hero.png', bytes: number[] = [137, 80, 78, 71]): File {
  return new File([new Uint8Array(bytes)], name, { type: 'image/png' });
}

describe('hero background image settings', () => {
  it('defaults to earth-asia when nothing has been set', async () => {
    const prisma = createPrisma(env.DB);
    try {
      expect((await getSiteSettings(prisma)).heroBackgroundImage).toBe('earth-asia');
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it('sets the hero background image, then changes it', async () => {
    const adminId = await seedAdministrator();
    const prisma = createPrisma(env.DB);
    try {
      await setHeroBackgroundImage(env.DB, prisma, {
        heroBackgroundImage: 'earth-americas',
        administratorId: adminId
      });
      expect((await getSiteSettings(prisma)).heroBackgroundImage).toBe('earth-americas');

      await setHeroBackgroundImage(env.DB, prisma, {
        heroBackgroundImage: 'earth-asia',
        administratorId: adminId
      });
      expect((await getSiteSettings(prisma)).heroBackgroundImage).toBe('earth-asia');

      const setting = await env.DB.prepare('SELECT updated_by_id FROM site_settings WHERE id = ?')
        .bind('default')
        .first<{ updated_by_id: string }>();
      expect(setting?.updated_by_id).toBe(adminId);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it('leaves the site title and theme untouched when only the hero image changes', async () => {
    const adminId = await seedAdministrator();
    const prisma = createPrisma(env.DB);
    try {
      await setSiteTitle(env.DB, prisma, {
        siteTitle: 'Custom Bible Apps',
        administratorId: adminId
      });
      await setThemeSettings(env.DB, prisma, { themeName: 'dracula', administratorId: adminId });

      await setHeroBackgroundImage(env.DB, prisma, {
        heroBackgroundImage: 'earth-americas',
        administratorId: adminId
      });

      const settings = await getSiteSettings(prisma);
      expect(settings.siteTitle).toBe('Custom Bible Apps');
      expect(settings.themeName).toBe('dracula');
      expect(settings.heroBackgroundImage).toBe('earth-americas');
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it('updateHeroImage action rejects a choice outside the bundled images', async () => {
    const adminId = await seedAdministrator();
    const data = new FormData();
    data.set('heroBackgroundImage', 'earth-europe');

    const result = await settingsActions.updateHeroImage({
      locals: { administratorId: adminId },
      request: new Request('https://worker.test/admin/settings', { method: 'POST', body: data }),
      platform: { env }
    } as never);

    expect(result).toMatchObject({ status: 400 });
  });

  it('updateHeroImage action updates the choice and returns a success message', async () => {
    const adminId = await seedAdministrator();
    const data = new FormData();
    data.set('heroBackgroundImage', 'earth-americas');

    const result = await settingsActions.updateHeroImage({
      locals: { administratorId: adminId },
      request: new Request('https://worker.test/admin/settings', { method: 'POST', body: data }),
      platform: { env }
    } as never);

    expect(result).toMatchObject({ success: true });

    const prisma = createPrisma(env.DB);
    try {
      expect((await getSiteSettings(prisma)).heroBackgroundImage).toBe('earth-americas');
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});

describe('site title settings', () => {
  it('returns null when no site title has been set', async () => {
    const prisma = createPrisma(env.DB);
    try {
      expect((await getSiteSettings(prisma)).siteTitle).toBeNull();
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it('sets a custom site title, then clears it back to null', async () => {
    const adminId = await seedAdministrator();
    const prisma = createPrisma(env.DB);
    try {
      await setSiteTitle(env.DB, prisma, {
        siteTitle: 'Custom Bible Apps',
        administratorId: adminId
      });
      expect((await getSiteSettings(prisma)).siteTitle).toBe('Custom Bible Apps');

      await setSiteTitle(env.DB, prisma, { siteTitle: null, administratorId: adminId });
      expect((await getSiteSettings(prisma)).siteTitle).toBeNull();
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it('leaves the hero background image untouched when only the title changes', async () => {
    const adminId = await seedAdministrator();
    const prisma = createPrisma(env.DB);
    try {
      await setHeroBackgroundImage(env.DB, prisma, {
        heroBackgroundImage: 'earth-americas',
        administratorId: adminId
      });

      await setSiteTitle(env.DB, prisma, {
        siteTitle: 'Custom Bible Apps',
        administratorId: adminId
      });

      const settings = await getSiteSettings(prisma);
      expect(settings.siteTitle).toBe('Custom Bible Apps');
      expect(settings.heroBackgroundImage).toBe('earth-americas');
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});

describe('theme settings', () => {
  it('returns null for the theme name when none has been set', async () => {
    const prisma = createPrisma(env.DB);
    try {
      const settings = await getSiteSettings(prisma);
      expect(settings.themeName).toBeNull();
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it('sets a custom theme, then clears it back to null', async () => {
    const adminId = await seedAdministrator();
    const prisma = createPrisma(env.DB);
    try {
      await setThemeSettings(env.DB, prisma, { themeName: 'dracula', administratorId: adminId });
      const set = await getSiteSettings(prisma);
      expect(set.themeName).toBe('dracula');

      await setThemeSettings(env.DB, prisma, { themeName: null, administratorId: adminId });
      const cleared = await getSiteSettings(prisma);
      expect(cleared.themeName).toBeNull();
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it('leaves the site title and hero background image untouched when only the theme changes', async () => {
    const adminId = await seedAdministrator();
    const prisma = createPrisma(env.DB);
    try {
      await setSiteTitle(env.DB, prisma, {
        siteTitle: 'Custom Bible Apps',
        administratorId: adminId
      });
      await setHeroBackgroundImage(env.DB, prisma, {
        heroBackgroundImage: 'earth-americas',
        administratorId: adminId
      });

      await setThemeSettings(env.DB, prisma, { themeName: 'dracula', administratorId: adminId });

      const settings = await getSiteSettings(prisma);
      expect(settings.siteTitle).toBe('Custom Bible Apps');
      expect(settings.heroBackgroundImage).toBe('earth-americas');
      expect(settings.themeName).toBe('dracula');
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it('resetTheme action clears the theme name back to null', async () => {
    const adminId = await seedAdministrator();
    const prisma = createPrisma(env.DB);
    try {
      await setThemeSettings(env.DB, prisma, { themeName: 'dracula', administratorId: adminId });

      const result = await settingsActions.resetTheme({
        locals: { administratorId: adminId },
        request: new Request('https://worker.test/admin/settings', { method: 'POST' }),
        platform: { env }
      } as never);

      expect(result).toMatchObject({ success: true, reset: true });

      const cleared = await getSiteSettings(prisma);
      expect(cleared.themeName).toBeNull();
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});

describe('custom hero image upload', () => {
  it('returns null when no custom image has been uploaded', async () => {
    const prisma = createPrisma(env.DB);
    try {
      expect(await getCustomHeroImage(prisma)).toBeNull();
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it('stores the uploaded bytes and mime type, and selects it as the hero background', async () => {
    const adminId = await seedAdministrator();
    const prisma = createPrisma(env.DB);
    try {
      await setCustomHeroImage(env.DB, prisma, {
        data: new Uint8Array([1, 2, 3, 4]).buffer,
        mimeType: 'image/png',
        administratorId: adminId
      });

      const settings = await getSiteSettings(prisma);
      expect(settings.heroBackgroundImage).toBe('custom');
      expect(settings.hasCustomHeroImage).toBe(true);

      const image = await getCustomHeroImage(prisma);
      expect(image?.mimeType).toBe('image/png');
      expect(new Uint8Array(image!.data)).toEqual(new Uint8Array([1, 2, 3, 4]));
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it('uploadHeroImage action rejects a non-image file', async () => {
    const adminId = await seedAdministrator();
    const data = new FormData();
    data.set('heroImageFile', new File(['not an image'], 'hero.txt', { type: 'text/plain' }));

    const result = await settingsActions.uploadHeroImage({
      locals: { administratorId: adminId },
      request: new Request('https://worker.test/admin/settings', { method: 'POST', body: data }),
      platform: { env }
    } as never);

    expect(result).toMatchObject({ status: 400 });
  });

  it('uploadHeroImage action rejects a file over the size limit', async () => {
    const adminId = await seedAdministrator();
    const data = new FormData();
    data.set('heroImageFile', pngFile('hero.png', new Array(5 * 1024 * 1024 + 1).fill(0)));

    const result = await settingsActions.uploadHeroImage({
      locals: { administratorId: adminId },
      request: new Request('https://worker.test/admin/settings', { method: 'POST', body: data }),
      platform: { env }
    } as never);

    expect(result).toMatchObject({ status: 400 });
  });

  it('uploadHeroImage action stores a valid image and returns a success message', async () => {
    const adminId = await seedAdministrator();
    const data = new FormData();
    data.set('heroImageFile', pngFile());

    const result = await settingsActions.uploadHeroImage({
      locals: { administratorId: adminId },
      request: new Request('https://worker.test/admin/settings', { method: 'POST', body: data }),
      platform: { env }
    } as never);

    expect(result).toMatchObject({ success: true });

    const prisma = createPrisma(env.DB);
    try {
      const settings = await getSiteSettings(prisma);
      expect(settings.heroBackgroundImage).toBe('custom');
      expect(settings.hasCustomHeroImage).toBe(true);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it('rejects an unauthenticated upload without touching the database', async () => {
    const data = new FormData();
    data.set('heroImageFile', pngFile());

    const result = await settingsActions.uploadHeroImage({
      locals: { administratorId: null },
      request: new Request('https://worker.test/admin/settings', { method: 'POST', body: data })
    } as never);

    expect(result).toMatchObject({ status: 401 });

    const prisma = createPrisma(env.DB);
    try {
      expect((await getSiteSettings(prisma)).hasCustomHeroImage).toBe(false);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it('/hero-background 404s when no custom image has been uploaded', async () => {
    try {
      await heroBackground({ platform: { env } } as never);
      expect.unreachable('expected a thrown 404');
    } catch (thrown) {
      expect((thrown as { status: number }).status).toBe(404);
    }
  });

  it('/hero-background serves the uploaded bytes with the stored mime type', async () => {
    const adminId = await seedAdministrator();
    const prisma = createPrisma(env.DB);
    try {
      await setCustomHeroImage(env.DB, prisma, {
        data: new Uint8Array([1, 2, 3, 4]).buffer,
        mimeType: 'image/webp',
        administratorId: adminId
      });
    } finally {
      await prisma.$disconnect().catch(() => {});
    }

    const response = (await heroBackground({ platform: { env } } as never)) as Response;
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/webp');
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3, 4]));
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

  it('rejects an unauthenticated hero-image update without touching the database', async () => {
    const data = new FormData();
    data.set('heroBackgroundImage', 'earth-americas');

    const result = await settingsActions.updateHeroImage({
      locals: { administratorId: null },
      request: new Request('https://worker.test/admin/settings', { method: 'POST', body: data })
    } as never);

    expect(result).toMatchObject({ status: 401 });

    const prisma = createPrisma(env.DB);
    try {
      expect((await getSiteSettings(prisma)).heroBackgroundImage).toBe('earth-asia');
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it('rejects an unauthenticated title update without touching the database', async () => {
    const result = await settingsActions.updateTitle({
      locals: { administratorId: null },
      request: new Request('https://worker.test/admin/settings', { method: 'POST' })
    } as never);

    expect(result).toMatchObject({ status: 401 });

    const prisma = createPrisma(env.DB);
    try {
      expect((await getSiteSettings(prisma)).siteTitle).toBeNull();
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it('rejects an unauthenticated theme update without touching the database', async () => {
    const result = await settingsActions.updateTheme({
      locals: { administratorId: null },
      request: new Request('https://worker.test/admin/settings', { method: 'POST' })
    } as never);

    expect(result).toMatchObject({ status: 401 });

    const prisma = createPrisma(env.DB);
    try {
      expect((await getSiteSettings(prisma)).themeName).toBeNull();
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it('rejects an unauthenticated theme reset without touching the database', async () => {
    const adminId = await seedAdministrator();
    const prisma = createPrisma(env.DB);
    try {
      await setThemeSettings(env.DB, prisma, { themeName: 'dracula', administratorId: adminId });

      const result = await settingsActions.resetTheme({
        locals: { administratorId: null },
        request: new Request('https://worker.test/admin/settings', { method: 'POST' })
      } as never);

      expect(result).toMatchObject({ status: 401 });
      expect((await getSiteSettings(prisma)).themeName).toBe('dracula');
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});
