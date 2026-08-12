-- AlterTable
-- Replaces the five hand-picked hex theme columns with a single DaisyUI
-- theme-name column. No backfill: no deployment has captured admin-picked
-- colors yet, so the old columns are dropped outright.
ALTER TABLE "site_settings" DROP COLUMN "theme_button_color";
ALTER TABLE "site_settings" DROP COLUMN "theme_row_color";
ALTER TABLE "site_settings" DROP COLUMN "theme_background_color";
ALTER TABLE "site_settings" DROP COLUMN "theme_text_color";
ALTER TABLE "site_settings" DROP COLUMN "theme_icon_color";
ALTER TABLE "site_settings" ADD COLUMN "theme_name" TEXT;
