import * as v from 'valibot';
import type { PageServerLoad } from './$types';
import { createPrisma } from '$lib/server/db';
import { searchActivePackages } from '$lib/server/packages';
import { getHeroBackgroundImage } from '$lib/server/settings';
import { searchSchema } from '$lib/validation';

export const load: PageServerLoad = async (event) => {
  const q = event.url.searchParams.get('q') ?? '';
  if (!event.platform) {
    return { packages: [], q, heroBackgroundImageUrl: undefined };
  }
  const query = v.parse(searchSchema, { q: q || undefined });
  const prisma = createPrisma(event.platform.env.DB);
  try {
    const packages = await searchActivePackages(prisma, query);
    const heroBackgroundImageKey = await getHeroBackgroundImage(prisma);
    return {
      packages,
      q,
      heroBackgroundImageUrl: heroBackgroundImageKey ? '/hero-background' : undefined
    };
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
};
