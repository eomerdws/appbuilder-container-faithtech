import { fail } from '@sveltejs/kit';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import * as m from '$lib/paraglide/messages';
import { createPrisma } from '$lib/server/db';
import { requireEnv } from '$lib/server/platform';
import {
  getSiteSettings,
  setHeroBackgroundImage,
  setSiteTitle,
  setThemeSettings
} from '$lib/server/settings';
import { heroImageUploadSchema, siteTitleSchema, themeSettingsSchema } from '$lib/validation';

export const load: PageServerLoad = async (event) => {
  const env = requireEnv(event);
  const prisma = createPrisma(env.DB);
  try {
    const {
      heroBackgroundImageKey,
      siteTitle,
      themeButtonColor,
      themeRowColor,
      themeBackgroundColor,
      themeTextColor,
      themeIconColor
    } = await getSiteSettings(prisma);
    return {
      heroBackgroundImageKey,
      siteTitle,
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
  },

  updateTheme: async (event) => {
    if (!event.locals.administratorId) return fail(401);

    const data = await event.request.formData();
    const result = v.safeParse(themeSettingsSchema, {
      themeButtonColor: data.get('themeButtonColor'),
      themeRowColor: data.get('themeRowColor'),
      themeBackgroundColor: data.get('themeBackgroundColor'),
      themeTextColor: data.get('themeTextColor'),
      themeIconColor: data.get('themeIconColor')
    });
    if (!result.success) {
      return fail(400, { error: result.issues[0]?.message ?? m.admin_settings_error_generic() });
    }

    const env = requireEnv(event);
    const prisma = createPrisma(env.DB);
    try {
      await setThemeSettings(env.DB, prisma, {
        themeButtonColor: result.output.themeButtonColor || null,
        themeRowColor: result.output.themeRowColor || null,
        themeBackgroundColor: result.output.themeBackgroundColor || null,
        themeTextColor: result.output.themeTextColor || null,
        themeIconColor: result.output.themeIconColor || null,
        administratorId: event.locals.administratorId
      });
      return { success: true, message: m.admin_settings_theme_success() };
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  }
};
