import { fileURLToPath } from "node:url";
import {
  cloudflareTest,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

const migrations = await readD1Migrations("./migrations");

export default defineConfig({
  resolve: {
    // Match SvelteKit's `$lib` alias so tests can import route handlers.
    alias: {
      $lib: fileURLToPath(new URL("./src/lib", import.meta.url)),
    },
  },
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./test/wrangler.test.jsonc" },
      miniflare: {
        bindings: {
          SESSION_SECRET: "test-session-secret",
          SCRIPTORIA_API_KEY: "test-scriptoria-secret",
          TEST_MIGRATIONS: migrations,
        },
      },
    }),
  ],
});
