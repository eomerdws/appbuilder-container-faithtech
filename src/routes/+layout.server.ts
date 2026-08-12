import type { LayoutServerLoad } from './$types';
import { createPrisma } from '$lib/server/db';
import { getSiteSettings } from '$lib/server/settings';

export const load: LayoutServerLoad = async (event) => {
  event.depends('app:theme');
  if (!event.platform) {
    return { themeName: null };
  }
  const prisma = createPrisma(event.platform.env.DB);
  try {
    const { themeName } = await getSiteSettings(prisma);
    return { themeName };
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
};
