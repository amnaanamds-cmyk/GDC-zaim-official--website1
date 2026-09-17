import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 keeps the connection string out of schema.prisma — the CLI
 * (migrate, generate, seed) reads it from here. The application builds its
 * own connection in lib/db.ts, so DATABASE_URL is the single source for both.
 */
const url = process.env.DATABASE_URL;

if (!url) {
  // Prisma's own message for this is "Connection url is empty", which does not
  // say where the url was supposed to come from. Be explicit instead.
  throw new Error(
    [
      '',
      'DATABASE_URL is not set.',
      '',
      '  Running locally?  Run "npm run setup" — it creates .env for you.',
      '',
      '  Deploying?        Add DATABASE_URL in your hosting dashboard:',
      '                    Vercel -> Project -> Settings -> Environment Variables.',
      '                    Use the POOLED connection string (the host contains',
      '                    "-pooler"), tick Production, Preview and Development,',
      '                    save, then redeploy.',
      '',
    ].join('\n'),
  );
}

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url,
  },
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
});
