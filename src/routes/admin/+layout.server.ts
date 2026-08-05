import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { createPrisma } from '$lib/server/db';
import { requireEnv } from '$lib/server/platform';
import { packageStatuses } from '$lib/validation';

export const load: LayoutServerLoad = async (event) => {
  if (!event.locals.administratorId) {
    throw redirect(302, '/login');
  }

  const env = requireEnv(event);
  const prisma = createPrisma(env.DB);
  try {
    const counts: Record<string, number> = {};
    for (const status of packageStatuses) {
      counts[status] = await prisma.package.count({ where: { status } });
    }
    return { administratorId: event.locals.administratorId, counts };
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
};
