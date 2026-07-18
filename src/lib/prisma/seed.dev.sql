-- DEVELOPMENT ONLY. Do not apply this file to staging or production.
--
-- Local administrator credentials:
--   email:    admin@example.invalid
--   password: demo-password-123

INSERT INTO "administrators" (
  "id",
  "email",
  "display_name",
  "password_hash",
  "disabled",
  "created_at",
  "updated_at"
) VALUES (
  'usr-dev-admin',
  'admin@example.invalid',
  'Dev Administrator',
  'pbkdf2$100000$n8WLsEWz9upL3x6Neo89rQ==$/Nd3YFid9U81j57iK5QGM2hPpiVSsQRL3SVByy4WTrU=',
  0,
  '2026-07-11T00:00:00.000Z',
  '2026-07-11T00:00:00.000Z'
)
ON CONFLICT("email") DO UPDATE SET
  "password_hash" = excluded."password_hash",
  "display_name" = excluded."display_name",
  "disabled" = 0,
  "updated_at" = excluded."updated_at";

-- A varied local catalogue for exercising public search and every moderation
-- queue. All URLs use the reserved .invalid domain so mock records can never
-- accidentally call a real service.
INSERT OR IGNORE INTO "packages" (
  "id", "scriptoria_product_id", "project_url", "project_name", "project_repo",
  "publish_url", "permalink_url", "size_bytes", "app_builder",
  "app_builder_version", "language_tag", "iso639_3", "local_name",
  "region_code", "region_name", "script_code", "sldr", "windows_tag",
  "image_base_url", "status", "rejection_reason", "reviewed_at",
  "reviewed_by_id", "last_notification_at", "created_at", "updated_at"
) VALUES
  (
    'pkg-hawaiian-pidgin', 'mock-product-hwc',
    'https://scriptoria.example.invalid/projects/hwc', 'hwc Hawaiian Pidgin', NULL,
    'https://downloads.example.invalid/hwc-bible.zip',
    'https://scriptoria.example.invalid/products/hwc', 14832000,
    'scripture-app-builder', '9.3', 'hwc-Latn-US', 'hwc', 'Hawaiian Pidgin',
    'US', 'United States', 'Latn', 1, 'hwc-Latn',
    'https://images.example.invalid/hwc', 'ACTIVE', NULL,
    '2026-07-10T15:10:00.000Z',
    (SELECT "id" FROM "administrators" WHERE "email" = 'admin@example.invalid'),
    '2026-07-10T14:30:00.000Z', '2026-07-10T14:30:00.000Z', '2026-07-10T15:10:00.000Z'
  ),
  (
    'pkg-kinyarwanda', 'mock-product-kin',
    'https://scriptoria.example.invalid/projects/kin', 'kin Kinyarwanda', NULL,
    'https://downloads.example.invalid/kin-bible.zip',
    'https://scriptoria.example.invalid/products/kin', 22618000,
    'scripture-app-builder', '9.2', 'rw-Latn-RW', 'kin', 'Ikinyarwanda',
    'RW', 'Rwanda', 'Latn', 1, 'rw-Latn',
    'https://images.example.invalid/kin', 'ACTIVE', NULL,
    '2026-07-09T11:45:00.000Z',
    (SELECT "id" FROM "administrators" WHERE "email" = 'admin@example.invalid'),
    '2026-07-09T10:00:00.000Z', '2026-07-09T10:00:00.000Z', '2026-07-09T11:45:00.000Z'
  ),
  (
    'pkg-inuktitut', 'mock-product-iku',
    'https://scriptoria.example.invalid/projects/iku', 'iku Eastern Canadian Inuktitut', NULL,
    'https://downloads.example.invalid/iku-bible.zip',
    'https://scriptoria.example.invalid/products/iku', 19304000,
    'scripture-app-builder', '9.3', 'iu-Cans-CA', 'iku', 'Inuktitut',
    'CA', 'Canada', 'Cans', 1, 'iu-Cans',
    'https://images.example.invalid/iku', 'ACTIVE', NULL,
    '2026-07-08T16:25:00.000Z',
    (SELECT "id" FROM "administrators" WHERE "email" = 'admin@example.invalid'),
    '2026-07-08T15:00:00.000Z', '2026-07-08T15:00:00.000Z', '2026-07-08T16:25:00.000Z'
  ),
  (
    'pkg-quechua-cusco', 'mock-product-quz',
    'https://scriptoria.example.invalid/projects/quz', 'quz Cusco Quechua', NULL,
    'https://downloads.example.invalid/quz-bible.zip',
    'https://scriptoria.example.invalid/products/quz', 18176000,
    'scripture-app-builder', '9.1', 'quz-Latn-PE', 'quz', 'Runasimi',
    'PE', 'Peru', 'Latn', 1, 'quz-Latn',
    'https://images.example.invalid/quz', 'ACTIVE', NULL,
    '2026-07-07T13:20:00.000Z',
    (SELECT "id" FROM "administrators" WHERE "email" = 'admin@example.invalid'),
    '2026-07-07T12:10:00.000Z', '2026-07-07T12:10:00.000Z', '2026-07-07T13:20:00.000Z'
  ),
  (
    'pkg-tok-pisin', 'mock-product-tpi',
    'https://scriptoria.example.invalid/projects/tpi', 'tpi Tok Pisin', NULL,
    'https://downloads.example.invalid/tpi-bible.zip',
    'https://scriptoria.example.invalid/products/tpi', 16442000,
    'scripture-app-builder', '9.4', 'tpi-Latn-PG', 'tpi', 'Tok Pisin',
    'PG', 'Papua New Guinea', 'Latn', 1, 'tpi-Latn',
    'https://images.example.invalid/tpi', 'PENDING', NULL, NULL, NULL,
    '2026-07-12T13:35:00.000Z', '2026-07-12T13:35:00.000Z', '2026-07-12T13:35:00.000Z'
  ),
  (
    'pkg-swahili', 'mock-product-swh',
    'https://scriptoria.example.invalid/projects/swh', 'swh Swahili', NULL,
    'https://downloads.example.invalid/swh-bible.zip',
    'https://scriptoria.example.invalid/products/swh', 20811000,
    'scripture-app-builder', '9.4', 'sw-Latn-KE', 'swh', 'Kiswahili',
    'KE', 'Kenya', 'Latn', 1, 'sw-Latn',
    'https://images.example.invalid/swh', 'PENDING', NULL, NULL, NULL,
    '2026-07-12T12:20:00.000Z', '2026-07-12T12:20:00.000Z', '2026-07-12T12:20:00.000Z'
  ),
  (
    'pkg-portuguese-br', 'mock-product-por-br',
    'https://scriptoria.example.invalid/projects/por-br', 'por Brazilian Portuguese', NULL,
    'https://downloads.example.invalid/por-br-bible.zip',
    'https://scriptoria.example.invalid/products/por-br', 25904000,
    'scripture-app-builder', '9.4', 'pt-BR', 'por', 'Português do Brasil',
    'BR', 'Brazil', 'Latn', 1, 'pt-BR',
    'https://images.example.invalid/por-br', 'PENDING', NULL, NULL, NULL,
    '2026-07-12T11:05:00.000Z', '2026-07-12T11:05:00.000Z', '2026-07-12T11:05:00.000Z'
  ),
  (
    'pkg-klingon', 'mock-product-tlh',
    'https://scriptoria.example.invalid/projects/tlh', 'tlh Klingon', NULL,
    'https://downloads.example.invalid/tlh-demo.zip',
    'https://scriptoria.example.invalid/products/tlh', 6350000,
    'scripture-app-builder', '9.0', 'tlh-Latn', 'tlh', 'tlhIngan Hol',
    NULL, 'Constructed language', 'Latn', 0, 'tlh-Latn',
    'https://images.example.invalid/tlh', 'REJECTED',
    'Rights and source materials could not be verified.',
    '2026-07-11T15:40:00.000Z',
    (SELECT "id" FROM "administrators" WHERE "email" = 'admin@example.invalid'),
    '2026-07-11T14:50:00.000Z', '2026-07-11T14:50:00.000Z', '2026-07-11T15:40:00.000Z'
  ),
  (
    'pkg-latin', 'mock-product-lat',
    'https://scriptoria.example.invalid/projects/lat', 'lat Latin', NULL,
    'https://downloads.example.invalid/lat-bible.zip',
    'https://scriptoria.example.invalid/products/lat', 12109000,
    'scripture-app-builder', '8.9', 'la-Latn-VA', 'lat', 'Latina',
    'VA', 'Vatican City', 'Latn', 1, 'la-Latn',
    'https://images.example.invalid/lat', 'REJECTED',
    'Package metadata is incomplete and needs to be republished.',
    '2026-07-10T09:30:00.000Z',
    (SELECT "id" FROM "administrators" WHERE "email" = 'admin@example.invalid'),
    '2026-07-10T08:45:00.000Z', '2026-07-10T08:45:00.000Z', '2026-07-10T09:30:00.000Z'
  ),
  (
    'pkg-spanish-latam', 'mock-product-spa-419',
    'https://scriptoria.example.invalid/projects/spa-419', 'spa Latin American Spanish', NULL,
    'https://downloads.example.invalid/spa-419-bible.zip',
    'https://scriptoria.example.invalid/products/spa-419', 27450000,
    'scripture-app-builder', '8.7', 'es-419', 'spa', 'Español latinoamericano',
    'MX', 'Latin America', 'Latn', 1, 'es-419',
    'https://images.example.invalid/spa-419', 'INACTIVE', NULL,
    '2026-07-06T17:10:00.000Z',
    (SELECT "id" FROM "administrators" WHERE "email" = 'admin@example.invalid'),
    '2026-07-05T10:15:00.000Z', '2026-07-05T10:15:00.000Z', '2026-07-06T17:10:00.000Z'
  ),
  (
    'pkg-french', 'mock-product-fra',
    'https://scriptoria.example.invalid/projects/fra', 'fra French', NULL,
    'https://downloads.example.invalid/fra-bible.zip',
    'https://scriptoria.example.invalid/products/fra', 24187000,
    'scripture-app-builder', '8.8', 'fr-Latn-FR', 'fra', 'Français',
    'FR', 'France', 'Latn', 1, 'fr-Latn',
    'https://images.example.invalid/fra', 'INACTIVE', NULL,
    '2026-07-04T16:45:00.000Z',
    (SELECT "id" FROM "administrators" WHERE "email" = 'admin@example.invalid'),
    '2026-07-03T09:10:00.000Z', '2026-07-03T09:10:00.000Z', '2026-07-04T16:45:00.000Z'
  );

INSERT OR IGNORE INTO "package_names" (
  "id", "package_id", "name", "normalized_name", "kind"
) VALUES
  ('name-hwc-primary', 'pkg-hawaiian-pidgin', 'Hawaiian Pidgin', 'hawaiian pidgin', 'PRIMARY'),
  ('name-hwc-local', 'pkg-hawaiian-pidgin', 'Hawaiʻi Creole English', 'hawaii creole english', 'ALTERNATE'),
  ('name-kin-primary', 'pkg-kinyarwanda', 'Kinyarwanda', 'kinyarwanda', 'PRIMARY'),
  ('name-kin-local', 'pkg-kinyarwanda', 'Ikinyarwanda', 'ikinyarwanda', 'LOCAL'),
  ('name-iku-primary', 'pkg-inuktitut', 'Eastern Canadian Inuktitut', 'eastern canadian inuktitut', 'PRIMARY'),
  ('name-iku-local', 'pkg-inuktitut', 'Inuktitut', 'inuktitut', 'LOCAL'),
  ('name-quz-primary', 'pkg-quechua-cusco', 'Cusco Quechua', 'cusco quechua', 'PRIMARY'),
  ('name-quz-local', 'pkg-quechua-cusco', 'Runasimi', 'runasimi', 'LOCAL'),
  ('name-tpi-primary', 'pkg-tok-pisin', 'Tok Pisin', 'tok pisin', 'PRIMARY'),
  ('name-tpi-alt', 'pkg-tok-pisin', 'New Guinea Pidgin', 'new guinea pidgin', 'ALTERNATE'),
  ('name-swh-primary', 'pkg-swahili', 'Swahili', 'swahili', 'PRIMARY'),
  ('name-swh-local', 'pkg-swahili', 'Kiswahili', 'kiswahili', 'LOCAL'),
  ('name-por-primary', 'pkg-portuguese-br', 'Brazilian Portuguese', 'brazilian portuguese', 'PRIMARY'),
  ('name-por-local', 'pkg-portuguese-br', 'Português do Brasil', 'portugues do brasil', 'LOCAL'),
  ('name-tlh-primary', 'pkg-klingon', 'Klingon', 'klingon', 'PRIMARY'),
  ('name-tlh-local', 'pkg-klingon', 'tlhIngan Hol', 'tlhingan hol', 'LOCAL'),
  ('name-lat-primary', 'pkg-latin', 'Latin', 'latin', 'PRIMARY'),
  ('name-lat-local', 'pkg-latin', 'Latina', 'latina', 'LOCAL'),
  ('name-spa-primary', 'pkg-spanish-latam', 'Latin American Spanish', 'latin american spanish', 'PRIMARY'),
  ('name-spa-local', 'pkg-spanish-latam', 'Español latinoamericano', 'espanol latinoamericano', 'LOCAL'),
  ('name-fra-primary', 'pkg-french', 'French', 'french', 'PRIMARY'),
  ('name-fra-local', 'pkg-french', 'Français', 'francais', 'LOCAL');

INSERT OR IGNORE INTO "package_listings" (
  "id", "package_id", "locale", "title", "short_description", "full_description"
) VALUES
  ('listing-hwc-en', 'pkg-hawaiian-pidgin', 'en-US', 'Da Bible', 'Scripture in Hawaiian Pidgin [hwc]', 'Read and listen to Scripture in Hawaiian Pidgin.'),
  ('listing-kin-en', 'pkg-kinyarwanda', 'en-US', 'Kinyarwanda Bible', 'Scripture in Kinyarwanda [kin]', 'The Bible in the Kinyarwanda language of Rwanda.'),
  ('listing-iku-en', 'pkg-inuktitut', 'en-CA', 'Inuktitut Bible', 'Scripture in Eastern Canadian Inuktitut [iku]', 'Scripture presented in Canadian Aboriginal syllabics.'),
  ('listing-quz-en', 'pkg-quechua-cusco', 'en-US', 'Cusco Quechua Bible', 'Scripture in Cusco Quechua [quz]', 'The Bible in Runasimi from the Cusco region of Peru.'),
  ('listing-tpi-en', 'pkg-tok-pisin', 'en-US', 'Tok Pisin Bible', 'Scripture in Tok Pisin [tpi]', 'A new package awaiting administrator review.'),
  ('listing-swh-en', 'pkg-swahili', 'en-US', 'Kiswahili Bible', 'Scripture in Swahili [swh]', 'A Swahili Scripture package for East Africa.'),
  ('listing-por-en', 'pkg-portuguese-br', 'en-US', 'Bíblia em Português', 'Scripture in Brazilian Portuguese [por]', 'A Brazilian Portuguese Scripture package.'),
  ('listing-tlh-en', 'pkg-klingon', 'en-US', 'Klingon Scripture Demo', 'Unverified demonstration package [tlh]', 'This mock package demonstrates a rejected review state.'),
  ('listing-lat-en', 'pkg-latin', 'en-US', 'Biblia Latina', 'Scripture in Latin [lat]', 'This mock package requires corrected metadata before approval.'),
  ('listing-spa-en', 'pkg-spanish-latam', 'en-US', 'Biblia en Español', 'Scripture in Latin American Spanish [spa]', 'This version was replaced by a newer package.'),
  ('listing-fra-en', 'pkg-french', 'en-US', 'Bible en français', 'Scripture in French [fra]', 'This package has been withdrawn from the public catalogue.');

INSERT OR IGNORE INTO "package_images" (
  "id", "package_id", "scale", "source", "url"
) VALUES
  ('image-hwc-1x', 'pkg-hawaiian-pidgin', '1x', 'app-icon.png', 'https://images.example.invalid/hwc/app-icon.png'),
  ('image-kin-1x', 'pkg-kinyarwanda', '1x', 'app-icon.png', 'https://images.example.invalid/kin/app-icon.png'),
  ('image-iku-1x', 'pkg-inuktitut', '1x', 'app-icon.png', 'https://images.example.invalid/iku/app-icon.png'),
  ('image-quz-1x', 'pkg-quechua-cusco', '1x', 'app-icon.png', 'https://images.example.invalid/quz/app-icon.png'),
  ('image-tpi-1x', 'pkg-tok-pisin', '1x', 'app-icon.png', 'https://images.example.invalid/tpi/app-icon.png'),
  ('image-swh-1x', 'pkg-swahili', '1x', 'app-icon.png', 'https://images.example.invalid/swh/app-icon.png'),
  ('image-por-1x', 'pkg-portuguese-br', '1x', 'app-icon.png', 'https://images.example.invalid/por-br/app-icon.png'),
  ('image-tlh-1x', 'pkg-klingon', '1x', 'app-icon.png', 'https://images.example.invalid/tlh/app-icon.png'),
  ('image-lat-1x', 'pkg-latin', '1x', 'app-icon.png', 'https://images.example.invalid/lat/app-icon.png'),
  ('image-spa-1x', 'pkg-spanish-latam', '1x', 'app-icon.png', 'https://images.example.invalid/spa-419/app-icon.png'),
  ('image-fra-1x', 'pkg-french', '1x', 'app-icon.png', 'https://images.example.invalid/fra/app-icon.png');

-- Every package starts as pending. Additional events below show how reviewed
-- packages arrived at their current state.
INSERT OR IGNORE INTO "package_status_events" (
  "id", "package_id", "from_status", "to_status", "actor_id", "reason", "created_at"
) VALUES ('status-hwc-pending', 'pkg-hawaiian-pidgin', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-10T14:30:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('status-kin-pending', 'pkg-kinyarwanda', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-09T10:00:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('status-iku-pending', 'pkg-inuktitut', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-08T15:00:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('status-quz-pending', 'pkg-quechua-cusco', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-07T12:10:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('status-tpi-pending', 'pkg-tok-pisin', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-12T13:35:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('status-swh-pending', 'pkg-swahili', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-12T12:20:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('status-por-pending', 'pkg-portuguese-br', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-12T11:05:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('status-tlh-pending', 'pkg-klingon', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-11T14:50:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('status-lat-pending', 'pkg-latin', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-10T08:45:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('status-spa-pending', 'pkg-spanish-latam', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-05T10:15:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('status-fra-pending', 'pkg-french', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-03T09:10:00.000Z');

INSERT OR IGNORE INTO "package_status_events" (
  "id", "package_id", "from_status", "to_status", "actor_id", "reason", "created_at"
)
SELECT 'status-hwc-active', 'pkg-hawaiian-pidgin', 'PENDING', 'ACTIVE', "id", 'Metadata and package verified', '2026-07-10T15:10:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
INSERT OR IGNORE INTO "package_status_events" SELECT 'status-kin-active', 'pkg-kinyarwanda', 'PENDING', 'ACTIVE', "id", 'Metadata and package verified', '2026-07-09T11:45:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
INSERT OR IGNORE INTO "package_status_events" SELECT 'status-iku-active', 'pkg-inuktitut', 'PENDING', 'ACTIVE', "id", 'Metadata and package verified', '2026-07-08T16:25:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
INSERT OR IGNORE INTO "package_status_events" SELECT 'status-quz-active', 'pkg-quechua-cusco', 'PENDING', 'ACTIVE', "id", 'Metadata and package verified', '2026-07-07T13:20:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
INSERT OR IGNORE INTO "package_status_events" SELECT 'status-tlh-rejected', 'pkg-klingon', 'PENDING', 'REJECTED', "id", 'Rights and source materials could not be verified', '2026-07-11T15:40:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
INSERT OR IGNORE INTO "package_status_events" SELECT 'status-lat-rejected', 'pkg-latin', 'PENDING', 'REJECTED', "id", 'Package metadata is incomplete', '2026-07-10T09:30:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
INSERT OR IGNORE INTO "package_status_events" SELECT 'status-spa-active', 'pkg-spanish-latam', 'PENDING', 'ACTIVE', "id", 'Metadata and package verified', '2026-07-05T11:00:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
INSERT OR IGNORE INTO "package_status_events" SELECT 'status-spa-inactive', 'pkg-spanish-latam', 'ACTIVE', 'INACTIVE', "id", 'Superseded by a newer package', '2026-07-06T17:10:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
INSERT OR IGNORE INTO "package_status_events" SELECT 'status-fra-active', 'pkg-french', 'PENDING', 'ACTIVE', "id", 'Metadata and package verified', '2026-07-03T10:00:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
INSERT OR IGNORE INTO "package_status_events" SELECT 'status-fra-inactive', 'pkg-french', 'ACTIVE', 'INACTIVE', "id", 'Publisher requested withdrawal', '2026-07-04T16:45:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
