import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "./generated/prisma/client";

export function createPrisma(database: D1Database): PrismaClient {
  return new PrismaClient({ adapter: new PrismaD1(database) });
}

export type DatabaseClient = PrismaClient;

/**
 * Run `fn` with a request-scoped Prisma client and always disconnect after.
 * Centralizes the create/try-finally boilerplate so callers (hooks, loads,
 * actions) don't repeat it. The D1 binding is per-request, so the client is
 * created per call rather than shared as a global singleton.
 */
export async function withPrisma<T>(
  database: D1Database,
  fn: (prisma: PrismaClient) => Promise<T>,
): Promise<T> {
  const prisma = createPrisma(database);
  try {
    return await fn(prisma);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}
