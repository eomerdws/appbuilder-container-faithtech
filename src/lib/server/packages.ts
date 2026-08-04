import * as m from '../paraglide/messages';
import type { PackageStatus } from '../validation';
import type { DatabaseClient } from './db';

const statusLabels: Record<PackageStatus, () => string> = {
  PENDING: m.admin_status_label_pending,
  ACTIVE: m.admin_status_label_active,
  REJECTED: m.admin_status_label_rejected,
  INACTIVE: m.admin_status_label_inactive
};

export const packageInclude = {
  names: { select: { name: true, kind: true } },
  listings: {
    select: {
      locale: true,
      title: true,
      shortDescription: true,
      fullDescription: true
    }
  },
  images: { select: { scale: true, url: true } }
} as const;

export const publicPackageSelect = {
  id: true,
  projectName: true,
  publishUrl: true,
  sizeBytes: true,
  appBuilder: true,
  appBuilderVersion: true,
  languageTag: true,
  iso6393: true,
  localName: true,
  regionCode: true,
  regionName: true,
  scriptCode: true,
  status: true,
  updatedAt: true,
  ...packageInclude
} as const;

const transitions = {
  PENDING: new Set<PackageStatus>(['ACTIVE', 'REJECTED']),
  ACTIVE: new Set<PackageStatus>(['INACTIVE']),
  REJECTED: new Set<PackageStatus>(['PENDING']),
  INACTIVE: new Set<PackageStatus>(['ACTIVE', 'PENDING'])
} satisfies Record<PackageStatus, ReadonlySet<PackageStatus>>;

export function searchActivePackages(
  prisma: DatabaseClient,
  options: { q?: string; limit?: number }
) {
  const normalizedQuery = options.q
    ? options.q.normalize('NFKC').toLocaleLowerCase('und')
    : undefined;

  return prisma.package.findMany({
    where: {
      status: 'ACTIVE',
      ...(normalizedQuery
        ? {
            OR: [
              { iso6393: { contains: normalizedQuery } },
              { languageTag: { contains: normalizedQuery } },
              {
                names: {
                  some: { normalizedName: { contains: normalizedQuery } }
                }
              }
            ]
          }
        : {})
    },
    select: publicPackageSelect,
    orderBy: { localName: 'asc' },
    take: options.limit ?? 25
  });
}

export function getActivePackage(prisma: DatabaseClient, id: string) {
  return prisma.package.findFirst({
    where: { id, status: 'ACTIVE' },
    select: publicPackageSelect
  });
}

export function listPackagesByStatus(prisma: DatabaseClient, status: PackageStatus) {
  return prisma.package.findMany({
    where: { status },
    include: packageInclude,
    orderBy: { lastNotificationAt: 'desc' },
    take: 100
  });
}

export type ModerationResult =
  { ok: true; status: PackageStatus } | { ok: false; httpStatus: 400 | 404 | 409; message: string };

/**
 * Apply a moderation transition. Prisma's D1 adapter does not guarantee
 * transactions, so the status update and the append-only history event are
 * written together with D1 batch().
 */
export async function moderatePackage(
  db: D1Database,
  prisma: DatabaseClient,
  input: {
    id: string;
    toStatus: PackageStatus;
    reason?: string;
    administratorId: string;
  }
): Promise<ModerationResult> {
  const current = await prisma.package.findUnique({
    where: { id: input.id },
    select: { id: true, status: true }
  });
  if (!current) {
    return { ok: false, httpStatus: 404, message: m.admin_error_package_not_found() };
  }
  if (!transitions[current.status].has(input.toStatus)) {
    return {
      ok: false,
      httpStatus: 409,
      message: m.admin_error_invalid_transition({
        from: statusLabels[current.status](),
        to: statusLabels[input.toStatus]()
      })
    };
  }
  if (input.toStatus === 'REJECTED' && !input.reason) {
    return {
      ok: false,
      httpStatus: 400,
      message: m.admin_error_reason_required()
    };
  }

  const now = new Date().toISOString();
  const results = await db.batch([
    db
      .prepare(
        `UPDATE packages
         SET status = ?, rejection_reason = ?, reviewed_at = ?,
             reviewed_by_id = ?, updated_at = ?
         WHERE id = ? AND status = ?`
      )
      .bind(
        input.toStatus,
        input.toStatus === 'REJECTED' ? input.reason : null,
        now,
        input.administratorId,
        now,
        current.id,
        current.status
      ),
    db
      .prepare(
        `INSERT INTO package_status_events
         (id, package_id, from_status, to_status, actor_id, reason, created_at)
         SELECT ?, ?, ?, ?, ?, ?, ?
         WHERE EXISTS (
           SELECT 1 FROM packages
           WHERE id = ? AND status = ? AND reviewed_at = ?
         )`
      )
      .bind(
        crypto.randomUUID(),
        current.id,
        current.status,
        input.toStatus,
        input.administratorId,
        input.reason ?? null,
        now,
        current.id,
        input.toStatus,
        now
      )
  ]);

  if (
    !results[0]?.success ||
    results[0].meta.changes !== 1 ||
    !results[1]?.success ||
    results[1].meta.changes !== 1
  ) {
    return {
      ok: false,
      httpStatus: 409,
      message: m.admin_error_concurrent_update()
    };
  }

  return { ok: true, status: input.toStatus };
}
