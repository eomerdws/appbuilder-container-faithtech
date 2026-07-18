-- CreateTable
CREATE TABLE "administrators" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "password_hash" TEXT NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scriptoria_product_id" TEXT NOT NULL,
    "project_url" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "project_repo" TEXT,
    "publish_url" TEXT NOT NULL,
    "permalink_url" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "app_builder" TEXT NOT NULL,
    "app_builder_version" TEXT NOT NULL,
    "language_tag" TEXT NOT NULL,
    "iso639_3" TEXT NOT NULL,
    "local_name" TEXT NOT NULL,
    "region_code" TEXT,
    "region_name" TEXT,
    "script_code" TEXT,
    "sldr" BOOLEAN NOT NULL DEFAULT false,
    "windows_tag" TEXT,
    "image_base_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "reviewed_at" DATETIME,
    "reviewed_by_id" TEXT,
    "last_notification_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw_notification_json" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "packages_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "administrators" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "package_names" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "package_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalized_name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    CONSTRAINT "package_names_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "package_listings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "package_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "short_description" TEXT,
    "full_description" TEXT,
    CONSTRAINT "package_listings_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "package_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "package_id" TEXT NOT NULL,
    "scale" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "package_images_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "package_status_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "package_id" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "actor_id" TEXT,
    "reason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "package_status_events_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "package_status_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "administrators" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "administrators_email_key" ON "administrators"("email");

-- CreateIndex
CREATE UNIQUE INDEX "packages_scriptoria_product_id_key" ON "packages"("scriptoria_product_id");

-- CreateIndex
CREATE INDEX "packages_status_idx" ON "packages"("status");

-- CreateIndex
CREATE INDEX "packages_iso639_3_idx" ON "packages"("iso639_3");

-- CreateIndex
CREATE INDEX "packages_region_code_idx" ON "packages"("region_code");

-- CreateIndex
CREATE INDEX "packages_local_name_idx" ON "packages"("local_name");

-- CreateIndex
CREATE INDEX "package_names_normalized_name_idx" ON "package_names"("normalized_name");

-- CreateIndex
CREATE UNIQUE INDEX "package_names_package_id_normalized_name_key" ON "package_names"("package_id", "normalized_name");

-- CreateIndex
CREATE INDEX "package_listings_locale_idx" ON "package_listings"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "package_listings_package_id_locale_key" ON "package_listings"("package_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "package_images_package_id_scale_source_key" ON "package_images"("package_id", "scale", "source");

-- CreateIndex
CREATE INDEX "package_status_events_package_id_created_at_idx" ON "package_status_events"("package_id", "created_at");

-- CreateIndex
CREATE INDEX "package_status_events_actor_id_idx" ON "package_status_events"("actor_id");
