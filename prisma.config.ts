import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  
  // THE CLI (MIGRATIONS) USES THIS.
  // Use the Direct URL so 'prisma migrate deploy' can talk to the DB during build.
  datasource: {
    url: process.env.VESTRIPPN_DATABASE_URL,
  },

  migrations: {
    path: "prisma/migrations",
    // No 'datasource' allowed here anymore!
  },
});