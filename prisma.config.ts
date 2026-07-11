import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "migrations",
  },
  datasource: {
    // Prisma CLI commands need a local SQLite URL. The deployed Worker will
    // instead construct Prisma with @prisma/adapter-d1 and the env.DB binding.
    url: process.env.DATABASE_URL ?? "file:./.local/schema.db",
  },
});
