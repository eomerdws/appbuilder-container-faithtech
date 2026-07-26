import { type RequestHandler, json } from '@sveltejs/kit';
import * as v from 'valibot';
import { createPrisma } from '$lib/server/db';
import { searchActivePackages } from '$lib/server/packages';
import { requireEnv } from '$lib/server/platform';
import { searchSchema } from '$lib/validation';

export const GET: RequestHandler = async (event) => {
  const env = requireEnv(event);
  const query = v.parse(searchSchema, {
    q: event.url.searchParams.get('q') ?? undefined,
    limit: event.url.searchParams.get('limit') ?? undefined
  });

  const prisma = createPrisma(env.DB);
  try {
    const packages = await searchActivePackages(prisma, query);
    return json({ packages });
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
};
