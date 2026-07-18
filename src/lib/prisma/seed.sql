PRAGMA foreign_keys = ON;

-- Representative data for the notification -> pending -> approval demo path.
-- The password hash is intentionally unusable; replace it through the future
-- administrator bootstrap flow before testing authentication.
INSERT OR IGNORE INTO "administrators" (
  "id",
  "email",
  "display_name",
  "password_hash",
  "disabled",
  "created_at",
  "updated_at"
) VALUES (
  'usr-demo-admin',
  'admin@example.invalid',
  'Demo Administrator',
  '!development-placeholder-not-a-valid-password-hash!',
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
) VALUES
  (
    'pkg-quenya-elvish',
    '6e0c3ef8-6cc8-4600-8f1b-53c6a6f04e01',
    'https://app.scriptoria.io/projects/9001',
    'qya Quenya Elvish',
    's3://sil-dev-aps-projects/scriptureappbuilder/qya-9001-quenya-elvish',
    'https://example.invalid/asset-package/6e0c3ef8-6cc8-4600-8f1b-53c6a6f04e01/org.example.qya.elvish.demo.zip',
    'https://app.scriptoria.io/api/products/6e0c3ef8-6cc8-4600-8f1b-53c6a6f04e01/files/published/asset-package',
    7340032,
    'scripture-app-builder',
    '9.3',
    'qya-Latn-001',
    'qya',
    'Quenya Elvish',
    NULL,
    'Middle-earth',
    'Latn',
    0,
    'qya-Latn',
    'https://app.scriptoria.io/api/products/6e0c3ef8-6cc8-4600-8f1b-53c6a6f04e01/files/published',
    'ACTIVE',
    '2026-07-11T00:00:00.000Z',
    '2026-07-11T00:00:00.000Z',
    '2026-07-11T00:00:00.000Z'
  ),
  (
    'pkg-klingon',
    '8aee4f57-fb8f-41ac-92aa-995d648f9052',
    'https://app.scriptoria.io/projects/1701',
    'tlh Klingon',
    's3://sil-dev-aps-projects/scriptureappbuilder/tlh-1701-klingon',
    'https://example.invalid/asset-package/8aee4f57-fb8f-41ac-92aa-995d648f9052/org.example.tlh.klingon.demo.zip',
    'https://app.scriptoria.io/api/products/8aee4f57-fb8f-41ac-92aa-995d648f9052/files/published/asset-package',
    9437184,
    'scripture-app-builder',
    '9.3',
    'tlh-Latn-001',
    'tlh',
    'Klingon',
    NULL,
    'Qo''noS',
    'Latn',
    0,
    'tlh-Latn',
    'https://app.scriptoria.io/api/products/8aee4f57-fb8f-41ac-92aa-995d648f9052/files/published',
    'PENDING',
    '2026-07-11T00:00:00.000Z',
    '2026-07-11T00:00:00.000Z',
    '2026-07-11T00:00:00.000Z'
  ),
  (
    'pkg-hawaiian-pidgin',
    'd037e9c4-4efa-4dd4-911f-b6825f5efaf8',
    'https://app.scriptoria.io/projects/808',
    'hwc Hawaiian Pidgin',
    's3://sil-dev-aps-projects/scriptureappbuilder/hwc-808-hawaiian-pidgin',
    'https://example.invalid/asset-package/d037e9c4-4efa-4dd4-911f-b6825f5efaf8/org.example.hwc.hawaiian.pidgin.demo.zip',
    'https://app.scriptoria.io/api/products/d037e9c4-4efa-4dd4-911f-b6825f5efaf8/files/published/asset-package',
    8388608,
    'scripture-app-builder',
    '9.3',
    'hwc-Latn-US',
    'hwc',
    'Hawaiian Pidgin',
    'US',
    'Hawaii',
    'Latn',
    0,
    'hwc-Latn',
    'https://app.scriptoria.io/api/products/d037e9c4-4efa-4dd4-911f-b6825f5efaf8/files/published',
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
  ('name-gumasila', 'pkg-gumawana', 'Gumasila', 'gumasila', 'ALTERNATE'),
  ('name-quenya-elvish', 'pkg-quenya-elvish', 'Quenya Elvish', 'quenya elvish', 'PRIMARY'),
  ('name-quenya', 'pkg-quenya-elvish', 'Quenya', 'quenya', 'LOCAL'),
  ('name-high-elven', 'pkg-quenya-elvish', 'High Elven', 'high elven', 'ALTERNATE'),
  ('name-klingon', 'pkg-klingon', 'Klingon', 'klingon', 'PRIMARY'),
  ('name-tlh', 'pkg-klingon', 'tlhIngan Hol', 'tlhingan hol', 'LOCAL'),
  ('name-klingonese', 'pkg-klingon', 'Klingonese', 'klingonese', 'ALTERNATE'),
  ('name-hawaiian-pidgin', 'pkg-hawaiian-pidgin', 'Hawaiian Pidgin', 'hawaiian pidgin', 'PRIMARY'),
  ('name-hawaii-creole', 'pkg-hawaiian-pidgin', 'Hawaii Creole English', 'hawaii creole english', 'IANA'),
  ('name-pidgin', 'pkg-hawaiian-pidgin', 'Pidgin', 'pidgin', 'LOCAL'),
  ('name-hce', 'pkg-hawaiian-pidgin', 'HCE', 'hce', 'ALTERNATE');

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
  ),
  (
    'listing-quenya-en-us',
    'pkg-quenya-elvish',
    'en-US',
    'Quenya Elvish Demo Bible',
    'Sample package for Quenya Elvish discovery testing [qya]',
    '<b>Quenya Elvish Demo</b> Representative sample content for search, listing, and approval workflows.'
  ),
  (
    'listing-quenya-qya',
    'pkg-quenya-elvish',
    'qya-Latn',
    'Parma Quenya',
    'A demo listing for Quenya Elvish sample data [qya]',
    '<b>Parma Quenya</b> Sample localized listing for the Elvish data path.'
  ),
  (
    'listing-klingon-en-us',
    'pkg-klingon',
    'en-US',
    'Klingon Demo Bible',
    'Sample package for Klingon discovery testing [tlh]',
    '<b>Klingon Demo</b> Representative sample content for pending review workflows.'
  ),
  (
    'listing-klingon-tlh',
    'pkg-klingon',
    'tlh-Latn',
    'tlhIngan Hol Demo',
    'A demo listing for Klingon sample data [tlh]',
    '<b>tlhIngan Hol Demo</b> Sample localized listing for the Klingon data path.'
  ),
  (
    'listing-hawaiian-pidgin-en-us',
    'pkg-hawaiian-pidgin',
    'en-US',
    'Hawaiian Pidgin Demo Bible',
    'Sample package for Hawaiian Pidgin discovery testing [hwc]',
    '<b>Hawaiian Pidgin Demo</b> Representative sample content for review and discovery workflows.'
  ),
  (
    'listing-hawaiian-pidgin-hwc',
    'pkg-hawaiian-pidgin',
    'hwc-Latn',
    'Da Pidgin Demo Bible',
    'One demo listing fo Hawaiian Pidgin sample data [hwc]',
    '<b>Da Pidgin Demo Bible</b> Sample localized listing for the Hawaiian Pidgin data path.'
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
  ),
  (
    'image-quenya-1x',
    'pkg-quenya-elvish',
    '1x',
    'nav_drawer.png',
    'https://app.scriptoria.io/api/products/6e0c3ef8-6cc8-4600-8f1b-53c6a6f04e01/files/published/nav_drawer.png'
  ),
  (
    'image-quenya-2x',
    'pkg-quenya-elvish',
    '2x',
    'nav_drawer@2x.png',
    'https://app.scriptoria.io/api/products/6e0c3ef8-6cc8-4600-8f1b-53c6a6f04e01/files/published/nav_drawer@2x.png'
  ),
  (
    'image-klingon-1x',
    'pkg-klingon',
    '1x',
    'nav_drawer.png',
    'https://app.scriptoria.io/api/products/8aee4f57-fb8f-41ac-92aa-995d648f9052/files/published/nav_drawer.png'
  ),
  (
    'image-klingon-2x',
    'pkg-klingon',
    '2x',
    'nav_drawer@2x.png',
    'https://app.scriptoria.io/api/products/8aee4f57-fb8f-41ac-92aa-995d648f9052/files/published/nav_drawer@2x.png'
  ),
  (
    'image-hawaiian-pidgin-1x',
    'pkg-hawaiian-pidgin',
    '1x',
    'nav_drawer.png',
    'https://app.scriptoria.io/api/products/d037e9c4-4efa-4dd4-911f-b6825f5efaf8/files/published/nav_drawer.png'
  ),
  (
    'image-hawaiian-pidgin-2x',
    'pkg-hawaiian-pidgin',
    '2x',
    'nav_drawer@2x.png',
    'https://app.scriptoria.io/api/products/d037e9c4-4efa-4dd4-911f-b6825f5efaf8/files/published/nav_drawer@2x.png'
  );

INSERT OR IGNORE INTO "package_status_events" (
  "id", "package_id", "from_status", "to_status", "actor_id", "reason", "created_at"
) VALUES
  (
    'status-gumawana-pending',
    'pkg-gumawana',
    NULL,
    'PENDING',
    NULL,
    'Representative Scriptoria notification received',
    '2026-07-11T00:00:00.000Z'
  ),
  (
    'status-quenya-pending',
    'pkg-quenya-elvish',
    NULL,
    'PENDING',
    NULL,
    'Sample Elvish notification received',
    '2026-07-11T00:00:00.000Z'
  ),
  (
    'status-quenya-active',
    'pkg-quenya-elvish',
    'PENDING',
    'ACTIVE',
    'usr-demo-admin',
    'Approved sample Elvish package for discovery testing',
    '2026-07-11T00:05:00.000Z'
  ),
  (
    'status-klingon-pending',
    'pkg-klingon',
    NULL,
    'PENDING',
    NULL,
    'Sample Klingon notification received',
    '2026-07-11T00:00:00.000Z'
  ),
  (
    'status-hawaiian-pidgin-pending',
    'pkg-hawaiian-pidgin',
    NULL,
    'PENDING',
    NULL,
    'Sample Hawaiian Pidgin notification received',
    '2026-07-11T00:00:00.000Z'
  );
