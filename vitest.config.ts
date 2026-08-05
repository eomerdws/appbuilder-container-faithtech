import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-pool-workers';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const migrations = await readD1Migrations('./migrations');

export default defineConfig({
  resolve: {
    // Match SvelteKit's `$lib` alias so tests can import route handlers.
    alias: {
      $lib: fileURLToPath(new URL('./src/lib', import.meta.url))
    }
  },
  test: {
    include: ['test/**/*.test.ts'],
    // These render Svelte components and need jsdom, not workerd (no DOM) —
    // they run separately via `npm run test:components` / vitest.config.components.ts.
    // Kept as an explicit list (rather than a naming convention) since these
    // files are otherwise indistinguishable from the rest of test/*.test.ts;
    // add any new component test's filename here AND to that config's include.
    exclude: [
      'test/root.test.ts',
      'test/layout.test.ts',
      'test/admin.test.ts',
      'test/admin_settings.test.ts',
      'test/login.test.ts',
      'test/packages_id.test.ts'
    ],
    setupFiles: ['./test/setup.ts']
  },
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './test/wrangler.test.jsonc' },
      miniflare: {
        bindings: {
          SESSION_SECRET: 'test-session-secret',
          SCRIPTORIA_API_KEY: 'test-scriptoria-secret',
          TEST_MIGRATIONS: migrations
        }
      }
    })
  ]
});
