import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { type Plugin, defineConfig } from 'vite';

// Prisma 7's generated client imports its query compiler as `*.wasm?module` —
// a Cloudflare Workers convention. Two things are needed for it to survive the
// SvelteKit (Vite/rollup) → adapter-cloudflare (wrangler/esbuild) build:
//   1. Keep the import external (below) so rollup doesn't try to parse the wasm;
//      wrangler's bundler owns the `?module` semantics natively.
//   2. rollup rewrites the relative import when it relocates code into
//      `output/server/chunks`, but does NOT copy the wasm asset to the new
//      resolved path. This plugin places it there so wrangler can bundle it.
const WASM_RELATIVE = 'src/lib/server/generated/prisma/internal/query_compiler_fast_bg.wasm';

function prismaWasmAsset(): Plugin {
  return {
    name: 'prisma-wasm-asset',
    apply: 'build',
    writeBundle(options) {
      // Only act on the SSR (server) bundle, where the wasm import lives.
      if (!options.dir || !options.dir.replace(/\\/g, '/').endsWith('output/server')) {
        return;
      }
      const source = join(process.cwd(), WASM_RELATIVE);
      if (!existsSync(source)) return;
      const dest = join(options.dir, WASM_RELATIVE);
      mkdirSync(dirname(dest), { recursive: true });
      copyFileSync(source, dest);
    }
  };
}

// Every locale is prefixed (/en/..., /es/..., /ar/..., etc.) — no bare `/`.
// /api/v1/* and /health are machine-to-machine endpoints (Scriptoria webhook,
// iOS container REST API) and must never be locale-prefixed or redirected.
export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: './src/lib/project.inlang',
      outdir: './src/lib/paraglide',
      strategy: ['url', 'cookie', 'baseLocale'],
      emitTsDeclarations: true,
      urlPatterns: [
        {
          pattern: '/',
          localized: [
            ['en', '/en'],
            ['es', '/es'],
            ['ar', '/ar'],
            ['de', '/de'],
            ['tl', '/tl'],
            ['fr', '/fr'],
            ['id', '/id'],
            ['ru', '/ru'],
            ['zh', '/zh']
          ]
        },
        {
          pattern: '/:path(.*)?',
          localized: [
            ['en', '/en/:path(.*)?'],
            ['es', '/es/:path(.*)?'],
            ['ar', '/ar/:path(.*)?'],
            ['de', '/de/:path(.*)?'],
            ['tl', '/tl/:path(.*)?'],
            ['fr', '/fr/:path(.*)?'],
            ['id', '/id/:path(.*)?'],
            ['ru', '/ru/:path(.*)?'],
            ['zh', '/zh/:path(.*)?']
          ]
        }
      ],
      routeStrategies: [
        { match: '/api/:path(.*)?', exclude: true },
        { match: '/health', exclude: true }
      ]
    }),
    tailwindcss(),
    sveltekit(),
    prismaWasmAsset()
  ],
  build: {
    rollupOptions: {
      external: [/\.wasm(\?module)?$/]
    }
  }
});
