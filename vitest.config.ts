import {
  cloudflareTest,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

const migrations = await readD1Migrations("./migrations");

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./test/wrangler.test.jsonc" },
      miniflare: {
        bindings: {
          SESSION_SECRET: "test-session-secret",
          TEST_MIGRATIONS: migrations,
        },
      },
    }),
  ],
});
