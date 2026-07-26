import { fail, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { createPrisma } from '$lib/server/db';
import { listPackagesByStatus, moderatePackage } from '$lib/server/packages';
import { requireEnv } from '$lib/server/platform';
import { moderationActionSchema, packageStatuses } from '$lib/validation';

export const load: PageServerLoad = async (event) => {
  const env = requireEnv(event);
  const selected = v.parse(
    v.optional(v.picklist(packageStatuses), 'PENDING'),
    event.url.searchParams.get('status') ?? undefined
  );

  const prisma = createPrisma(env.DB);
  try {
    const counts: Record<string, number> = {};
    for (const status of packageStatuses) {
      counts[status] = await prisma.package.count({ where: { status } });
    }
    const packages = await listPackagesByStatus(prisma, selected);
    return { selected, counts, packages };
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
};

export const actions: Actions = {
  moderate: async (event) => {
    if (!event.locals.administratorId) throw redirect(302, '/login');

    const data = await event.request.formData();
    let input;
    try {
      input = v.parse(moderationActionSchema, {
        id: data.get('id'),
        status: data.get('status'),
        reason: data.get('reason') || undefined
      });
    } catch (cause) {
      if (cause instanceof v.ValiError) {
        return fail(400, { error: 'Invalid moderation request' });
      }
      throw cause;
    }

    const env = requireEnv(event);
    const prisma = createPrisma(env.DB);
    try {
      const result = await moderatePackage(env.DB, prisma, {
        id: input.id,
        toStatus: input.status,
        reason: input.reason,
        administratorId: event.locals.administratorId
      });
      if (!result.ok) {
        return fail(result.httpStatus, { error: result.message });
      }
      return { success: true, message: `Package ${input.status.toLowerCase()}.` };
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  }
};
