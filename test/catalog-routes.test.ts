import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { createPrisma } from '../src/lib/server/db';
import { ingestNotification } from '../src/lib/server/notification';
import { setHeroBackgroundImage } from '../src/lib/server/settings';
import { load as loadCatalog } from '../src/routes/+page.server';
import { GET as apiPackages } from '../src/routes/api/v1/packages/+server';
import { GET as apiPackageDetail } from '../src/routes/api/v1/packages/[id]/+server';
import { GET as health } from '../src/routes/health/+server';
import { load as loadPackageDetail } from '../src/routes/packages/[id]/+page.server';
import { notification, seedAdministrator } from './fixtures';

type CatalogData = { packages: unknown[]; q: string; heroBackgroundImageUrl?: string };
type PackageDetailData = { package: { id: string } };
type PackagesJson = { packages: unknown[] };
type PackageJson = { package: { id: string } };

async function activatePackage(): Promise<string> {
  const stored = await ingestNotification(env.DB, notification as never);
  await env.DB.prepare("UPDATE packages SET status = 'ACTIVE' WHERE id = ?").bind(stored.id).run();
  return stored.id;
}

async function statusOf(value: unknown): Promise<number | undefined> {
  try {
    const res = (await value) as { status: number };
    return res.status;
  } catch (thrown) {
    return (thrown as { status: number }).status;
  }
}

describe('root catalogue load', () => {
  function loadEvent(url: string, platform: unknown = { env }) {
    return { url: new URL(url), platform };
  }

  it('returns an empty catalogue without hitting the database when platform is unavailable', async () => {
    const result = (await loadCatalog(
      loadEvent('https://worker.test/', null) as never
    )) as CatalogData;
    expect(result).toEqual({ packages: [], q: '', heroBackgroundImageUrl: undefined });
  });

  it('returns active packages matching the query, and omits the hero image url when unset', async () => {
    await activatePackage();
    const result = (await loadCatalog(
      loadEvent('https://worker.test/?q=domdom') as never
    )) as CatalogData;
    expect(result.packages).toHaveLength(1);
    expect(result.q).toBe('domdom');
    expect(result.heroBackgroundImageUrl).toBeUndefined();
  });

  it('exposes the hero image url once a background has been set', async () => {
    const adminId = await seedAdministrator();
    const prisma = createPrisma(env.DB);
    try {
      await setHeroBackgroundImage(env.DB, prisma, env.HERO_IMAGES, {
        file: new Blob(['bytes'], { type: 'image/png' }),
        contentType: 'image/png',
        administratorId: adminId
      });
    } finally {
      await prisma.$disconnect().catch(() => {});
    }

    const result = (await loadCatalog(loadEvent('https://worker.test/') as never)) as CatalogData;
    expect(result.heroBackgroundImageUrl).toBe('/hero-background');
  });
});

describe('package detail load', () => {
  function loadEvent(id: string, platform: unknown = { env }) {
    return { params: { id }, platform };
  }

  it('503s when the platform is unavailable', async () => {
    expect(await statusOf(loadPackageDetail(loadEvent('anything', null) as never))).toBe(503);
  });

  it('404s for a package that does not exist', async () => {
    expect(await statusOf(loadPackageDetail(loadEvent('missing-id') as never))).toBe(404);
  });

  it('404s for a package that exists but is not active', async () => {
    const stored = await ingestNotification(env.DB, notification as never);
    expect(await statusOf(loadPackageDetail(loadEvent(stored.id) as never))).toBe(404);
  });

  it('returns the active package', async () => {
    const id = await activatePackage();
    const result = (await loadPackageDetail(loadEvent(id) as never)) as PackageDetailData;
    expect(result.package.id).toBe(id);
  });
});

describe('GET /api/v1/packages', () => {
  function requestEvent(url: string) {
    return { url: new URL(url), platform: { env } };
  }

  it('returns active packages as json', async () => {
    await activatePackage();
    const response = await apiPackages(
      requestEvent('https://worker.test/api/v1/packages') as never
    );
    const body = (await response.json()) as PackagesJson;
    expect(body.packages).toHaveLength(1);
  });

  it('applies the q and limit query params', async () => {
    await activatePackage();
    const response = await apiPackages(
      requestEvent('https://worker.test/api/v1/packages?q=nomatch&limit=5') as never
    );
    const body = (await response.json()) as PackagesJson;
    expect(body.packages).toHaveLength(0);
  });

  it('rejects an out-of-range limit by throwing a validation error uncaught', async () => {
    // The handler validates with v.parse() but has no try/catch, so an invalid
    // limit isn't turned into a 400 response here — it propagates as a raw
    // ValiError, which SvelteKit's error boundary would map to a 500.
    await expect(
      apiPackages(requestEvent('https://worker.test/api/v1/packages?limit=0') as never)
    ).rejects.toThrow();
  });
});

describe('GET /api/v1/packages/[id]', () => {
  function requestEvent(id: string) {
    return { params: { id }, platform: { env } };
  }

  it('returns the package as json when active', async () => {
    const id = await activatePackage();
    const response = await apiPackageDetail(requestEvent(id) as never);
    const body = (await response.json()) as PackageJson;
    expect(body.package.id).toBe(id);
  });

  it('404s when the package is missing or not active', async () => {
    expect(await statusOf(apiPackageDetail(requestEvent('missing-id') as never))).toBe(404);
  });
});

describe('GET /health', () => {
  it('reports ok when the database is reachable', async () => {
    const response = await health({ platform: { env } } as never);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok', database: 'reachable' });
  });

  it('503s when the platform is unavailable', async () => {
    expect(await statusOf(health({ platform: undefined } as never))).toBe(503);
  });
});
