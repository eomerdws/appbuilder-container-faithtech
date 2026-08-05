import { type RequestHandler, error } from '@sveltejs/kit';
import { createPrisma } from '$lib/server/db';
import { requireEnv } from '$lib/server/platform';
import { getSiteSettings } from '$lib/server/settings';

export const GET: RequestHandler = async (event) => {
  const env = requireEnv(event);
  const prisma = createPrisma(env.DB);
  let key: string | null;
  try {
    ({ heroBackgroundImageKey: key } = await getSiteSettings(prisma));
  } finally {
    await prisma.$disconnect().catch(() => {});
  }

  if (!key) throw error(404, 'No hero background image has been set');

  const object = await env.HERO_IMAGES.get(key);
  if (!object) throw error(404, 'Hero background image is missing from storage');

  const etag = object.httpEtag;
  if (event.request.headers.get('if-none-match') === etag) {
    return new Response(null, { status: 304, headers: { etag } });
  }

  return new Response(object.body, {
    headers: {
      'content-type': object.httpMetadata?.contentType ?? 'application/octet-stream',
      'cache-control': 'public, max-age=300',
      etag
    }
  });
};
