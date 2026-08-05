import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Separate from vitest.config.ts on purpose: that config's pool is
// @cloudflare/vitest-pool-workers (workerd, no DOM). Component tests need a
// real DOM, so they run under jsdom with the plain Svelte compiler plugin
// instead of the full sveltekit() plugin. Without that plugin, $app/* isn't a
// resolvable specifier at all, so it's aliased to stub modules under
// test/mocks/ that components (and sveltekit-superforms, which imports some
// of these internally) can use.
export default defineConfig({
  resolve: {
    // Without this, Vite resolves Svelte's default (server/SSR) build even
    // under jsdom, so components compile against svelte/internal/server —
    // which has no mount() — instead of the client runtime. This is Svelte's
    // documented fix for testing components with Vitest.
    conditions: ['browser'],
    alias: {
      $lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
      '$app/paths': fileURLToPath(new URL('./test/mocks/app-paths.ts', import.meta.url)),
      '$app/state': fileURLToPath(new URL('./test/mocks/app-state.ts', import.meta.url)),
      '$app/stores': fileURLToPath(new URL('./test/mocks/app-stores.ts', import.meta.url)),
      '$app/forms': fileURLToPath(new URL('./test/mocks/app-forms.ts', import.meta.url)),
      '$app/environment': fileURLToPath(
        new URL('./test/mocks/app-environment.ts', import.meta.url)
      ),
      '$app/navigation': fileURLToPath(new URL('./test/mocks/app-navigation.ts', import.meta.url))
    }
  },
  plugins: [svelte()],
  test: {
    environment: 'jsdom',
    // Explicit list, not a glob: these tests live flat under test/ alongside
    // the workerd suite, with no naming convention distinguishing them, so
    // vitest.config.ts's `exclude` must be kept in sync with this list.
    include: [
      'test/root.test.ts',
      'test/layout.test.ts',
      'test/admin.test.ts',
      'test/admin_settings.test.ts',
      'test/login.test.ts',
      'test/packages_id.test.ts'
    ],
    setupFiles: ['./test/dom-setup.ts']
  }
});
