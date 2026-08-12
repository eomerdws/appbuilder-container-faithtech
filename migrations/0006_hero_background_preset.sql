-- AlterTable
-- Replaces the admin-uploaded hero background (a BLOB) with a simple choice
-- between two images bundled with the app — the admin settings UI no longer
-- supports uploading a custom image.
ALTER TABLE "site_settings" DROP COLUMN "hero_background_image_type";
ALTER TABLE "site_settings" DROP COLUMN "hero_background_image";
ALTER TABLE "site_settings" ADD COLUMN "hero_background_image" TEXT NOT NULL DEFAULT 'earth-asia';
