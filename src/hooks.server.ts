import type { Handle } from '@sveltejs/kit';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { sessionCookieName, verifyAdministrator } from '$lib/server/auth';
import { withPrisma } from '$lib/server/db';

export const handle: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, async ({ request, locale }) => {
    event.request = request;

    const requestId = event.request.headers.get('x-request-id') ?? crypto.randomUUID();
    event.locals.requestId = requestId;
    event.locals.administratorId = null;

    const sessionCookie = event.cookies.get(sessionCookieName);
    if (sessionCookie && event.platform) {
      const { env } = event.platform;
      event.locals.administratorId = await withPrisma(env.DB, (prisma) =>
        verifyAdministrator(sessionCookie, env.SESSION_SECRET, prisma)
      ).catch(() => null);
    }

    const response = await resolve(event, {
      transformPageChunk: ({ html }) =>
        html.replace('%lang%', locale).replace('%dir%', getTextDirection(locale))
    });
    response.headers.set('x-request-id', requestId);
    return response;
  });
