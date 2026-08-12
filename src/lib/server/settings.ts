import type { DatabaseClient } from './db';

const SITE_SETTING_ID = 'default';

export type SiteSettings = {
  hasHeroBackgroundImage: boolean;
  siteTitle: string | null;
  themeName: string | null;
};

export type HeroBackgroundImage = {
  data: Uint8Array;
  contentType: string;
  updatedAt: Date;
};

/**
 * Reads the current site settings, defaulting unset fields to null. Selects
 * only heroBackgroundImageType (never the Bytes column itself) so this
 * hot-path query — called on every catalog and admin-settings page load —
 * never pulls the image blob over the wire; use getHeroBackgroundImage() to
 * actually read it.
 */
export async function getSiteSettings(prisma: DatabaseClient): Promise<SiteSettings> {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: SITE_SETTING_ID },
    select: {
      heroBackgroundImageType: true,
      siteTitle: true,
      themeName: true
    }
  });
  return {
    hasHeroBackgroundImage: setting?.heroBackgroundImageType != null,
    siteTitle: setting?.siteTitle ?? null,
    themeName: setting?.themeName ?? null
  };
}

/** Reads the stored hero background image bytes, or null if none is set. */
export async function getHeroBackgroundImage(
  prisma: DatabaseClient
): Promise<HeroBackgroundImage | null> {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: SITE_SETTING_ID },
    select: { heroBackgroundImage: true, heroBackgroundImageType: true, updatedAt: true }
  });
  if (!setting?.heroBackgroundImage || !setting.heroBackgroundImageType) return null;
  return {
    data: setting.heroBackgroundImage,
    contentType: setting.heroBackgroundImageType,
    updatedAt: setting.updatedAt
  };
}

/**
 * Sets (or, given an empty string, clears back to the localized default) the
 * custom site title. Single-statement raw D1 upsert, matching
 * setHeroBackgroundImage's convention; only names site_title on conflict so
 * hero_background_image_key is left untouched.
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
 * Stores `file`'s bytes directly on the SiteSetting row. Single-statement
 * raw D1 upsert, matching setSiteTitle/setThemeSettings's convention; only
 * names the hero-image columns on conflict so the other settings are left
 * untouched.
 */
export async function setHeroBackgroundImage(
  db: D1Database,
  prisma: DatabaseClient,
  input: {
    file: Blob;
    contentType: string;
    administratorId: string;
  }
): Promise<void> {
  const bytes = new Uint8Array(await input.file.arrayBuffer());
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO site_settings (id, hero_background_image, hero_background_image_type, updated_at, updated_by_id)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         hero_background_image = excluded.hero_background_image,
         hero_background_image_type = excluded.hero_background_image_type,
         updated_at = excluded.updated_at,
         updated_by_id = excluded.updated_by_id`
    )
    .bind(SITE_SETTING_ID, bytes, input.contentType, now, input.administratorId)
    .run();
}
