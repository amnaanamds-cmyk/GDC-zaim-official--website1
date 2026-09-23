#!/usr/bin/env node
/**
 * One-command setup for the college portal.
 *
 *   npm run setup            prepare an empty database, ready for /setup
 *   npm run setup -- --demo  also load the demonstration dataset
 *
 * Creates .env if it is missing, creates the PostgreSQL role and database if
 * they do not exist, and applies the migrations.
 *
 * It deliberately does NOT load any content by default. A college setting up
 * its own copy of this project enters its details in the browser at /setup;
 * pre-loading the demonstration college's departments and staff would be
 * both confusing and wrong. Pass --demo when you want the sample data for
 * development.
 *
 * Safe to run again: it skips whatever is already done, and it will not touch
 * existing data unless you pass --reseed.
 */
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { stdin, stdout } from 'node:process';
import pg from 'pg';

const RESEED = process.argv.includes('--reseed');
const DEMO = process.argv.includes('--demo') || RESEED;

const ESC = '[';
const c = {
  reset: `${ESC}0m`,
  bold: `${ESC}1m`,
  dim: `${ESC}2m`,
  green: `${ESC}32m`,
  yellow: `${ESC}33m`,
  red: `${ESC}31m`,
  cyan: `${ESC}36m`,
};
const ok = (m) => console.log(`${c.green}  [ok]${c.reset} ${m}`);
const info = (m) => console.log(`${c.cyan}   -  ${c.reset}${m}`);
const warn = (m) => console.log(`${c.yellow}  [!]${c.reset} ${m}`);
const fail = (m) => console.log(`${c.red}  [x]${c.reset} ${m}`);
const step = (n, m) => console.log(`\n${c.bold}${n}. ${m}${c.reset}`);

function run(command, args) {
  // shell: true so this works with npm/npx on Windows as well as Unix.
  return spawnSync(command, args, { stdio: 'inherit', shell: true }).status === 0;
}

/**
 * Reads a password from the terminal without printing it.
 *
 * Deliberately does not use readline: mixing a line-mode reader with raw mode
 * on the same stdin is fragile, and this is the only question the script asks.
 * When input is piped (unattended setup) it reads one line normally.
 */
async function askSecret(question) {
  stdout.write(question);

  if (!stdin.isTTY) {
    const line = await new Promise((resolve) => {
      let buf = '';
      const onData = (chunk) => {
        buf += chunk.toString('utf8');
        if (buf.includes('\n')) {
          stdin.removeListener('data', onData);
          resolve(buf.split('\n')[0]);
        }
      };
      stdin.on('data', onData);
    });
    stdout.write('\n');
    return line.trim();
  }

  stdin.setRawMode(true);
  stdin.resume();
  const value = await new Promise((resolve) => {
    let buffer = '';
    const done = (result) => {
      stdin.removeListener('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write('\n');
      resolve(result);
    };
    const onData = (chunk) => {
      for (const char of chunk.toString('utf8')) {
        if (char === '\r' || char === '\n' || char === '\u0004') return done(buffer);
        if (char === '\u0003') {            // Ctrl+C
          done(buffer);
          process.exit(1);
        } else if (char === '\u007f' || char === '\b') {
          if (buffer.length) {
            buffer = buffer.slice(0, -1);
            stdout.write('\b \b');
          }
        } else if (char >= ' ') {
          buffer += char;
          stdout.write('*');
        }
      }
    };
    stdin.on('data', onData);
  });

  return value.trim();
}

/* ------------------------------------------------------------------ *
 * 1. Environment file
 * ------------------------------------------------------------------ */
step(1, 'Checking configuration');

if (!existsSync('.env')) {
  if (!existsSync('.env.example')) {
    fail('Neither .env nor .env.example found. Are you inside the project folder?');
    process.exit(1);
  }
  copyFileSync('.env.example', '.env');
  // .env.example ships with a placeholder; use the development default.
  writeFileSync('.env', readFileSync('.env', 'utf8').replace('CHANGE_ME', 'gdc_dev_password'));
  ok('Created .env from .env.example');
} else {
  ok('.env already exists');
}

const envText = readFileSync('.env', 'utf8');
const urlMatch = envText.match(/DATABASE_URL\s*=\s*"?([^"\n]+)"?/);
if (!urlMatch) {
  fail('DATABASE_URL is missing from .env');
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(urlMatch[1]);
} catch {
  fail(`DATABASE_URL in .env is not a valid URL:\n      ${urlMatch[1]}`);
  process.exit(1);
}

const dbName = parsed.pathname.replace(/^\//, '');
const dbUser = decodeURIComponent(parsed.username);
const dbPassword = decodeURIComponent(parsed.password);
const dbHost = parsed.hostname;
const dbPort = parsed.port || '5432';
info(`Database "${dbName}" as user "${dbUser}" on ${dbHost}:${dbPort}`);

/* ------------------------------------------------------------------ *
 * 2. Database and role
 * ------------------------------------------------------------------ */
step(2, 'Checking PostgreSQL');

async function canConnect() {
  const client = new pg.Client({
    host: dbHost,
    port: Number(dbPort),
    user: dbUser,
    password: dbPassword,
    database: dbName,
    connectionTimeoutMillis: 5000,
  });
  try {
    await client.connect();
    await client.end();
    return { ok: true };
  } catch (err) {
    return { ok: false, code: err.code, message: String(err.message).split('\n')[0] };
  }
}

let conn = await canConnect();

if (conn.ok) {
  ok('Connected to the database');
} else if (['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'].includes(conn.code)) {
  fail(`PostgreSQL is not answering on ${dbHost}:${dbPort}.`);
  console.log(`
  Start it, then run this again:
    ${c.dim}Windows${c.reset}  Services -> postgresql -> Start   (it usually starts on boot)
    ${c.dim}macOS${c.reset}    brew services start postgresql@16
    ${c.dim}Linux${c.reset}    sudo systemctl start postgresql
`);
  process.exit(1);
} else {
  // Server is up but the role or database does not exist yet.
  warn(`Cannot sign in yet: ${conn.message}`);
  console.log(`
  Creating the database. This needs your PostgreSQL ${c.bold}superuser${c.reset} password —
  the one you chose when installing PostgreSQL. The account is usually "postgres".
  ${c.dim}(Set PGSUPERUSER / PGSUPERPASSWORD to skip this question entirely.)${c.reset}
`);

  // PGSUPERUSER / PGSUPERPASSWORD let this run unattended (CI, a lab machine);
  // otherwise the only thing we ask for is the password.
  const superUser = process.env.PGSUPERUSER || 'postgres';
  const superPass = process.env.PGSUPERPASSWORD ?? (await askSecret(`  Password for "${superUser}": `));

  const admin = new pg.Client({
    host: dbHost,
    port: Number(dbPort),
    user: superUser,
    password: superPass,
    database: 'postgres',
    connectionTimeoutMillis: 8000,
  });

  try {
    await admin.connect();
  } catch (err) {
    fail(`Could not sign in as ${superUser}: ${String(err.message).split('\n')[0]}`);
    console.log(`
  Check the password, or create these by hand in pgAdmin / SQL Shell:
    ${c.dim}CREATE USER ${dbUser} WITH PASSWORD '${dbPassword}' CREATEDB;
    CREATE DATABASE ${dbName} OWNER ${dbUser};${c.reset}
`);
    process.exit(1);
  }

  const role = await admin.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [dbUser]);
  if (role.rowCount === 0) {
    await admin.query(`CREATE USER "${dbUser}" WITH PASSWORD '${dbPassword.replace(/'/g, "''")}' CREATEDB`);
    ok(`Created database user "${dbUser}"`);
  } else {
    ok(`Database user "${dbUser}" already exists`);
  }

  const database = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (database.rowCount === 0) {
    await admin.query(`CREATE DATABASE "${dbName}" OWNER "${dbUser}"`);
    ok(`Created database "${dbName}"`);
  } else {
    ok(`Database "${dbName}" already exists`);
  }

  await admin.end();

  conn = await canConnect();
  if (!conn.ok) {
    fail(`Still cannot connect: ${conn.message}`);
    process.exit(1);
  }
  ok('Connected to the database');
}

/* ------------------------------------------------------------------ *
 * 3. Tables
 * ------------------------------------------------------------------ */
step(3, 'Creating the tables');
if (!run('npx', ['prisma', 'migrate', 'deploy'])) {
  fail('Migration failed — the message above says why.');
  process.exit(1);
}
if (!run('npx', ['prisma', 'generate'])) {
  fail('Could not generate the database client.');
  process.exit(1);
}
ok('Tables are up to date');

/* ------------------------------------------------------------------ *
 * 4. Content
 * ------------------------------------------------------------------ */
step(4, 'Checking the content');

const client = new pg.Client({
  host: dbHost,
  port: Number(dbPort),
  user: dbUser,
  password: dbPassword,
  database: dbName,
});
await client.connect();
const { rows } = await client.query('SELECT count(*)::int AS n FROM "User"');
await client.end();

if (rows[0].n > 0 && !RESEED) {
  ok(`Database already holds ${rows[0].n} accounts — your data has been left alone`);
  info(`To wipe it and load the demonstration data: ${c.bold}npm run setup -- --reseed${c.reset}`);
} else if (DEMO) {
  if (!run('npm', ['run', 'db:seed'])) {
    fail('Seeding failed — the message above says why.');
    process.exit(1);
  }
  ok('Demonstration data loaded');
} else {
  ok('Database is empty and ready for your college');
}

/* ------------------------------------------------------------------ *
 * Done
 * ------------------------------------------------------------------ */
if (rows[0].n > 0 || DEMO) {
  console.log(`
${c.green}${c.bold}  Setup complete.${c.reset}

  Start the site:   ${c.bold}npm run dev${c.reset}
  Then open:        ${c.bold}http://localhost:3000${c.reset}

  Sign in at /portal/login  --  password ${c.bold}gdc12345${c.reset} for all four:
    ${c.bold}registrar${c.reset}           administrator
    ${c.bold}bilal.ahmad${c.reset}         teacher
    ${c.bold}2023-GDCZ-CS-045${c.reset}    student
    ${c.bold}librarian${c.reset}           library staff

  Signed in as ${c.bold}registrar${c.reset}, ${c.bold}Website content${c.reset} in the left-hand menu is where you
  change the college profile, the principal's photograph, the page banners,
  the gallery and the downloadable documents — no code, no redeploy.
`);
} else {
  console.log(`
${c.green}${c.bold}  Ready.${c.reset}

  Start the site:   ${c.bold}npm run dev${c.reset}
  Then open:        ${c.bold}http://localhost:3000${c.reset}

  The first page you see is the setup wizard. Enter your college's name,
  contact details and principal, choose your administrator username and
  password, and the whole site becomes your college's.

  ${c.dim}Just want the sample data to look around? ${c.bold}npm run setup -- --demo${c.reset}
`);
}
