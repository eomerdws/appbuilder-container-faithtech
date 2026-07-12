import * as v from "valibot";

const boundedString = (min: number, max: number) =>
  v.pipe(v.string(), v.trim(), v.minLength(min), v.maxLength(max));

const httpUrl = v.pipe(
  v.string(),
  v.url(),
  v.check(
    (value) => /^https?:$/.test(new URL(value).protocol),
    "must be an http(s) URL",
  ),
);

const boundedList = (item: v.GenericSchema<string, string>, max: number) =>
  v.optional(v.pipe(v.array(item), v.maxLength(max)), []);

export const scriptoriaNotificationSchema = v.object({
  project_url: httpUrl,
  project_name: boundedString(1, 300),
  project_repo: v.optional(boundedString(1, 2_000)),
  publish_url: httpUrl,
  permalink_url: httpUrl,
  size: v.union([
    v.string(),
    v.pipe(v.number(), v.integer(), v.minValue(0)),
  ]),
  app_builder: boundedString(1, 100),
  app_builder_version: boundedString(1, 100),
  app_lang: v.object({
    full: boundedString(1, 100),
    iana: boundedList(boundedString(1, 300), 50),
    iso639_3: v.pipe(v.string(), v.trim(), v.length(3)),
    localname: boundedString(1, 300),
    localnames: boundedList(boundedString(1, 300), 50),
    name: boundedString(1, 300),
    names: boundedList(boundedString(1, 300), 50),
    region: v.optional(boundedString(1, 20)),
    regionname: v.optional(boundedString(1, 300)),
    script: v.optional(boundedString(1, 20)),
    sldr: v.optional(v.boolean(), false),
    tag: v.optional(boundedString(1, 100)),
    tags: boundedList(boundedString(1, 100), 50),
    windows: v.optional(boundedString(1, 100)),
  }),
  image: v.optional(
    v.object({
      baseurl: httpUrl,
      files: v.pipe(
        v.array(
          v.object({
            size: boundedString(1, 20),
            src: boundedString(1, 1_000),
          }),
        ),
        v.maxLength(20),
      ),
    }),
  ),
  listing: v.pipe(
    v.array(
      v.object({
        lang: boundedString(1, 100),
        title: boundedString(1, 500),
        short_description: v.optional(v.pipe(v.string(), v.maxLength(5_000))),
        full_description: v.optional(v.pipe(v.string(), v.maxLength(100_000))),
      }),
    ),
    v.minLength(1),
    v.maxLength(50),
  ),
});

export type ScriptoriaNotification = v.InferOutput<
  typeof scriptoriaNotificationSchema
>;

type NameKind = "PRIMARY" | "LOCAL" | "ALTERNATE" | "IANA";

function normalizeName(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("und");
}

function packageNames(notification: ScriptoriaNotification) {
  const candidates: Array<{ name: string; kind: NameKind }> = [
    { name: notification.app_lang.name, kind: "PRIMARY" },
    ...notification.app_lang.localnames.map((name) => ({
      name,
      kind: "LOCAL" as const,
    })),
    ...notification.app_lang.iana.map((name) => ({
      name,
      kind: "IANA" as const,
    })),
    ...notification.app_lang.names.map((name) => ({
      name,
      kind: "ALTERNATE" as const,
    })),
  ];

  const names = new Map<string, { name: string; kind: NameKind }>();
  for (const candidate of candidates) {
    const normalizedName = normalizeName(candidate.name);
    if (!names.has(normalizedName)) {
      names.set(normalizedName, { ...candidate, name: candidate.name.trim() });
    }
  }

  return [...names.entries()].map(([normalizedName, candidate]) => ({
    ...candidate,
    normalizedName,
  }));
}

function sizeBytes(value: string | number): number {
  if (typeof value === "number") return value;

  const match = /^\s*(\d+)\}?\s*$/.exec(value);
  if (!match?.[1]) {
    throw new Error("size must contain a non-negative integer byte count");
  }

  const parsed = Number(match[1]);
  if (!Number.isSafeInteger(parsed) || parsed > 2_147_483_647) {
    throw new Error("size exceeds the supported package size");
  }
  return parsed;
}

function productId(permalinkUrl: string): string {
  const match = /\/products\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})(?:\/|$)/i.exec(
    new URL(permalinkUrl).pathname,
  );
  if (!match?.[1]) {
    throw new Error("permalink_url does not contain a valid product UUID");
  }
  return match[1].toLowerCase();
}

function imageUrl(baseUrl: string, source: string): string {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(source, base).toString();
}

export async function ingestNotification(
  database: D1Database,
  notification: ScriptoriaNotification,
) {
  const scriptoriaProductId = productId(notification.permalink_url);
  const existing = await database
    .prepare(
      "SELECT id, status, raw_notification_json FROM packages WHERE scriptoria_product_id = ?",
    )
    .bind(scriptoriaProductId)
    .first<{
      id: string;
      status: "PENDING" | "ACTIVE" | "REJECTED" | "INACTIVE";
      raw_notification_json: string;
    }>();
  const packageId = existing?.id ?? crypto.randomUUID();
  const receivedAt = new Date().toISOString();
  const rawNotificationJson = JSON.stringify(notification);

  // An identical re-send is an idempotent retry and preserves the current
  // moderation status. If the content changed, the package returns to PENDING
  // so a live (ACTIVE) package cannot be silently repointed to a new download
  // URL without re-review.
  const contentChanged =
    existing !== null && existing.raw_notification_json !== rawNotificationJson;
  const nextStatus =
    existing === null || contentChanged ? ("PENDING" as const) : existing.status;
  const requeued =
    existing !== null && contentChanged && existing.status !== "PENDING";
  const names = packageNames(notification);
  const listings = notification.listing.map((listing) => ({
    locale: listing.lang,
    title: listing.title,
    shortDescription: listing.short_description,
    fullDescription: listing.full_description,
  }));
  const images = (notification.image?.files ?? []).map((image) => ({
    scale: image.size,
    source: image.src,
    url: imageUrl(notification.image!.baseurl, image.src),
  }));
  const statements: D1PreparedStatement[] = [
    database
      .prepare(
        `INSERT INTO packages (
          id, scriptoria_product_id, project_url, project_name, project_repo,
          publish_url, permalink_url, size_bytes, app_builder,
          app_builder_version, language_tag, iso639_3, local_name, region_code,
          region_name, script_code, sldr, windows_tag, image_base_url, status,
          last_notification_at, raw_notification_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?)
        ON CONFLICT(scriptoria_product_id) DO UPDATE SET
          status = excluded.status,
          project_url = excluded.project_url,
          project_name = excluded.project_name,
          project_repo = excluded.project_repo,
          publish_url = excluded.publish_url,
          permalink_url = excluded.permalink_url,
          size_bytes = excluded.size_bytes,
          app_builder = excluded.app_builder,
          app_builder_version = excluded.app_builder_version,
          language_tag = excluded.language_tag,
          iso639_3 = excluded.iso639_3,
          local_name = excluded.local_name,
          region_code = excluded.region_code,
          region_name = excluded.region_name,
          script_code = excluded.script_code,
          sldr = excluded.sldr,
          windows_tag = excluded.windows_tag,
          image_base_url = excluded.image_base_url,
          last_notification_at = excluded.last_notification_at,
          raw_notification_json = excluded.raw_notification_json,
          updated_at = excluded.updated_at`,
      )
      .bind(
        packageId,
        scriptoriaProductId,
        notification.project_url,
        notification.project_name,
        notification.project_repo ?? null,
        notification.publish_url,
        notification.permalink_url,
        sizeBytes(notification.size),
        notification.app_builder,
        notification.app_builder_version,
        notification.app_lang.full,
        notification.app_lang.iso639_3.toLowerCase(),
        notification.app_lang.localname,
        notification.app_lang.region ?? null,
        notification.app_lang.regionname ?? null,
        notification.app_lang.script ?? null,
        notification.app_lang.sldr ? 1 : 0,
        notification.app_lang.windows ?? null,
        notification.image?.baseurl ?? null,
        nextStatus,
        receivedAt,
        rawNotificationJson,
        receivedAt,
        receivedAt,
      ),
    database
      .prepare("DELETE FROM package_names WHERE package_id = ?")
      .bind(packageId),
    database
      .prepare("DELETE FROM package_listings WHERE package_id = ?")
      .bind(packageId),
    database
      .prepare("DELETE FROM package_images WHERE package_id = ?")
      .bind(packageId),
    ...names.map((name) =>
      database
        .prepare(
          `INSERT INTO package_names
           (id, package_id, name, normalized_name, kind)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          packageId,
          name.name,
          name.normalizedName,
          name.kind,
        ),
    ),
    ...listings.map((listing) =>
      database
        .prepare(
          `INSERT INTO package_listings
           (id, package_id, locale, title, short_description, full_description)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          packageId,
          listing.locale,
          listing.title,
          listing.shortDescription ?? null,
          listing.fullDescription ?? null,
        ),
    ),
    ...images.map((image) =>
      database
        .prepare(
          `INSERT INTO package_images
           (id, package_id, scale, source, url)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          packageId,
          image.scale,
          image.source,
          image.url,
        ),
    ),
  ];

  if (!existing) {
    statements.push(
      database
        .prepare(
          `INSERT INTO package_status_events
           (id, package_id, from_status, to_status, actor_id, reason, created_at)
           VALUES (?, ?, NULL, 'PENDING', NULL, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          packageId,
          "Scriptoria notification received",
          receivedAt,
        ),
    );
  } else if (requeued) {
    statements.push(
      database
        .prepare(
          `INSERT INTO package_status_events
           (id, package_id, from_status, to_status, actor_id, reason, created_at)
           VALUES (?, ?, ?, 'PENDING', NULL, ?, ?)`,
        )
        .bind(
          crypto.randomUUID(),
          packageId,
          existing.status,
          "Re-queued for review: notification content changed",
          receivedAt,
        ),
    );
  }

  await database.batch(statements);
  return {
    id: packageId,
    scriptoriaProductId,
    status: nextStatus,
    created: existing === null,
  };
}
