import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createPrisma } from "$lib/server/db";
import { getActivePackage } from "$lib/server/packages";

export const load: PageServerLoad = async (event) => {
  if (!event.platform) throw error(503, "Package catalogue is unavailable");

  const prisma = createPrisma(event.platform.env.DB);
  try {
    const found = await getActivePackage(prisma, event.params.id);
    if (!found) throw error(404, "Package not found");
    return { package: found };
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
};
