PRAGMA foreign_keys = ON;

-- Slug -> UUIDv4 mapping (ids below were substituted from these human-readable
-- placeholders so re-seeding stays idempotent; kept here for debugging readability).
--   image-1x                       -> 7e486251-376b-4703-acd5-f8141fece399
--   image-2x                       -> ed6b0a2f-5b3d-4cdb-83fd-c0eb7cdee274
--   image-3x                       -> bdd8999c-0613-48bd-a676-6f1c012c7bdc
--   image-hawaiian-pidgin-1x       -> c3e14251-9908-4590-935c-fc85ab1f9fb2
--   image-hawaiian-pidgin-2x       -> 5901b756-9337-48c6-83ab-4b7e93f7f301
--   image-klingon-1x               -> 9d575fa0-1d6e-416d-b09e-7cbf6004f7e3
--   image-klingon-2x               -> baa7fad4-7450-441a-bffd-5daabdb1cdd6
--   image-quenya-1x                -> 653a9f81-0530-4583-96f2-a2ce2b141b81
--   image-quenya-2x                -> b98779bd-c771-4e67-9ae3-690a056308db
--   listing-en-us                  -> 3408f301-0bcd-41e0-8ff9-2289f471b3f1
--   listing-es-419                 -> 327b54d2-1bb5-41b4-9363-7be46be4cb18
--   listing-hawaiian-pidgin-en-us  -> c3545dd6-eb69-4991-8b2b-686bb5ea2ac6
--   listing-hawaiian-pidgin-hwc    -> add8f383-4b7b-4943-9fcc-163a5b3a5b38
--   listing-klingon-en-us          -> 52f88c9d-50d7-40c2-a422-6382a9b130f5
--   listing-klingon-tlh            -> 176f7bbb-f09c-4fb5-bb12-91d1c0fb7ebd
--   listing-quenya-en-us           -> 111f3554-6da2-4d29-a281-2da7ad570eda
--   listing-quenya-qya             -> 6b988324-c1dc-462d-90ca-807404fe25b5
--   name-domdom                    -> 2f494102-c253-4828-8cc5-b7e5d0e753d2
--   name-gumasi                    -> 49ac100c-a5f2-4639-bc1a-bbbb73c0e4b1
--   name-gumasila                  -> 045da924-4525-47b0-9f90-87b68a3bec3f
--   name-gumawana                  -> 05259bde-3cac-4f7c-8892-f3b0a964cc0c
--   name-hawaii-creole             -> 170e5060-617c-4b74-a752-a9b4724e9da3
--   name-hawaiian-pidgin           -> d63ae4d3-8337-4cd6-a2e8-772ec944b472
--   name-hce                       -> a61ee714-c27e-469b-b410-a83ffd07510c
--   name-high-elven                -> df464c26-e700-4fbc-a152-be65e6fcd9c5
--   name-klingon                   -> 14af0a04-a773-4126-9ad4-0d9f16382327
--   name-klingonese                -> f49cdb09-7c10-47d7-9ad3-5822b380fe93
--   name-pidgin                    -> 896b428e-0a05-40bb-8881-db655944bf28
--   name-quenya                    -> ddc59fc4-b683-4ea8-8063-adef3b12b887
--   name-quenya-elvish             -> 4df68dad-1773-4464-815e-bdaa08f8aaf0
--   name-tlh                       -> dd404975-4afb-43f0-b17c-c02534cd2147
--   pkg-gumawana                   -> 3ea08f42-46e4-441d-bb24-1d15774ec72c
--   pkg-hawaiian-pidgin            -> 4bed7d4e-4a05-4f80-940c-c0389a84d2d1
--   pkg-klingon                    -> 4e3ecd61-0278-4ad3-9c63-1733988589a5
--   pkg-quenya-elvish              -> c38eac5c-0bbc-45b2-9180-5184f8bfb364
--   status-gumawana-pending        -> 60a4dfca-ea8d-4f10-aaaf-5b394613dc55
--   status-hawaiian-pidgin-pending -> b4978aea-c30d-4811-8af1-dafed98d2773
--   status-klingon-pending         -> 65f4c983-0296-49ea-ba8c-6ec22cd034f2
--   status-quenya-active           -> f2ab7a88-c3a0-4722-8564-77082da3e2ac
--   status-quenya-pending          -> 1dfac832-fc2f-4528-b7cd-be5afe4cb3ad
--   usr-demo-admin                 -> e5545a27-016d-4bbd-9c1c-6de66782b4cc

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
  'e5545a27-016d-4bbd-9c1c-6de66782b4cc',
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
  '3ea08f42-46e4-441d-bb24-1d15774ec72c',
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
    'c38eac5c-0bbc-45b2-9180-5184f8bfb364',
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
    '4e3ecd61-0278-4ad3-9c63-1733988589a5',
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
    '4bed7d4e-4a05-4f80-940c-c0389a84d2d1',
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
  ('05259bde-3cac-4f7c-8892-f3b0a964cc0c', '3ea08f42-46e4-441d-bb24-1d15774ec72c', 'Gumawana', 'gumawana', 'PRIMARY'),
  ('2f494102-c253-4828-8cc5-b7e5d0e753d2', '3ea08f42-46e4-441d-bb24-1d15774ec72c', 'Domdom', 'domdom', 'ALTERNATE'),
  ('49ac100c-a5f2-4639-bc1a-bbbb73c0e4b1', '3ea08f42-46e4-441d-bb24-1d15774ec72c', 'Gumasi', 'gumasi', 'ALTERNATE'),
  ('045da924-4525-47b0-9f90-87b68a3bec3f', '3ea08f42-46e4-441d-bb24-1d15774ec72c', 'Gumasila', 'gumasila', 'ALTERNATE'),
  ('4df68dad-1773-4464-815e-bdaa08f8aaf0', 'c38eac5c-0bbc-45b2-9180-5184f8bfb364', 'Quenya Elvish', 'quenya elvish', 'PRIMARY'),
  ('ddc59fc4-b683-4ea8-8063-adef3b12b887', 'c38eac5c-0bbc-45b2-9180-5184f8bfb364', 'Quenya', 'quenya', 'LOCAL'),
  ('df464c26-e700-4fbc-a152-be65e6fcd9c5', 'c38eac5c-0bbc-45b2-9180-5184f8bfb364', 'High Elven', 'high elven', 'ALTERNATE'),
  ('14af0a04-a773-4126-9ad4-0d9f16382327', '4e3ecd61-0278-4ad3-9c63-1733988589a5', 'Klingon', 'klingon', 'PRIMARY'),
  ('dd404975-4afb-43f0-b17c-c02534cd2147', '4e3ecd61-0278-4ad3-9c63-1733988589a5', 'tlhIngan Hol', 'tlhingan hol', 'LOCAL'),
  ('f49cdb09-7c10-47d7-9ad3-5822b380fe93', '4e3ecd61-0278-4ad3-9c63-1733988589a5', 'Klingonese', 'klingonese', 'ALTERNATE'),
  ('d63ae4d3-8337-4cd6-a2e8-772ec944b472', '4bed7d4e-4a05-4f80-940c-c0389a84d2d1', 'Hawaiian Pidgin', 'hawaiian pidgin', 'PRIMARY'),
  ('170e5060-617c-4b74-a752-a9b4724e9da3', '4bed7d4e-4a05-4f80-940c-c0389a84d2d1', 'Hawaii Creole English', 'hawaii creole english', 'IANA'),
  ('896b428e-0a05-40bb-8881-db655944bf28', '4bed7d4e-4a05-4f80-940c-c0389a84d2d1', 'Pidgin', 'pidgin', 'LOCAL'),
  ('a61ee714-c27e-469b-b410-a83ffd07510c', '4bed7d4e-4a05-4f80-940c-c0389a84d2d1', 'HCE', 'hce', 'ALTERNATE');

INSERT OR IGNORE INTO "package_listings" (
  "id", "package_id", "locale", "title", "short_description", "full_description"
) VALUES
  (
    '3408f301-0bcd-41e0-8ff9-2289f471b3f1',
    '3ea08f42-46e4-441d-bb24-1d15774ec72c',
    'en-US',
    'Gumawana Bible',
    'The Bible in Gumawana of Papua New Guinea [gvs]',
    '<b>Buki Kimaasabaina</b> The Bible in the Gumawana language.'
  ),
  (
    '327b54d2-1bb5-41b4-9363-7be46be4cb18',
    '3ea08f42-46e4-441d-bb24-1d15774ec72c',
    'es-419',
    'Biblia Gumawana',
    'La Biblia en Gumawana de Papua Nueva Guinea [gvs]',
    '<b>Buki Kimaasabaina</b> La Biblia en el idioma Gumawana.'
  ),
  (
    '111f3554-6da2-4d29-a281-2da7ad570eda',
    'c38eac5c-0bbc-45b2-9180-5184f8bfb364',
    'en-US',
    'Quenya Elvish Demo Bible',
    'Sample package for Quenya Elvish discovery testing [qya]',
    '<b>Quenya Elvish Demo</b> Representative sample content for search, listing, and approval workflows.'
  ),
  (
    '6b988324-c1dc-462d-90ca-807404fe25b5',
    'c38eac5c-0bbc-45b2-9180-5184f8bfb364',
    'qya-Latn',
    'Parma Quenya',
    'A demo listing for Quenya Elvish sample data [qya]',
    '<b>Parma Quenya</b> Sample localized listing for the Elvish data path.'
  ),
  (
    '52f88c9d-50d7-40c2-a422-6382a9b130f5',
    '4e3ecd61-0278-4ad3-9c63-1733988589a5',
    'en-US',
    'Klingon Demo Bible',
    'Sample package for Klingon discovery testing [tlh]',
    '<b>Klingon Demo</b> Representative sample content for pending review workflows.'
  ),
  (
    '176f7bbb-f09c-4fb5-bb12-91d1c0fb7ebd',
    '4e3ecd61-0278-4ad3-9c63-1733988589a5',
    'tlh-Latn',
    'tlhIngan Hol Demo',
    'A demo listing for Klingon sample data [tlh]',
    '<b>tlhIngan Hol Demo</b> Sample localized listing for the Klingon data path.'
  ),
  (
    'c3545dd6-eb69-4991-8b2b-686bb5ea2ac6',
    '4bed7d4e-4a05-4f80-940c-c0389a84d2d1',
    'en-US',
    'Hawaiian Pidgin Demo Bible',
    'Sample package for Hawaiian Pidgin discovery testing [hwc]',
    '<b>Hawaiian Pidgin Demo</b> Representative sample content for review and discovery workflows.'
  ),
  (
    'add8f383-4b7b-4943-9fcc-163a5b3a5b38',
    '4bed7d4e-4a05-4f80-940c-c0389a84d2d1',
    'hwc-Latn',
    'Da Pidgin Demo Bible',
    'One demo listing fo Hawaiian Pidgin sample data [hwc]',
    '<b>Da Pidgin Demo Bible</b> Sample localized listing for the Hawaiian Pidgin data path.'
  );

INSERT OR IGNORE INTO "package_images" (
  "id", "package_id", "scale", "source", "url"
) VALUES
  (
    '7e486251-376b-4703-acd5-f8141fece399',
    '3ea08f42-46e4-441d-bb24-1d15774ec72c',
    '1x',
    'nav_drawer.png',
    'https://app.scriptoria.io/api/products/d54c912a-979c-4fa2-9eac-164d7e2f575d/files/published/nav_drawer.png'
  ),
  (
    'ed6b0a2f-5b3d-4cdb-83fd-c0eb7cdee274',
    '3ea08f42-46e4-441d-bb24-1d15774ec72c',
    '2x',
    'nav_drawer@2x.png',
    'https://app.scriptoria.io/api/products/d54c912a-979c-4fa2-9eac-164d7e2f575d/files/published/nav_drawer@2x.png'
  ),
  (
    'bdd8999c-0613-48bd-a676-6f1c012c7bdc',
    '3ea08f42-46e4-441d-bb24-1d15774ec72c',
    '3x',
    'nav_drawer@3x.png',
    'https://app.scriptoria.io/api/products/d54c912a-979c-4fa2-9eac-164d7e2f575d/files/published/nav_drawer@3x.png'
  ),
  (
    '653a9f81-0530-4583-96f2-a2ce2b141b81',
    'c38eac5c-0bbc-45b2-9180-5184f8bfb364',
    '1x',
    'nav_drawer.png',
    'https://app.scriptoria.io/api/products/6e0c3ef8-6cc8-4600-8f1b-53c6a6f04e01/files/published/nav_drawer.png'
  ),
  (
    'b98779bd-c771-4e67-9ae3-690a056308db',
    'c38eac5c-0bbc-45b2-9180-5184f8bfb364',
    '2x',
    'nav_drawer@2x.png',
    'https://app.scriptoria.io/api/products/6e0c3ef8-6cc8-4600-8f1b-53c6a6f04e01/files/published/nav_drawer@2x.png'
  ),
  (
    '9d575fa0-1d6e-416d-b09e-7cbf6004f7e3',
    '4e3ecd61-0278-4ad3-9c63-1733988589a5',
    '1x',
    'nav_drawer.png',
    'https://app.scriptoria.io/api/products/8aee4f57-fb8f-41ac-92aa-995d648f9052/files/published/nav_drawer.png'
  ),
  (
    'baa7fad4-7450-441a-bffd-5daabdb1cdd6',
    '4e3ecd61-0278-4ad3-9c63-1733988589a5',
    '2x',
    'nav_drawer@2x.png',
    'https://app.scriptoria.io/api/products/8aee4f57-fb8f-41ac-92aa-995d648f9052/files/published/nav_drawer@2x.png'
  ),
  (
    'c3e14251-9908-4590-935c-fc85ab1f9fb2',
    '4bed7d4e-4a05-4f80-940c-c0389a84d2d1',
    '1x',
    'nav_drawer.png',
    'https://app.scriptoria.io/api/products/d037e9c4-4efa-4dd4-911f-b6825f5efaf8/files/published/nav_drawer.png'
  ),
  (
    '5901b756-9337-48c6-83ab-4b7e93f7f301',
    '4bed7d4e-4a05-4f80-940c-c0389a84d2d1',
    '2x',
    'nav_drawer@2x.png',
    'https://app.scriptoria.io/api/products/d037e9c4-4efa-4dd4-911f-b6825f5efaf8/files/published/nav_drawer@2x.png'
  );

INSERT OR IGNORE INTO "package_status_events" (
  "id", "package_id", "from_status", "to_status", "actor_id", "reason", "created_at"
) VALUES
  (
    '60a4dfca-ea8d-4f10-aaaf-5b394613dc55',
    '3ea08f42-46e4-441d-bb24-1d15774ec72c',
    NULL,
    'PENDING',
    NULL,
    'Representative Scriptoria notification received',
    '2026-07-11T00:00:00.000Z'
  ),
  (
    '1dfac832-fc2f-4528-b7cd-be5afe4cb3ad',
    'c38eac5c-0bbc-45b2-9180-5184f8bfb364',
    NULL,
    'PENDING',
    NULL,
    'Sample Elvish notification received',
    '2026-07-11T00:00:00.000Z'
  ),
  (
    'f2ab7a88-c3a0-4722-8564-77082da3e2ac',
    'c38eac5c-0bbc-45b2-9180-5184f8bfb364',
    'PENDING',
    'ACTIVE',
    'e5545a27-016d-4bbd-9c1c-6de66782b4cc',
    'Approved sample Elvish package for discovery testing',
    '2026-07-11T00:05:00.000Z'
  ),
  (
    '65f4c983-0296-49ea-ba8c-6ec22cd034f2',
    '4e3ecd61-0278-4ad3-9c63-1733988589a5',
    NULL,
    'PENDING',
    NULL,
    'Sample Klingon notification received',
    '2026-07-11T00:00:00.000Z'
  ),
  (
    'b4978aea-c30d-4811-8af1-dafed98d2773',
    '4bed7d4e-4a05-4f80-940c-c0389a84d2d1',
    NULL,
    'PENDING',
    NULL,
    'Sample Hawaiian Pidgin notification received',
    '2026-07-11T00:00:00.000Z'
  );
