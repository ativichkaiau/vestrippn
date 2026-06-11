import { config } from "dotenv";
import { defineConfig } from "@prisma/config";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const datasourceUrl =
  process.env.VESTRIPPN_PRISMA_DATABASE_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  
  // THE CLI (MIGRATIONS) USES THIS.
  // Match the runtime Prisma adapter env var, with DATABASE_URL as a fallback.
  datasource: {
    url: datasourceUrl,
  },

  migrations: {
    path: "prisma/migrations",
    // No 'datasource' allowed here anymore!
  },
});
