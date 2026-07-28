import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import {
  AuthenticationError,
  authenticateAdministrator,
  createSessionToken,
  verifyAdministrator
} from '../src/lib/server/auth';
import { createPrisma } from '../src/lib/server/db';
import { adminEmail, adminPassword, seedAdministrator } from './fixtures';

describe('authentication', () => {
  it('authenticates a valid administrator and rejects a wrong password', async () => {
    await seedAdministrator();
    const prisma = createPrisma(env.DB);
    try {
      await expect(authenticateAdministrator(prisma, adminEmail, adminPassword)).resolves.toBe(
        'admin-test'
      );
      await expect(authenticateAdministrator(prisma, adminEmail, 'wrong')).rejects.toBeInstanceOf(
        AuthenticationError
      );
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it('accepts a valid session token and rejects a tampered one', async () => {
    const id = await seedAdministrator();
    const prisma = createPrisma(env.DB);
    try {
      const token = await createSessionToken(id, 'test-session-secret');
      await expect(verifyAdministrator(token, 'test-session-secret', prisma)).resolves.toBe(id);
      await expect(
        verifyAdministrator(`${token}x`, 'test-session-secret', prisma)
      ).rejects.toBeInstanceOf(AuthenticationError);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});
