import { type RequestHandler, error, json } from '@sveltejs/kit';
import { createPrisma } from '$lib/server/db';
import { getActivePackage } from '$lib/server/packages';
import { requireEnv } from '$lib/server/platform';

export const GET: RequestHandler = async (event) => {
  const env = requireEnv(event);
  const prisma = createPrisma(env.DB);
  try {
    const found = await getActivePackage(prisma, event.params.id ?? '');
    if (!found) throw error(404, 'Package not found');
    return json({ package: found });
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
};
