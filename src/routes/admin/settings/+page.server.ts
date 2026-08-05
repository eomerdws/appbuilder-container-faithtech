import { fail } from '@sveltejs/kit';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import * as m from '$lib/paraglide/messages';
import { createPrisma } from '$lib/server/db';
import { requireEnv } from '$lib/server/platform';
import { getSiteSettings, setHeroBackgroundImage, setSiteTitle } from '$lib/server/settings';
import { heroImageUploadSchema, siteTitleSchema } from '$lib/validation';

export const load: PageServerLoad = async (event) => {
  const env = requireEnv(event);
  const prisma = createPrisma(env.DB);
  try {
    const { heroBackgroundImageKey, siteTitle } = await getSiteSettings(prisma);
    return { heroBackgroundImageKey, siteTitle };
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
};

export const actions: Actions = {
  updateTitle: async (event) => {
    if (!event.locals.administratorId) return fail(401);

    const data = await event.request.formData();
    const result = v.safeParse(siteTitleSchema, data.get('siteTitle'));
    if (!result.success) {
      return fail(400, { error: result.issues[0]?.message ?? m.admin_settings_error_generic() });
    }

    const env = requireEnv(event);
    const prisma = createPrisma(env.DB);
    try {
      await setSiteTitle(env.DB, prisma, {
        siteTitle: result.output === '' ? null : result.output,
        administratorId: event.locals.administratorId
      });
      return { success: true, message: m.admin_settings_title_success() };
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  },

  uploadHeroImage: async (event) => {
    if (!event.locals.administratorId) return fail(401);

    const data = await event.request.formData();
    const file = data.get('heroImage');
    const result = v.safeParse(heroImageUploadSchema, file);
    if (!result.success) {
      return fail(400, { error: result.issues[0]?.message ?? m.admin_settings_error_generic() });
    }

    const env = requireEnv(event);
    const prisma = createPrisma(env.DB);
    try {
      await setHeroBackgroundImage(env.DB, prisma, env.HERO_IMAGES, {
        file: result.output,
        contentType: result.output.type,
        administratorId: event.locals.administratorId
      });
      return { success: true, message: m.admin_settings_success() };
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  }
};
