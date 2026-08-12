-- AlterTable
-- Adds admin-uploaded custom hero image storage (raw bytes + mime type) as a
-- third option alongside the two bundled presets in hero_background_image.
ALTER TABLE "site_settings" ADD COLUMN "custom_hero_image_data" BLOB;
ALTER TABLE "site_settings" ADD COLUMN "custom_hero_image_mime_type" TEXT;
