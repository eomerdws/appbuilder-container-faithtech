-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hero_background_image" BLOB,
    "hero_background_image_type" TEXT,
    "updated_at" DATETIME NOT NULL,
    "updated_by_id" TEXT,
    CONSTRAINT "site_settings_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "administrators" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
