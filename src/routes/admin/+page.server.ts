import { fail, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import * as m from '$lib/paraglide/messages';
import { createPrisma } from '$lib/server/db';
import { listPackagesByStatus, moderatePackage } from '$lib/server/packages';
import { requireEnv } from '$lib/server/platform';
import { moderationActionSchema, packageStatuses } from '$lib/validation';

const moderationSuccessMessages: Record<string, () => string> = {
  PENDING: m.admin_moderation_success_pending,
  ACTIVE: m.admin_moderation_success_active,
  REJECTED: m.admin_moderation_success_rejected,
  INACTIVE: m.admin_moderation_success_inactive
};

export const load: PageServerLoad = async (event) => {
  const env = requireEnv(event);
  const selected = v.parse(
    v.optional(v.picklist(packageStatuses), 'PENDING'),
    event.url.searchParams.get('status') ?? undefined
  );

  const prisma = createPrisma(env.DB);
  try {
    const packages = await listPackagesByStatus(prisma, selected);
    return { selected, packages };
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
        return fail(400, { error: m.admin_moderation_invalid_request() });
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
      return { success: true, message: moderationSuccessMessages[input.status]() };
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  }
};
