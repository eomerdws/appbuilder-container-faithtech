export {};

declare global {
  namespace Cloudflare {
    interface Env {
      DB: D1Database;
      SESSION_SECRET: string;
      SCRIPTORIA_API_KEY: string;
      TEST_MIGRATIONS: Array<{ name: string; queries: string[] }>;
    }
  }
}
