import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  if (!event.locals.administratorId) {
    throw redirect(302, '/login');
  }
  return { administratorId: event.locals.administratorId };
};
