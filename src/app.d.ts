/// <reference path="../worker-configuration.d.ts" />

// Secrets are not declared in wrangler.jsonc, so they are added here.
type WorkerBindings = Env & {
  SESSION_SECRET: string;
};

declare global {
  namespace App {
    interface Error {
      requestId?: string;
    }
    interface Locals {
      administratorId: string | null;
      requestId: string;
    }
    interface Platform {
      env: WorkerBindings;
      cf?: CfProperties;
      ctx: ExecutionContext;
    }
  }
}

export {};
