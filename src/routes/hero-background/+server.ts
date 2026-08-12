import { type RequestHandler, error } from '@sveltejs/kit';
import { createPrisma } from '$lib/server/db';
import { requireEnv } from '$lib/server/platform';
import { getCustomHeroImage } from '$lib/server/settings';

export const GET: RequestHandler = async (event) => {
  const env = requireEnv(event);
  const prisma = createPrisma(env.DB);
  let image: Awaited<ReturnType<typeof getCustomHeroImage>>;
  try {
    image = await getCustomHeroImage(prisma);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }

  if (!image) throw error(404, 'No custom hero background image has been uploaded');

  return new Response(new Blob([image.data], { type: image.mimeType }), {
    headers: {
      'cache-control': 'public, max-age=300'
    }
  });
};
