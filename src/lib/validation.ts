import * as v from 'valibot';
import { heroBackgroundImages } from './hero-images';
import * as m from './paraglide/messages';
import { daisyThemes } from './themes';

export const packageStatuses = ['PENDING', 'ACTIVE', 'REJECTED', 'INACTIVE'] as const;

export type PackageStatus = (typeof packageStatuses)[number];

export const credentialsSchema = v.object({
  email: v.pipe(
    v.string(),
    v.trim(),
    v.email(() => m.validation_email_invalid()),
    v.maxLength(320, () => m.validation_email_too_long())
  ),
  password: v.pipe(
    v.string(),
    v.minLength(1, () => m.validation_password_required()),
    v.maxLength(1_000, () => m.validation_password_too_long())
  )
});

const reasonSchema = v.optional(v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(2_000)));

export const moderationSchema = v.object({
  status: v.picklist(packageStatuses),
  reason: reasonSchema
});

export const moderationActionSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  status: v.picklist(packageStatuses),
  reason: reasonSchema
});

export const heroBackgroundImageSchema = v.picklist(heroBackgroundImages, () =>
  m.validation_hero_image_invalid_choice()
);

const HERO_IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
const HERO_IMAGE_UPLOAD_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

export const heroImageUploadSchema = v.pipe(
  v.file(() => m.validation_hero_image_upload_required()),
  v.mimeType(HERO_IMAGE_UPLOAD_MIME_TYPES, () => m.validation_hero_image_upload_invalid_type()),
  v.maxSize(HERO_IMAGE_UPLOAD_MAX_BYTES, () => m.validation_hero_image_upload_too_large())
);

export const siteTitleSchema = v.pipe(
  v.string(),
  v.trim(),
  v.maxLength(200, () => m.validation_site_title_too_long())
);

const themeNameSchema = v.pipe(
  v.string(),
  v.trim(),
  v.check(
    (value) => value === '' || (daisyThemes as readonly string[]).includes(value),
    () => m.validation_theme_name_invalid()
  )
);

export const themeSettingsSchema = v.object({
  themeName: themeNameSchema
});

export const searchSchema = v.object({
  q: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(200))),
  limit: v.optional(
    v.pipe(
      v.union([v.string(), v.number()]),
      v.transform(Number),
      v.number(),
      v.integer(),
      v.minValue(1),
      v.maxValue(100)
    ),
    25
  )
});
