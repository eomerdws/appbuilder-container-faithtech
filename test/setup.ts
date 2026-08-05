// Shared per-test-file setup for the Workers test pool: each test file gets
// its own isolated D1 instance, so every file needs migrations applied and a
// clean slate before each test.
import { applyD1Migrations, env } from 'cloudflare:test';
import { beforeEach } from 'vitest';

beforeEach(async () => {
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM package_status_events'),
    env.DB.prepare('DELETE FROM package_images'),
    env.DB.prepare('DELETE FROM package_listings'),
    env.DB.prepare('DELETE FROM package_names'),
    env.DB.prepare('DELETE FROM packages'),
    env.DB.prepare('DELETE FROM site_settings'),
    env.DB.prepare('DELETE FROM administrators')
  ]);

  const objects = await env.HERO_IMAGES.list();
  await Promise.all(objects.objects.map((object) => env.HERO_IMAGES.delete(object.key)));
});
