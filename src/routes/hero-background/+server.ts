import { type RequestHandler, error } from '@sveltejs/kit';
import { createPrisma } from '$lib/server/db';
import { requireEnv } from '$lib/server/platform';
import { getHeroBackgroundImage } from '$lib/server/settings';

export const GET: RequestHandler = async (event) => {
  const env = requireEnv(event);
  const prisma = createPrisma(env.DB);
  let image: Awaited<ReturnType<typeof getHeroBackgroundImage>>;
  try {
    image = await getHeroBackgroundImage(prisma);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }

  if (!image) throw error(404, 'No hero background image has been set');

  const etag = `"${image.updatedAt.getTime()}"`;
  if (event.request.headers.get('if-none-match') === etag) {
    return new Response(null, { status: 304, headers: { etag } });
  }

  return new Response(new Blob([new Uint8Array(image.data)]), {
    headers: {
      'content-type': image.contentType,
      'cache-control': 'public, max-age=300',
      etag
    }
  });
};
