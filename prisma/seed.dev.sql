-- DEVELOPMENT ONLY. Do not apply this file to staging or production.
--
-- Local administrator credentials:
--   email:    admin@example.invalid
--   password: demo-password-123
--
-- Slug -> UUIDv4 mapping (ids below were substituted from these human-readable
-- placeholders so re-seeding stays idempotent; kept here for debugging readability).
-- pkg-hawaiian-pidgin and pkg-klingon reuse the same UUIDs assigned in seed.sql,
-- since INSERT OR IGNORE relies on matching primary keys to stay idempotent.
--   image-fra-1x        -> e9fbfd6a-5689-41c3-8ed2-937a3c1ef06f
--   image-hwc-1x        -> aef6a515-88d4-4052-9a53-108ac9106ef5
--   image-iku-1x        -> 414affa4-cd99-4faf-b16d-691c4b9225f4
--   image-kin-1x        -> f4c28df6-a2c7-4d73-bd4f-e1156541281d
--   image-lat-1x        -> de7a48b8-8653-4da4-a714-6fd3bd8afac2
--   image-por-1x        -> 84f21e53-998a-4247-a9ea-cddbff90efa2
--   image-quz-1x        -> 1c09812a-a1fb-48e3-8936-1e83bb44c7c4
--   image-spa-1x        -> 506f0fc1-f85d-4279-a59f-f36300140de8
--   image-swh-1x        -> 1f2716ba-5ea4-4bb8-b922-3075a71db52e
--   image-tlh-1x        -> e52ce8f3-6c98-44f7-afa9-32df07565b72
--   image-tpi-1x        -> 64334f9c-716a-41f1-9dde-cdaadecd51ee
--   listing-fra-en      -> 73bcdde1-4d1b-4be4-8a49-f6ff1506c651
--   listing-hwc-en      -> f506099e-4026-436a-86e8-25ef43d9d23d
--   listing-iku-en      -> 25b98d33-6204-4959-99a3-625c8360e320
--   listing-kin-en      -> 5f5a88cc-03e9-4e7d-a403-0197dc8e22f6
--   listing-lat-en      -> 5aab3118-4310-4906-ad76-545e16f39545
--   listing-por-en      -> 5753d886-351f-4af2-848d-26a60145c7e5
--   listing-quz-en      -> be7ad634-8029-4740-b355-6ebe13653b06
--   listing-spa-en      -> 8d22cb23-c44b-499b-bd2f-51f23f48307c
--   listing-swh-en      -> e61e2dc0-a827-4342-b4e3-82238a60dcfc
--   listing-tlh-en      -> 9815110e-6858-4325-94fc-0d48f789aaad
--   listing-tpi-en      -> aec54fdb-cfaf-4dd2-a288-4742e97398be
--   name-fra-local      -> 934a63c2-e5c5-49e2-a991-19e787179190
--   name-fra-primary    -> 147c0aaf-a404-4290-a6bc-48a94fdabc87
--   name-hwc-local      -> 9971388b-56be-4187-b6ab-7b448b32a35b
--   name-hwc-primary    -> fa104668-fcfa-48bc-b908-336616a0140d
--   name-iku-local      -> b6d1260c-8fdb-40a5-b550-5065d4b50434
--   name-iku-primary    -> b4ec6ca7-3d31-497a-a203-6c6b795bffa5
--   name-kin-local      -> 2d8504ec-021a-467f-ab22-28cbf6fb4c16
--   name-kin-primary    -> 018267df-4798-4b9f-a0a6-cc67f9485aee
--   name-lat-local      -> 995ee102-e1d6-4e8a-8616-8b225a0faed8
--   name-lat-primary    -> 17620018-e0d7-4b77-8aab-a8cfc2eb2688
--   name-por-local      -> d3476b6e-e9b9-4989-af3f-c8afdba133a2
--   name-por-primary    -> b25f9b66-f0ce-49c2-8dae-065f8b68c30c
--   name-quz-local      -> 20a9a586-942e-4a06-9497-146a81950ddd
--   name-quz-primary    -> f26b4b92-5904-4652-924b-3b7a90f9e508
--   name-spa-local      -> 1c01edb8-5351-4eb4-b2d9-444ba9f62cb5
--   name-spa-primary    -> e146a66b-b48a-4ad9-bea8-62d68c6b320b
--   name-swh-local      -> 0723013c-3db0-4cd6-8a15-919a2cacf89f
--   name-swh-primary    -> 310abaf5-14cc-4f1d-aed7-30caedc1f09f
--   name-tlh-local      -> a4208394-db35-40cc-af1a-78af2cc7f38b
--   name-tlh-primary    -> 05fa97ff-4165-4906-9998-4cd59c991846
--   name-tpi-alt        -> d47b90b7-cb14-46d9-a65e-530138fabee6
--   name-tpi-primary    -> 842ddff2-829f-42b4-9989-9b05e79b8a3b
--   pkg-french          -> 374fc194-1f3c-42fc-8213-3365a5951698
--   pkg-hawaiian-pidgin -> 4bed7d4e-4a05-4f80-940c-c0389a84d2d1
--   pkg-inuktitut       -> ed75c8ca-aa5e-4dc9-b4b2-d402e9101b02
--   pkg-kinyarwanda     -> 43218dc8-58c2-4084-a52c-5dc0323ed550
--   pkg-klingon         -> 4e3ecd61-0278-4ad3-9c63-1733988589a5
--   pkg-latin           -> dfa62eb9-cfc6-4412-b973-0a352cddd215
--   pkg-portuguese-br   -> b09a3149-f575-42ed-9787-b2145c65a165
--   pkg-quechua-cusco   -> 2b2fab8d-fd20-488d-bb0d-cc29a4498769
--   pkg-spanish-latam   -> ef496480-d8b3-4e76-a45a-0ac7c9e4b179
--   pkg-swahili         -> e83dcc39-8705-4da0-9f14-40ad50f2d606
--   pkg-tok-pisin       -> 8c385fe6-51d9-43db-a535-9ddc72b57e0c
--   status-fra-active   -> 4325a530-fce4-43eb-be63-2b5e327db0dc
--   status-fra-inactive -> 1c763790-29c2-4087-8f77-a66b224b9c9b
--   status-fra-pending  -> 895e0b5a-a953-477c-92b4-dbb2b0816195
--   status-hwc-active   -> 6cb5cf30-813a-4581-b4e1-c50ab2751ed0
--   status-hwc-pending  -> aa0247bc-a6d8-49ea-b82e-9859db8368f1
--   status-iku-active   -> 8c421119-d686-48d8-9c7d-e4a52b6e5eb4
--   status-iku-pending  -> 5e7df756-8642-4c71-bea6-4078fed0ae06
--   status-kin-active   -> 4ea3438e-cb68-4d21-9f59-a54d797bbfe4
--   status-kin-pending  -> cf7a3a4f-8710-4491-a812-cb4fd0023db9
--   status-lat-pending  -> 4974c0aa-f37b-4b3c-9e84-ca7805a1f60b
--   status-lat-rejected -> 61832cd7-0824-474f-9eb3-d747f92f0e06
--   status-por-pending  -> 7bb5bcc3-57c5-4f50-a68b-665ab26fbb79
--   status-quz-active   -> ace424a8-e5a1-4b93-bd73-43ff05021912
--   status-quz-pending  -> dddee608-6567-41ba-9ac9-0d41c2cff069
--   status-spa-active   -> ad57380c-6456-4fb6-b13f-6e71d1b96bd1
--   status-spa-inactive -> 74559a14-86a0-4b82-8035-afa18d81f86d
--   status-spa-pending  -> eb950999-0766-4a32-9490-f34615cc4ff4
--   status-swh-pending  -> 70669b0a-00b3-4db7-ac11-31e5939871eb
--   status-tlh-pending  -> 989cbf17-33a5-42b4-ba4a-b0290d81a8eb
--   status-tlh-rejected -> ec929b43-4d14-4f34-b7c2-f769b430246a
--   status-tpi-pending  -> d97c25b7-e33c-4c8c-a0df-cfd24aa1794d
--   usr-dev-admin       -> 2c4bccd8-d7ca-43e5-9ada-4103aef53aae

INSERT INTO "administrators" (
  "id",
  "email",
  "display_name",
  "password_hash",
  "disabled",
  "created_at",
  "updated_at"
) VALUES (
  '2c4bccd8-d7ca-43e5-9ada-4103aef53aae',
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
    '4bed7d4e-4a05-4f80-940c-c0389a84d2d1', 'mock-product-hwc',
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
    '43218dc8-58c2-4084-a52c-5dc0323ed550', 'mock-product-kin',
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
    'ed75c8ca-aa5e-4dc9-b4b2-d402e9101b02', 'mock-product-iku',
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
    '2b2fab8d-fd20-488d-bb0d-cc29a4498769', 'mock-product-quz',
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
    '8c385fe6-51d9-43db-a535-9ddc72b57e0c', 'mock-product-tpi',
    'https://scriptoria.example.invalid/projects/tpi', 'tpi Tok Pisin', NULL,
    'https://downloads.example.invalid/tpi-bible.zip',
    'https://scriptoria.example.invalid/products/tpi', 16442000,
    'scripture-app-builder', '9.4', 'tpi-Latn-PG', 'tpi', 'Tok Pisin',
    'PG', 'Papua New Guinea', 'Latn', 1, 'tpi-Latn',
    'https://images.example.invalid/tpi', 'PENDING', NULL, NULL, NULL,
    '2026-07-12T13:35:00.000Z', '2026-07-12T13:35:00.000Z', '2026-07-12T13:35:00.000Z'
  ),
  (
    'e83dcc39-8705-4da0-9f14-40ad50f2d606', 'mock-product-swh',
    'https://scriptoria.example.invalid/projects/swh', 'swh Swahili', NULL,
    'https://downloads.example.invalid/swh-bible.zip',
    'https://scriptoria.example.invalid/products/swh', 20811000,
    'scripture-app-builder', '9.4', 'sw-Latn-KE', 'swh', 'Kiswahili',
    'KE', 'Kenya', 'Latn', 1, 'sw-Latn',
    'https://images.example.invalid/swh', 'PENDING', NULL, NULL, NULL,
    '2026-07-12T12:20:00.000Z', '2026-07-12T12:20:00.000Z', '2026-07-12T12:20:00.000Z'
  ),
  (
    'b09a3149-f575-42ed-9787-b2145c65a165', 'mock-product-por-br',
    'https://scriptoria.example.invalid/projects/por-br', 'por Brazilian Portuguese', NULL,
    'https://downloads.example.invalid/por-br-bible.zip',
    'https://scriptoria.example.invalid/products/por-br', 25904000,
    'scripture-app-builder', '9.4', 'pt-BR', 'por', 'Português do Brasil',
    'BR', 'Brazil', 'Latn', 1, 'pt-BR',
    'https://images.example.invalid/por-br', 'PENDING', NULL, NULL, NULL,
    '2026-07-12T11:05:00.000Z', '2026-07-12T11:05:00.000Z', '2026-07-12T11:05:00.000Z'
  ),
  (
    '4e3ecd61-0278-4ad3-9c63-1733988589a5', 'mock-product-tlh',
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
    'dfa62eb9-cfc6-4412-b973-0a352cddd215', 'mock-product-lat',
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
    'ef496480-d8b3-4e76-a45a-0ac7c9e4b179', 'mock-product-spa-419',
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
    '374fc194-1f3c-42fc-8213-3365a5951698', 'mock-product-fra',
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
  ('fa104668-fcfa-48bc-b908-336616a0140d', '4bed7d4e-4a05-4f80-940c-c0389a84d2d1', 'Hawaiian Pidgin', 'hawaiian pidgin', 'PRIMARY'),
  ('9971388b-56be-4187-b6ab-7b448b32a35b', '4bed7d4e-4a05-4f80-940c-c0389a84d2d1', 'Hawaiʻi Creole English', 'hawaii creole english', 'ALTERNATE'),
  ('018267df-4798-4b9f-a0a6-cc67f9485aee', '43218dc8-58c2-4084-a52c-5dc0323ed550', 'Kinyarwanda', 'kinyarwanda', 'PRIMARY'),
  ('2d8504ec-021a-467f-ab22-28cbf6fb4c16', '43218dc8-58c2-4084-a52c-5dc0323ed550', 'Ikinyarwanda', 'ikinyarwanda', 'LOCAL'),
  ('b4ec6ca7-3d31-497a-a203-6c6b795bffa5', 'ed75c8ca-aa5e-4dc9-b4b2-d402e9101b02', 'Eastern Canadian Inuktitut', 'eastern canadian inuktitut', 'PRIMARY'),
  ('b6d1260c-8fdb-40a5-b550-5065d4b50434', 'ed75c8ca-aa5e-4dc9-b4b2-d402e9101b02', 'Inuktitut', 'inuktitut', 'LOCAL'),
  ('f26b4b92-5904-4652-924b-3b7a90f9e508', '2b2fab8d-fd20-488d-bb0d-cc29a4498769', 'Cusco Quechua', 'cusco quechua', 'PRIMARY'),
  ('20a9a586-942e-4a06-9497-146a81950ddd', '2b2fab8d-fd20-488d-bb0d-cc29a4498769', 'Runasimi', 'runasimi', 'LOCAL'),
  ('842ddff2-829f-42b4-9989-9b05e79b8a3b', '8c385fe6-51d9-43db-a535-9ddc72b57e0c', 'Tok Pisin', 'tok pisin', 'PRIMARY'),
  ('d47b90b7-cb14-46d9-a65e-530138fabee6', '8c385fe6-51d9-43db-a535-9ddc72b57e0c', 'New Guinea Pidgin', 'new guinea pidgin', 'ALTERNATE'),
  ('310abaf5-14cc-4f1d-aed7-30caedc1f09f', 'e83dcc39-8705-4da0-9f14-40ad50f2d606', 'Swahili', 'swahili', 'PRIMARY'),
  ('0723013c-3db0-4cd6-8a15-919a2cacf89f', 'e83dcc39-8705-4da0-9f14-40ad50f2d606', 'Kiswahili', 'kiswahili', 'LOCAL'),
  ('b25f9b66-f0ce-49c2-8dae-065f8b68c30c', 'b09a3149-f575-42ed-9787-b2145c65a165', 'Brazilian Portuguese', 'brazilian portuguese', 'PRIMARY'),
  ('d3476b6e-e9b9-4989-af3f-c8afdba133a2', 'b09a3149-f575-42ed-9787-b2145c65a165', 'Português do Brasil', 'portugues do brasil', 'LOCAL'),
  ('05fa97ff-4165-4906-9998-4cd59c991846', '4e3ecd61-0278-4ad3-9c63-1733988589a5', 'Klingon', 'klingon', 'PRIMARY'),
  ('a4208394-db35-40cc-af1a-78af2cc7f38b', '4e3ecd61-0278-4ad3-9c63-1733988589a5', 'tlhIngan Hol', 'tlhingan hol', 'LOCAL'),
  ('17620018-e0d7-4b77-8aab-a8cfc2eb2688', 'dfa62eb9-cfc6-4412-b973-0a352cddd215', 'Latin', 'latin', 'PRIMARY'),
  ('995ee102-e1d6-4e8a-8616-8b225a0faed8', 'dfa62eb9-cfc6-4412-b973-0a352cddd215', 'Latina', 'latina', 'LOCAL'),
  ('e146a66b-b48a-4ad9-bea8-62d68c6b320b', 'ef496480-d8b3-4e76-a45a-0ac7c9e4b179', 'Latin American Spanish', 'latin american spanish', 'PRIMARY'),
  ('1c01edb8-5351-4eb4-b2d9-444ba9f62cb5', 'ef496480-d8b3-4e76-a45a-0ac7c9e4b179', 'Español latinoamericano', 'espanol latinoamericano', 'LOCAL'),
  ('147c0aaf-a404-4290-a6bc-48a94fdabc87', '374fc194-1f3c-42fc-8213-3365a5951698', 'French', 'french', 'PRIMARY'),
  ('934a63c2-e5c5-49e2-a991-19e787179190', '374fc194-1f3c-42fc-8213-3365a5951698', 'Français', 'francais', 'LOCAL');

INSERT OR IGNORE INTO "package_listings" (
  "id", "package_id", "locale", "title", "short_description", "full_description"
) VALUES
  ('f506099e-4026-436a-86e8-25ef43d9d23d', '4bed7d4e-4a05-4f80-940c-c0389a84d2d1', 'en-US', 'Da Bible', 'Scripture in Hawaiian Pidgin [hwc]', 'Read and listen to Scripture in Hawaiian Pidgin.'),
  ('5f5a88cc-03e9-4e7d-a403-0197dc8e22f6', '43218dc8-58c2-4084-a52c-5dc0323ed550', 'en-US', 'Kinyarwanda Bible', 'Scripture in Kinyarwanda [kin]', 'The Bible in the Kinyarwanda language of Rwanda.'),
  ('25b98d33-6204-4959-99a3-625c8360e320', 'ed75c8ca-aa5e-4dc9-b4b2-d402e9101b02', 'en-CA', 'Inuktitut Bible', 'Scripture in Eastern Canadian Inuktitut [iku]', 'Scripture presented in Canadian Aboriginal syllabics.'),
  ('be7ad634-8029-4740-b355-6ebe13653b06', '2b2fab8d-fd20-488d-bb0d-cc29a4498769', 'en-US', 'Cusco Quechua Bible', 'Scripture in Cusco Quechua [quz]', 'The Bible in Runasimi from the Cusco region of Peru.'),
  ('aec54fdb-cfaf-4dd2-a288-4742e97398be', '8c385fe6-51d9-43db-a535-9ddc72b57e0c', 'en-US', 'Tok Pisin Bible', 'Scripture in Tok Pisin [tpi]', 'A new package awaiting administrator review.'),
  ('e61e2dc0-a827-4342-b4e3-82238a60dcfc', 'e83dcc39-8705-4da0-9f14-40ad50f2d606', 'en-US', 'Kiswahili Bible', 'Scripture in Swahili [swh]', 'A Swahili Scripture package for East Africa.'),
  ('5753d886-351f-4af2-848d-26a60145c7e5', 'b09a3149-f575-42ed-9787-b2145c65a165', 'en-US', 'Bíblia em Português', 'Scripture in Brazilian Portuguese [por]', 'A Brazilian Portuguese Scripture package.'),
  ('9815110e-6858-4325-94fc-0d48f789aaad', '4e3ecd61-0278-4ad3-9c63-1733988589a5', 'en-US', 'Klingon Scripture Demo', 'Unverified demonstration package [tlh]', 'This mock package demonstrates a rejected review state.'),
  ('5aab3118-4310-4906-ad76-545e16f39545', 'dfa62eb9-cfc6-4412-b973-0a352cddd215', 'en-US', 'Biblia Latina', 'Scripture in Latin [lat]', 'This mock package requires corrected metadata before approval.'),
  ('8d22cb23-c44b-499b-bd2f-51f23f48307c', 'ef496480-d8b3-4e76-a45a-0ac7c9e4b179', 'en-US', 'Biblia en Español', 'Scripture in Latin American Spanish [spa]', 'This version was replaced by a newer package.'),
  ('73bcdde1-4d1b-4be4-8a49-f6ff1506c651', '374fc194-1f3c-42fc-8213-3365a5951698', 'en-US', 'Bible en français', 'Scripture in French [fra]', 'This package has been withdrawn from the public catalogue.');

INSERT OR IGNORE INTO "package_images" (
  "id", "package_id", "scale", "source", "url"
) VALUES
  ('aef6a515-88d4-4052-9a53-108ac9106ef5', '4bed7d4e-4a05-4f80-940c-c0389a84d2d1', '1x', 'app-icon.png', 'https://images.example.invalid/hwc/app-icon.png'),
  ('f4c28df6-a2c7-4d73-bd4f-e1156541281d', '43218dc8-58c2-4084-a52c-5dc0323ed550', '1x', 'app-icon.png', 'https://images.example.invalid/kin/app-icon.png'),
  ('414affa4-cd99-4faf-b16d-691c4b9225f4', 'ed75c8ca-aa5e-4dc9-b4b2-d402e9101b02', '1x', 'app-icon.png', 'https://images.example.invalid/iku/app-icon.png'),
  ('1c09812a-a1fb-48e3-8936-1e83bb44c7c4', '2b2fab8d-fd20-488d-bb0d-cc29a4498769', '1x', 'app-icon.png', 'https://images.example.invalid/quz/app-icon.png'),
  ('64334f9c-716a-41f1-9dde-cdaadecd51ee', '8c385fe6-51d9-43db-a535-9ddc72b57e0c', '1x', 'app-icon.png', 'https://images.example.invalid/tpi/app-icon.png'),
  ('1f2716ba-5ea4-4bb8-b922-3075a71db52e', 'e83dcc39-8705-4da0-9f14-40ad50f2d606', '1x', 'app-icon.png', 'https://images.example.invalid/swh/app-icon.png'),
  ('84f21e53-998a-4247-a9ea-cddbff90efa2', 'b09a3149-f575-42ed-9787-b2145c65a165', '1x', 'app-icon.png', 'https://images.example.invalid/por-br/app-icon.png'),
  ('e52ce8f3-6c98-44f7-afa9-32df07565b72', '4e3ecd61-0278-4ad3-9c63-1733988589a5', '1x', 'app-icon.png', 'https://images.example.invalid/tlh/app-icon.png'),
  ('de7a48b8-8653-4da4-a714-6fd3bd8afac2', 'dfa62eb9-cfc6-4412-b973-0a352cddd215', '1x', 'app-icon.png', 'https://images.example.invalid/lat/app-icon.png'),
  ('506f0fc1-f85d-4279-a59f-f36300140de8', 'ef496480-d8b3-4e76-a45a-0ac7c9e4b179', '1x', 'app-icon.png', 'https://images.example.invalid/spa-419/app-icon.png'),
  ('e9fbfd6a-5689-41c3-8ed2-937a3c1ef06f', '374fc194-1f3c-42fc-8213-3365a5951698', '1x', 'app-icon.png', 'https://images.example.invalid/fra/app-icon.png');

-- Every package starts as pending. Additional events below show how reviewed
-- packages arrived at their current state.
INSERT OR IGNORE INTO "package_status_events" (
  "id", "package_id", "from_status", "to_status", "actor_id", "reason", "created_at"
) VALUES ('aa0247bc-a6d8-49ea-b82e-9859db8368f1', '4bed7d4e-4a05-4f80-940c-c0389a84d2d1', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-10T14:30:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('cf7a3a4f-8710-4491-a812-cb4fd0023db9', '43218dc8-58c2-4084-a52c-5dc0323ed550', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-09T10:00:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('5e7df756-8642-4c71-bea6-4078fed0ae06', 'ed75c8ca-aa5e-4dc9-b4b2-d402e9101b02', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-08T15:00:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('dddee608-6567-41ba-9ac9-0d41c2cff069', '2b2fab8d-fd20-488d-bb0d-cc29a4498769', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-07T12:10:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('d97c25b7-e33c-4c8c-a0df-cfd24aa1794d', '8c385fe6-51d9-43db-a535-9ddc72b57e0c', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-12T13:35:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('70669b0a-00b3-4db7-ac11-31e5939871eb', 'e83dcc39-8705-4da0-9f14-40ad50f2d606', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-12T12:20:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('7bb5bcc3-57c5-4f50-a68b-665ab26fbb79', 'b09a3149-f575-42ed-9787-b2145c65a165', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-12T11:05:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('989cbf17-33a5-42b4-ba4a-b0290d81a8eb', '4e3ecd61-0278-4ad3-9c63-1733988589a5', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-11T14:50:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('4974c0aa-f37b-4b3c-9e84-ca7805a1f60b', 'dfa62eb9-cfc6-4412-b973-0a352cddd215', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-10T08:45:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('eb950999-0766-4a32-9490-f34615cc4ff4', 'ef496480-d8b3-4e76-a45a-0ac7c9e4b179', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-05T10:15:00.000Z');
INSERT OR IGNORE INTO "package_status_events" VALUES ('895e0b5a-a953-477c-92b4-dbb2b0816195', '374fc194-1f3c-42fc-8213-3365a5951698', NULL, 'PENDING', NULL, 'Mock Scriptoria notification received', '2026-07-03T09:10:00.000Z');

INSERT OR IGNORE INTO "package_status_events" (
  "id", "package_id", "from_status", "to_status", "actor_id", "reason", "created_at"
)
SELECT '6cb5cf30-813a-4581-b4e1-c50ab2751ed0', '4bed7d4e-4a05-4f80-940c-c0389a84d2d1', 'PENDING', 'ACTIVE', "id", 'Metadata and package verified', '2026-07-10T15:10:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
INSERT OR IGNORE INTO "package_status_events" SELECT '4ea3438e-cb68-4d21-9f59-a54d797bbfe4', '43218dc8-58c2-4084-a52c-5dc0323ed550', 'PENDING', 'ACTIVE', "id", 'Metadata and package verified', '2026-07-09T11:45:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
INSERT OR IGNORE INTO "package_status_events" SELECT '8c421119-d686-48d8-9c7d-e4a52b6e5eb4', 'ed75c8ca-aa5e-4dc9-b4b2-d402e9101b02', 'PENDING', 'ACTIVE', "id", 'Metadata and package verified', '2026-07-08T16:25:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
INSERT OR IGNORE INTO "package_status_events" SELECT 'ace424a8-e5a1-4b93-bd73-43ff05021912', '2b2fab8d-fd20-488d-bb0d-cc29a4498769', 'PENDING', 'ACTIVE', "id", 'Metadata and package verified', '2026-07-07T13:20:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
INSERT OR IGNORE INTO "package_status_events" SELECT 'ec929b43-4d14-4f34-b7c2-f769b430246a', '4e3ecd61-0278-4ad3-9c63-1733988589a5', 'PENDING', 'REJECTED', "id", 'Rights and source materials could not be verified', '2026-07-11T15:40:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
INSERT OR IGNORE INTO "package_status_events" SELECT '61832cd7-0824-474f-9eb3-d747f92f0e06', 'dfa62eb9-cfc6-4412-b973-0a352cddd215', 'PENDING', 'REJECTED', "id", 'Package metadata is incomplete', '2026-07-10T09:30:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
INSERT OR IGNORE INTO "package_status_events" SELECT 'ad57380c-6456-4fb6-b13f-6e71d1b96bd1', 'ef496480-d8b3-4e76-a45a-0ac7c9e4b179', 'PENDING', 'ACTIVE', "id", 'Metadata and package verified', '2026-07-05T11:00:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
INSERT OR IGNORE INTO "package_status_events" SELECT '74559a14-86a0-4b82-8035-afa18d81f86d', 'ef496480-d8b3-4e76-a45a-0ac7c9e4b179', 'ACTIVE', 'INACTIVE', "id", 'Superseded by a newer package', '2026-07-06T17:10:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
INSERT OR IGNORE INTO "package_status_events" SELECT '4325a530-fce4-43eb-be63-2b5e327db0dc', '374fc194-1f3c-42fc-8213-3365a5951698', 'PENDING', 'ACTIVE', "id", 'Metadata and package verified', '2026-07-03T10:00:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
INSERT OR IGNORE INTO "package_status_events" SELECT '1c763790-29c2-4087-8f77-a66b224b9c9b', '374fc194-1f3c-42fc-8213-3365a5951698', 'ACTIVE', 'INACTIVE', "id", 'Publisher requested withdrawal', '2026-07-04T16:45:00.000Z' FROM "administrators" WHERE "email" = 'admin@example.invalid';
