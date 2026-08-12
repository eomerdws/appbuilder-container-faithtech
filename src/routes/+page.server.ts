import * as v from 'valibot';
import type { PageServerLoad } from './$types';
import {
  defaultHeroBackgroundImage,
  heroBackgroundImagePath,
  isFlatHeroBackgroundImage
} from '$lib/hero-images';
import { createPrisma } from '$lib/server/db';
import { searchActivePackages } from '$lib/server/packages';
import { getSiteSettings } from '$lib/server/settings';
import { searchSchema } from '$lib/validation';

export const load: PageServerLoad = async (event) => {
  const q = event.url.searchParams.get('q') ?? '';
  if (!event.platform) {
    return {
      packages: [],
      q,
      heroBackgroundImageUrl: heroBackgroundImagePath(defaultHeroBackgroundImage),
      heroIsFlat: isFlatHeroBackgroundImage(defaultHeroBackgroundImage),
      siteTitle: null
    };
  }
  const query = v.parse(searchSchema, { q: q || undefined });
  const prisma = createPrisma(event.platform.env.DB);
  try {
    const packages = await searchActivePackages(prisma, query);
    const { heroBackgroundImage, siteTitle } = await getSiteSettings(prisma);
    return {
      packages,
      q,
      heroBackgroundImageUrl: heroBackgroundImagePath(heroBackgroundImage),
      heroIsFlat: isFlatHeroBackgroundImage(heroBackgroundImage),
      siteTitle
    };
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
};
