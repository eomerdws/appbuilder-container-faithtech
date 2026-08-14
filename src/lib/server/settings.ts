import type { DatabaseClient } from './db';
import { type HeroBackgroundImage, defaultHeroBackgroundImage } from '$lib/hero-images';

const SITE_SETTING_ID = 'default';

export type SiteSettings = {
  heroBackgroundImage: HeroBackgroundImage;
  hasCustomHeroImage: boolean;
  siteTitle: string | null;
  themeName: string | null;
};

/** Reads the current site settings, defaulting unset fields to their site-wide default. */
export async function getSiteSettings(prisma: DatabaseClient): Promise<SiteSettings> {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: SITE_SETTING_ID },
    select: {
      heroBackgroundImage: true,
      customHeroImageMimeType: true,
      siteTitle: true,
      themeName: true
    }
  });
  return {
    heroBackgroundImage:
      (setting?.heroBackgroundImage as HeroBackgroundImage | undefined) ??
      defaultHeroBackgroundImage,
    hasCustomHeroImage: setting?.customHeroImageMimeType != null,
    siteTitle: setting?.siteTitle ?? null,
    themeName: setting?.themeName ?? null
  };
}

/** Reads the admin-uploaded custom hero image's bytes + mime type, for the /hero-background route. */
export async function getCustomHeroImage(
  prisma: DatabaseClient
): Promise<{ data: ArrayBuffer; mimeType: string } | null> {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: SITE_SETTING_ID },
    select: { customHeroImageData: true, customHeroImageMimeType: true }
  });
  if (!setting?.customHeroImageData || !setting.customHeroImageMimeType) return null;
  // .slice() copies into a fresh, exactly-sized Uint8Array so its .buffer is
  // a plain ArrayBuffer (not the wider ArrayBufferLike Prisma's Bytes type uses).
  return {
    data: setting.customHeroImageData.slice().buffer as ArrayBuffer,
    mimeType: setting.customHeroImageMimeType
  };
}

/**
 * Stores an admin-uploaded custom hero image (replacing any previous one)
 * and immediately selects it as the active hero_background_image. Single-
 * statement raw D1 upsert, matching the other setters' convention.
 */
export async function setCustomHeroImage(
  db: D1Database,
  prisma: DatabaseClient,
  input: {
    data: ArrayBuffer;
    mimeType: string;
    administratorId: string;
  }
): Promise<void> {
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO site_settings
         (id, hero_background_image, custom_hero_image_data, custom_hero_image_mime_type, updated_at, updated_by_id)
       VALUES (?, 'custom', ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         hero_background_image = 'custom',
         custom_hero_image_data = excluded.custom_hero_image_data,
         custom_hero_image_mime_type = excluded.custom_hero_image_mime_type,
         updated_at = excluded.updated_at,
         updated_by_id = excluded.updated_by_id`
    )
    .bind(SITE_SETTING_ID, input.data, input.mimeType, now, input.administratorId)
    .run();
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
 * src/lib/hero-images.ts) is shown on the public catalog. Single-statement
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
