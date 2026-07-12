import { fail, redirect } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { valibot } from "sveltekit-superforms/adapters";
import type { Actions, PageServerLoad } from "./$types";
import {
  AuthenticationError,
  authenticateAdministrator,
  createSessionToken,
  sessionCookieName,
  sessionMaxAge,
} from "$lib/server/auth";
import { createPrisma } from "$lib/server/db";
import { requireEnv } from "$lib/server/platform";
import { credentialsSchema } from "$lib/validation";

export const load: PageServerLoad = async (event) => {
  if (event.locals.administratorId) throw redirect(302, "/admin");
  return {
    form: await superValidate(valibot(credentialsSchema)),
    isLocal: event.platform?.env.ENVIRONMENT === "local",
  };
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event.request, valibot(credentialsSchema));
    if (!form.valid) return fail(400, { form });

    const env = requireEnv(event);
    const prisma = createPrisma(env.DB);
    let administratorId: string;
    try {
      administratorId = await authenticateAdministrator(
        prisma,
        form.data.email,
        form.data.password,
      );
    } catch (cause) {
      if (cause instanceof AuthenticationError) {
        return message(form, "Invalid email or password", { status: 401 });
      }
      throw cause;
    } finally {
      await prisma.$disconnect().catch(() => {});
    }

    const token = await createSessionToken(administratorId, env.SESSION_SECRET);
    event.cookies.set(sessionCookieName, token, {
      httpOnly: true,
      secure: env.ENVIRONMENT !== "local",
      sameSite: "lax",
      path: "/",
      maxAge: sessionMaxAge,
    });
    throw redirect(303, "/admin");
  },
};
