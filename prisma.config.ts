import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "src/lib/prisma/schema.prisma",
  migrations: {
    path: "src/lib/prisma/migrations",
  },
  datasource: {
    // Prisma CLI commands need a local SQLite URL. The deployed Worker will
    // instead construct Prisma with @prisma/adapter-d1 and the env.DB binding.
    url: process.env.DATABASE_URL ?? "file:./.local/schema.db",
  },
});
