import path from "node:path";
import { defineConfig } from "prisma/config";

// ⚠️ SAFETY: Never use `prisma db push` on production.
// Always use `prisma migrate deploy` for production changes.
// `db push` bypasses migration tracking and can corrupt production data.

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  migrations: {
    path: path.join(__dirname, "prisma", "migrations"),
    seed: "npx tsx --env-file=.env.local prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/placeholder",
  },
});
