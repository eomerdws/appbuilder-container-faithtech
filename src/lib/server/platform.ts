import { type RequestEvent, error } from '@sveltejs/kit';

/** Returns the Worker bindings, or a 503 when the platform is unavailable. */
export function requireEnv(event: RequestEvent) {
  if (!event.platform) {
    throw error(503, 'Platform bindings are unavailable');
  }
  return event.platform.env;
}
