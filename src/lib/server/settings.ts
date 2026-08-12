import type { DatabaseClient } from './db';
import { type HeroBackgroundImage, defaultHeroBackgroundImage } from '$lib/hero-images';

const SITE_SETTING_ID = 'default';

export type SiteSettings = {
  heroBackgroundImage: HeroBackgroundImage;
  siteTitle: string | null;
  themeName: string | null;
};

/** Reads the current site settings, defaulting unset fields to their site-wide default. */
export async function getSiteSettings(prisma: DatabaseClient): Promise<SiteSettings> {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: SITE_SETTING_ID },
    select: {
      heroBackgroundImage: true,
      siteTitle: true,
      themeName: true
    }
  });
  return {
    heroBackgroundImage:
      (setting?.heroBackgroundImage as HeroBackgroundImage | undefined) ??
      defaultHeroBackgroundImage,
    siteTitle: setting?.siteTitle ?? null,
    themeName: setting?.themeName ?? null
  };
}

/**
 * Sets (or, given an empty string, clears back to the localized default) the
 * custom site title. Single-statement raw D1 upsert, matching
 * setHeroBackgroundImage's convention; only names site_title on conflict so
 * the hero-image and theme settings are left untouched.
 */
export async function setSiteTitle(
  db: D1Database,
  prisma: DatabaseClient,
  input: {
    siteTitle: string | null;
    administratorId: string;
  }
): Promise<void> {
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO site_settings (id, site_title, updated_at, updated_by_id)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         site_title = excluded.site_title,
         updated_at = excluded.updated_at,
         updated_by_id = excluded.updated_by_id`
    )
    .bind(SITE_SETTING_ID, input.siteTitle, now, input.administratorId)
    .run();
}

/**
 * Sets (or, given null, clears back to the site's default look) the
 * admin-chosen DaisyUI theme name. Single-statement raw D1 upsert naming
 * only theme_name plus updated_at/updated_by_id, so the title and
 * hero-image columns are left untouched on conflict.
 */
export async function setThemeSettings(
  db: D1Database,
  prisma: DatabaseClient,
  input: {
    themeName: string | null;
    administratorId: string;
  }
): Promise<void> {
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO site_settings (id, theme_name, updated_at, updated_by_id)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         theme_name = excluded.theme_name,
         updated_at = excluded.updated_at,
         updated_by_id = excluded.updated_by_id`
    )
    .bind(SITE_SETTING_ID, input.themeName, now, input.administratorId)
    .run();
}

/**
 * Sets which of the two bundled GlobeHero background images (see
 * src/lib/hero-images.ts) is shown on the public catalogue. Single-statement
 * raw D1 upsert, matching setSiteTitle/setThemeSettings's convention; only
 * names hero_background_image on conflict so the title and theme settings
 * are left untouched.
 */
export async function setHeroBackgroundImage(
  db: D1Database,
  prisma: DatabaseClient,
  input: {
    heroBackgroundImage: HeroBackgroundImage;
    administratorId: string;
  }
): Promise<void> {
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO site_settings (id, hero_background_image, updated_at, updated_by_id)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         hero_background_image = excluded.hero_background_image,
         updated_at = excluded.updated_at,
         updated_by_id = excluded.updated_by_id`
    )
    .bind(SITE_SETTING_ID, input.heroBackgroundImage, now, input.administratorId)
    .run();
}
