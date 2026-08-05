import type { LayoutServerLoad } from './$types';
import { createPrisma } from '$lib/server/db';
import { getSiteSettings } from '$lib/server/settings';

export const load: LayoutServerLoad = async (event) => {
  event.depends('app:theme');
  if (!event.platform) {
    return {
      themeButtonColor: null,
      themeRowColor: null,
      themeBackgroundColor: null,
      themeTextColor: null,
      themeIconColor: null
    };
  }
  const prisma = createPrisma(event.platform.env.DB);
  try {
    const {
      themeButtonColor,
      themeRowColor,
      themeBackgroundColor,
      themeTextColor,
      themeIconColor
    } = await getSiteSettings(prisma);
    return {
      themeButtonColor,
      themeRowColor,
      themeBackgroundColor,
      themeTextColor,
      themeIconColor
    };
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
};
