import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 keeps the connection string out of schema.prisma — the CLI
 * (migrate, generate, seed) reads it from here. The application builds its
 * own connection in lib/db.ts, so DATABASE_URL is the single source for both.
 */
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
});
