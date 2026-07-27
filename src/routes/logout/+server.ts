import { type RequestHandler, redirect } from '@sveltejs/kit';
import { sessionCookieName } from '$lib/server/auth';

export const POST: RequestHandler = async (event) => {
  event.cookies.delete(sessionCookieName, { path: '/' });
  throw redirect(303, '/login');
};
