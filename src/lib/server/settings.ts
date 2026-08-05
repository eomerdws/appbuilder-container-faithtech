import type { DatabaseClient } from './db';

const SITE_SETTING_ID = 'default';

export type SiteSettings = {
  heroBackgroundImageKey: string | null;
  siteTitle: string | null;
  themeButtonColor: string | null;
  themeRowColor: string | null;
  themeBackgroundColor: string | null;
  themeTextColor: string | null;
  themeIconColor: string | null;
};

/** Reads the current site settings, defaulting unset fields to null. */
export async function getSiteSettings(prisma: DatabaseClient): Promise<SiteSettings> {
  const setting = await prisma.siteSetting.findUnique({
    where: { id: SITE_SETTING_ID },
    select: {
      heroBackgroundImageKey: true,
      siteTitle: true,
      themeButtonColor: true,
      themeRowColor: true,
      themeBackgroundColor: true,
      themeTextColor: true,
      themeIconColor: true
    }
  });
  return {
    heroBackgroundImageKey: setting?.heroBackgroundImageKey ?? null,
    siteTitle: setting?.siteTitle ?? null,
    themeButtonColor: setting?.themeButtonColor ?? null,
    themeRowColor: setting?.themeRowColor ?? null,
    themeBackgroundColor: setting?.themeBackgroundColor ?? null,
    themeTextColor: setting?.themeTextColor ?? null,
    themeIconColor: setting?.themeIconColor ?? null
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
 * Sets (or, given a null field, clears back to the DaisyUI default for that
 * variable) the admin-configurable theme colors. Single-statement raw D1
 * upsert naming only the theme columns plus updated_at/updated_by_id, so the
 * title and hero-image columns are left untouched on conflict.
 */
export async function setThemeSettings(
  db: D1Database,
  prisma: DatabaseClient,
  input: {
    themeButtonColor: string | null;
    themeRowColor: string | null;
    themeBackgroundColor: string | null;
    themeTextColor: string | null;
    themeIconColor: string | null;
    administratorId: string;
  }
): Promise<void> {
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO site_settings (
         id, theme_button_color, theme_row_color, theme_background_color,
         theme_text_color, theme_icon_color, updated_at, updated_by_id
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         theme_button_color = excluded.theme_button_color,
         theme_row_color = excluded.theme_row_color,
         theme_background_color = excluded.theme_background_color,
         theme_text_color = excluded.theme_text_color,
         theme_icon_color = excluded.theme_icon_color,
         updated_at = excluded.updated_at,
         updated_by_id = excluded.updated_by_id`
    )
    .bind(
      SITE_SETTING_ID,
      input.themeButtonColor,
      input.themeRowColor,
      input.themeBackgroundColor,
      input.themeTextColor,
      input.themeIconColor,
      now,
      input.administratorId
    )
    .run();
}

/**
 * Uploads `file` to R2 under a fresh key, then points the SiteSetting row at
 * it, then deletes the previous R2 object (if any). The R2 upload happens
 * before the DB write so a failed upload never updates the setting; the old
 * object is cleaned up last so a crash mid-write leaves an orphaned object
 * rather than a dangling reference. The DB write itself is a single raw D1
 * upsert statement (atomic on its own, so no batch() is needed here) rather
 * than Prisma, matching moderatePackage/ingestNotification's raw-D1 convention.
 */
export async function setHeroBackgroundImage(
  db: D1Database,
  prisma: DatabaseClient,
  heroImages: R2Bucket,
  input: {
    file: Blob;
    contentType: string;
    administratorId: string;
  }
): Promise<{ key: string }> {
  const previous = await prisma.siteSetting.findUnique({
    where: { id: SITE_SETTING_ID },
    select: { heroBackgroundImageKey: true }
  });

  const key = `hero-background/${crypto.randomUUID()}`;
  await heroImages.put(key, input.file, {
    httpMetadata: { contentType: input.contentType }
  });

  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO site_settings (id, hero_background_image_key, updated_at, updated_by_id)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         hero_background_image_key = excluded.hero_background_image_key,
         updated_at = excluded.updated_at,
         updated_by_id = excluded.updated_by_id`
    )
    .bind(SITE_SETTING_ID, key, now, input.administratorId)
    .run();

  const previousKey = previous?.heroBackgroundImageKey;
  if (previousKey && previousKey !== key) {
    await heroImages.delete(previousKey);
  }

  return { key };
}
