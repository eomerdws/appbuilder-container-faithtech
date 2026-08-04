export {};

declare global {
  namespace Cloudflare {
    interface Env {
      DB: D1Database;
      HERO_IMAGES: R2Bucket;
      SESSION_SECRET: string;
      SCRIPTORIA_API_KEY: string;
      TEST_MIGRATIONS: Array<{ name: string; queries: string[] }>;
    }
  }
}
