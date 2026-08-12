import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { createPrisma } from '../src/lib/server/db';
import {
  getSiteSettings,
  setHeroBackgroundImage,
  setSiteTitle,
  setThemeSettings
} from '../src/lib/server/settings';
import { load as adminLayoutLoad } from '../src/routes/admin/+layout.server';
import { actions as settingsActions } from '../src/routes/admin/settings/+page.server';
import { seedAdministrator } from './fixtures';

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
