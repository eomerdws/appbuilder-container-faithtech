import type { Handle } from "@sveltejs/kit";
import { sessionCookieName, verifyAdministrator } from "$lib/server/auth";
import { withPrisma } from "$lib/server/db";

export const handle: Handle = async ({ event, resolve }) => {
  const requestId =
    event.request.headers.get("x-request-id") ?? crypto.randomUUID();
  event.locals.requestId = requestId;
  event.locals.administratorId = null;

  const sessionCookie = event.cookies.get(sessionCookieName);
  if (sessionCookie && event.platform) {
    const { env } = event.platform;
    event.locals.administratorId = await withPrisma(env.DB, (prisma) =>
      verifyAdministrator(sessionCookie, env.SESSION_SECRET, prisma),
    ).catch(() => null);
  }

  const response = await resolve(event);
  response.headers.set("x-request-id", requestId);
  return response;
};
