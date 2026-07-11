PRAGMA foreign_keys = ON;

-- Representative data for the notification -> pending -> approval demo path.
INSERT OR IGNORE INTO "app_users" (
  "firebase_uid",
  "email",
  "display_name",
  "role",
  "disabled",
  "created_at",
  "updated_at"
) VALUES (
  'firebase-demo-admin',
  'admin@example.invalid',
  'Demo Administrator',
  'ADMINISTRATOR',
  0,
  '2026-07-11T00:00:00.000Z',
  '2026-07-11T00:00:00.000Z'
);

INSERT OR IGNORE INTO "packages" (
  "id",
  "scriptoria_product_id",
  "project_url",
  "project_name",
  "project_repo",
  "publish_url",
  "permalink_url",
  "size_bytes",
  "app_builder",
  "app_builder_version",
  "language_tag",
  "iso639_3",
  "local_name",
  "region_code",
  "region_name",
  "script_code",
  "sldr",
  "windows_tag",
  "image_base_url",
  "status",
  "last_notification_at",
  "created_at",
  "updated_at"
) VALUES (
  'pkg-gumawana',
  'd54c912a-979c-4fa2-9eac-164d7e2f575d',
  'https://app.scriptoria.io/projects/722',
  'gvs Gumawana',
  's3://sil-prd-aps-projects/scriptureappbuilder/gvs-1380-gvs-Gumawana',
  'https://sil-prd-scriptoria-files.s3.amazonaws.com/asset-package/d54c912a-979c-4fa2-9eac-164d7e2f575d/org.wycliffe.gvs.gumawana.bible.zip',
  'https://app.scriptoria.io/api/products/d54c912a-979c-4fa2-9eac-164d7e2f575d/files/published/asset-package',
  11351769,
  'scripture-app-builder',
  '9.3',
  'gvs-Latn-PG',
  'gvs',
  'Gumawana',
  'PG',
  'Papua New Guinea',
  'Latn',
  1,
  'gvs-Latn',
  'https://app.scriptoria.io/api/products/d54c912a-979c-4fa2-9eac-164d7e2f575d/files/published',
  'PENDING',
  '2026-07-11T00:00:00.000Z',
  '2026-07-11T00:00:00.000Z',
  '2026-07-11T00:00:00.000Z'
);

INSERT OR IGNORE INTO "package_names" (
  "id", "package_id", "name", "normalized_name", "kind"
) VALUES
  ('name-gumawana', 'pkg-gumawana', 'Gumawana', 'gumawana', 'PRIMARY'),
  ('name-domdom', 'pkg-gumawana', 'Domdom', 'domdom', 'ALTERNATE'),
  ('name-gumasi', 'pkg-gumawana', 'Gumasi', 'gumasi', 'ALTERNATE'),
  ('name-gumasila', 'pkg-gumawana', 'Gumasila', 'gumasila', 'ALTERNATE');

INSERT OR IGNORE INTO "package_listings" (
  "id", "package_id", "locale", "title", "short_description", "full_description"
) VALUES
  (
    'listing-en-us',
    'pkg-gumawana',
    'en-US',
    'Gumawana Bible',
    'The Bible in Gumawana of Papua New Guinea [gvs]',
    '<b>Buki Kimaasabaina</b> The Bible in the Gumawana language.'
  ),
  (
    'listing-es-419',
    'pkg-gumawana',
    'es-419',
    'Biblia Gumawana',
    'La Biblia en Gumawana de Papua Nueva Guinea [gvs]',
    '<b>Buki Kimaasabaina</b> La Biblia en el idioma Gumawana.'
  );

INSERT OR IGNORE INTO "package_images" (
  "id", "package_id", "scale", "source", "url"
) VALUES
  (
    'image-1x',
    'pkg-gumawana',
    '1x',
    'nav_drawer.png',
    'https://app.scriptoria.io/api/products/d54c912a-979c-4fa2-9eac-164d7e2f575d/files/published/nav_drawer.png'
  ),
  (
    'image-2x',
    'pkg-gumawana',
    '2x',
    'nav_drawer@2x.png',
    'https://app.scriptoria.io/api/products/d54c912a-979c-4fa2-9eac-164d7e2f575d/files/published/nav_drawer@2x.png'
  ),
  (
    'image-3x',
    'pkg-gumawana',
    '3x',
    'nav_drawer@3x.png',
    'https://app.scriptoria.io/api/products/d54c912a-979c-4fa2-9eac-164d7e2f575d/files/published/nav_drawer@3x.png'
  );

INSERT OR IGNORE INTO "package_status_events" (
  "id", "package_id", "from_status", "to_status", "actor_uid", "reason", "created_at"
) VALUES (
  'status-gumawana-pending',
  'pkg-gumawana',
  NULL,
  'PENDING',
  NULL,
  'Representative Scriptoria notification received',
  '2026-07-11T00:00:00.000Z'
);
