import { type RequestHandler, json } from '@sveltejs/kit';
import { requireEnv } from '$lib/server/platform';

export const GET: RequestHandler = async (event) => {
  const env = requireEnv(event);
  await env.DB.prepare('SELECT 1 AS healthy').first();
  return json({ status: 'ok', database: 'reachable' });
};
