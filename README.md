# Government Degree College Zaim — Website & Management Portal

A full-stack college portal: public website plus student, faculty and administration
dashboards, built as a **Next.js 16 / React 19** application on **PostgreSQL**.

Everything on the site comes from the database. Publishing a notice in the admin panel puts it on the
home page immediately; a teacher marking attendance changes the student's percentage; an administrator
uploading event photographs and videos from their computer makes them visible to every visitor.

---

## Requirements

| Software | Version | Notes |
|---|---|---|
| Node.js | 20 or newer | `node -v` |
| PostgreSQL | 14 or newer | Must be running before you start the app |
| npm | 10 or newer | Ships with Node |

## Setup — the easy way

Install the two prerequisites once:

- **Node.js 20+** — [nodejs.org](https://nodejs.org) (take the LTS installer)
- **PostgreSQL 14+** — [postgresql.org/download](https://www.postgresql.org/download/). It asks you to choose a
  password for the `postgres` account during installation — **write it down**, you need it once.

Then:

| Your computer | Do this |
|---|---|
| **Windows** | Double-click **`start.bat`** |
| **macOS / Linux** | Double-click **`start.command`** (or run `./start.command` in a terminal) |

That installs the dependencies, creates the database, loads the college content and starts the site.
The first run asks once for the PostgreSQL password you chose at install time; after that it asks nothing.
When it says `Setup complete`, open **http://localhost:3000**.

To start it again later, double-click the same file.

### Or from a terminal

```bash
npm install
npm run setup     # creates the database, tables and content — safe to re-run
npm run dev       # http://localhost:3000
```

`npm run setup` is idempotent: it skips whatever already exists and will not touch your data.
Add `-- --reseed` to wipe it and reload the sample content.

For a lab machine or CI where nothing should prompt, set `PGSUPERUSER` and `PGSUPERPASSWORD` first.

### Or step by step

If you prefer to do it by hand, or the script cannot reach your database:

```sql
-- in psql or pgAdmin, as the postgres superuser
CREATE USER gdc WITH PASSWORD 'gdc_dev_password' CREATEDB;
CREATE DATABASE gdc_zaim OWNER gdc;
```

```bash
cp .env.example .env          # Windows: copy .env.example .env
# edit .env if you chose a different password
npx prisma migrate deploy
npm run db:seed
npm run dev
```

### If something goes wrong

| Message | Fix |
|---|---|
| `PostgreSQL is not answering` | The database server is not running. Windows: Services → postgresql → Start. macOS: `brew services start postgresql@16`. Linux: `sudo systemctl start postgresql`. |
| `password authentication failed for user "postgres"` | Wrong superuser password. It is the one set during PostgreSQL installation, not your Windows password. |
| `Node.js is not installed` | Install it from nodejs.org and reopen the terminal so `node` is on your PATH. |
| Port 3000 already in use | Something else is on that port. Stop it, or run `npm run dev -- -p 3001`. |

For a production build: `npm run build && npm start`.

## Demo accounts

Seeded by `npm run db:seed`. **Password for all four: `gdc12345`.**

| Role | Sign in with | Lands on |
|---|---|---|
| Administrator | `registrar` | `/portal/admin` |
| Teacher | `bilal.ahmad` | `/portal/teacher` |
| Student | `2023-GDCZ-CS-045` | `/portal/student` |
| Library staff | `librarian` | `/portal/admin` |

Change these before the site is used for anything real.

## What each role can do

**Administrator**
- Publish notices (with category, department targeting, scheduled publication and expiry) — they appear on the public site instantly
- **Upload event photographs and videos from the local drive**, and delete them
- Verify marks submitted by teachers, which is what makes results visible to students
- See enrolment figures, average attendance, open complaints and the activity log

**Teacher**
- Mark daily attendance for assigned courses; saving again for the same date updates it
- Enter sessional and mid-term marks and submit them for verification
- See per-student attendance percentages, low-attendance flags and grade distribution

**Student**
- Attendance per course, computed from the attendance records, with a warning below 75%
- GPA computed from verified marks using the published grading scale
- Marks, and notices targeted at their department

**Visitor (no account)**
- Every public page, site-wide search, event photographs and videos
- Submit an admission application with document upload, a complaint, a certificate request (each returns a tracking reference) and a general enquiry

## Event media upload

The feature lives on `/events` (and `/portal/admin/media`). The button is visible only to a signed-in
administrator; everyone else sees a sign-in hint.

- Choose files or drag them in; photos and videos both supported
- Validated for type and size **in the browser and again on the server** — the server check is the one that counts
- JPG, PNG, WebP, GIF, AVIF up to 8 MB; MP4, WebM, OGG, MOV up to 100 MB; 12 files per upload
- A still is captured from each video in the browser and stored as its thumbnail
- Each file gets a description used as alt text
- Files are written to `public/uploads` under generated names — never the name the browser supplied — with metadata in Postgres

## Project structure

```
start.bat / start.command   Double-click launchers (setup + run)
scripts/setup.mjs           One-command setup: database, tables, content
app/
  (public)/            Public website — home, about, departments, academics, faculty,
                       admissions, scholarships, notices, events, gallery, library,
                       facilities, downloads, student services, alumni, contact, search
  portal/login/        Sign-in page
  portal/(dash)/       Protected dashboards: admin, teacher, student
  api/                 Route handlers for file uploads (event media, admission documents)
  actions/             Server actions: auth, admin, teaching, public forms
components/            Shared React components (header, nav, uploader, media gallery…)
lib/
  db.ts                Prisma client
  auth.ts              Sessions, password hashing, RBAC helpers
  grading.ts           Grade scale, GPA and attendance rules — the single source of truth
  search.ts            Site-wide search
  i18n.ts              English / Urdu strings
prisma/
  schema.prisma        28 models covering every SRS module
  seed.ts              Seeds content and demo accounts
  seed-data.ts         The college's content
public/uploads/        Uploaded media (gitignored — runtime data)
```

## Security

- Passwords hashed with bcrypt (12 rounds); never stored or logged in plain text
- Sessions stored in the database, referenced by an `httpOnly`, `sameSite=lax` cookie
- Accounts lock for 15 minutes after 5 failed sign-in attempts
- Sign-in failures return the same message whether the account exists or not, and spend the same time, so the form cannot be used to discover usernames
- **Every role check runs on the server.** Hiding a button is not a permission check: posting directly to the upload API as a student or anonymous visitor returns 403
- Uploads validated for MIME type and size server-side, written under generated filenames
- All form input validated with Zod on the server; grades and merit scores are computed server-side and never accepted from the browser
- Administrative actions recorded in an activity log with the responsible account

## Useful commands

```bash
npm run dev          # development server
npm run build        # production build (runs TypeScript checks)
npm run typecheck    # types only
npm run db:seed      # re-seed (clears and refills the tables it owns)
npm run db:reset     # drop, re-migrate and re-seed — wipes everything
npm run db:studio    # browse the database in Prisma Studio
```

## Content note

The campus photograph in `public/images` is genuine. Names, statistics, notices, contact numbers and the
remaining gallery tiles are realistic placeholders — replace them in `prisma/seed-data.ts` (or edit
records through the admin panel) before the site goes live. The privacy and accessibility statements
should be reviewed and approved by the college administration.

## Accessibility

Server-rendered HTML that works without JavaScript for reading and filtering; one `h1` and a `main`
landmark per page; labelled form controls; keyboard-operable menus and dialogs; visible focus rings;
WCAG 2.1 AA contrast in both themes; `prefers-reduced-motion` respected; English/Urdu with full RTL.
Verified across all 22 public routes at 390px and 1280px.

## History

This repository previously held a static HTML version of the same site. It is preserved in git history
at commit `29ee449` if you ever need it.
