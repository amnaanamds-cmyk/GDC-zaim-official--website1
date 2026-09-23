# College Website & Management Portal

A full-stack college portal: public website plus student, faculty and administration
dashboards, built as a **Next.js 16 / React 19** application on **PostgreSQL**.

Everything on the site comes from the database. Publishing a notice in the admin panel puts it on the
home page immediately; a teacher marking attendance changes the student's percentage; an administrator
uploading event photographs and videos from their computer makes them visible to every visitor.

**No college is hardcoded into this project.** A fresh copy pointed at an empty database belongs to
nobody: the first person to open it is taken to a setup wizard that records the institution's name,
contact details, principal and crest, and creates the administrator account. From that moment the
whole site — header, footer, page titles, email addresses, reference numbers — is that college's.
See [Setting this up for a college](#setting-this-up-for-a-college).

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

That installs the dependencies, creates the database and starts the site. The first run asks once for
the PostgreSQL password you chose at install time; after that it asks nothing. When it says `Ready`,
open **http://localhost:3000** — the setup wizard is waiting to record your college's details.

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

These exist only in the **demonstration dataset**, loaded by `npm run db:seed` for development.
A real college never runs that — it sets itself up through the wizard and chooses its own
administrator username and password.

**Password for all four: `gdc12345`.**

| Role | Sign in with | Lands on |
|---|---|---|
| Administrator | `registrar` | `/portal/admin` |
| Teacher | `bilal.ahmad` | `/portal/teacher` |
| Student | `2023-GDCZ-CS-045` | `/portal/student` |
| Library staff | `librarian` | `/portal/admin` |

Change these before the site is used for anything real.

## What each role can do

**Administrator**
- Publish announcements (with category, department targeting, scheduled publication, expiry and an **attached PDF**) — they appear on the public site instantly
- **Change the principal's photograph** and every other leadership portrait, name and job description
- **Replace the home page banner and the About page photograph**
- **Fill the gallery tiles**, add new ones and delete them
- **Publish downloadable documents** — prospectus, forms, datesheets, policies
- **Upload event photographs and videos from the local drive**, and delete them
- Verify marks submitted by teachers, which is what makes results visible to students
- See enrolment figures, average attendance, open complaints and the activity log

None of this needs a developer, a code change or a redeploy. See
[Uploading and changing pictures](#uploading-and-changing-pictures).

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

## Setting this up for a college

Each college gets its own copy of this project, its own database and its own deployment. Nothing is
shared between them, so one college can never see or change another's records.

### 1. Make a copy of the repository

On GitHub, **Use this template** → **Create a new repository** (or fork it, or download the ZIP and
push it to a new repository). Give it the new college's name.

### 2. Create a database

Any PostgreSQL will do. [Neon](https://neon.tech) has a free tier that suits a college site:
create a project, then copy the **pooled** connection string — the host contains `-pooler`.

### 3. Deploy it

On [Vercel](https://vercel.com): **Add New → Project**, import the repository, and before deploying add
one environment variable:

| Name | Value |
|---|---|
| `DATABASE_URL` | the pooled connection string from step 2 |

Tick Production, Preview and Development. Do **not** add `NODE_ENV` — setting it to `development`
would turn off the `secure` flag on session cookies.

Deploy. The build applies the migrations itself, so the tables are created for you.

### 4. Add Blob storage

Project → **Storage** → **Create Database** → **Blob**, connect it to the project, then **redeploy**.
Without this, photograph uploads fail: Vercel's filesystem is read-only and is wiped on every deploy.

### 5. Open the site and set it up

The first visit lands on the setup wizard. Fill in:

- the college's name, short name, year founded and affiliation, and upload its crest
- where it is — city or district, postal address, telephone and email
- the principal's name and title
- the administrator account: name, username, email and a password of at least 10 characters

Tick **Add example content** to start with placeholder departments, notices, events and gallery tiles
so every page has something on it — all clearly marked and easy to delete. Nothing invents students,
attendance or results.

Press **Create the site** and you are signed in as the administrator, on your own dashboard.

**The wizard then closes permanently.** It is tied to accounts existing, not to a flag, so once the
administrator account exists nobody can reach `/setup` and appoint themselves — visiting it redirects
to the sign-in page, and posting to it directly is refused.

### Afterwards

Everything entered during setup can be corrected from **Admin → Website content → College profile**,
including the crest, the principal's message and the college's history. See
[Uploading and changing pictures](#uploading-and-changing-pictures).

### Running a copy on your own computer

```bash
npm install
npm run setup     # creates the database and tables — and loads nothing
npm run dev       # open http://localhost:3000 and the wizard is waiting
```

`npm run setup -- --demo` loads the demonstration dataset instead, if you want to look around a
populated site before setting up a real one.

### What is stored where

| | Where it lives | Changed by |
|---|---|---|
| The college's name, contact details, principal, crest | `Institution` row in the database | the setup wizard, then Admin → Website content |
| Departments, faculty, notices, events, documents | the database | the admin panel |
| Photographs and uploaded files | `var/uploads`, or Vercel Blob | the admin panel |
| Page layout, wording that is the same everywhere | the code | a developer |

## Uploading and changing pictures

Everything below is done in a web browser. Nothing here requires the code, a terminal or a new deployment.

### Signing in

Go to **`/portal/login`** and sign in as the administrator — the account created during setup.

In the demonstration dataset that account is `registrar`, password `gdc12345`; a college that set
itself up through the wizard chose its own. Either way, see [Security](#security) before the site is
used for real.

Only the `ADMIN` role sees these screens. A teacher, a student or a signed-out visitor who types the
address in is sent away, and the upload endpoints answer `403` even if the request is made by hand.

### Where each picture is changed

| What you want to change | Where |
|---|---|
| Principal's photograph, and every other leadership portrait | **Admin → Website content → Principal & college leadership** |
| The big photograph on the home page | **Admin → Website content → Page photographs → Home page banner** |
| The photograph on the About page | **Admin → Website content → Page photographs → About page photograph** |
| Gallery tiles — library, computer lab, chemistry lab, zoology lab | **Admin → Website content → Photo gallery** |
| Prospectus, forms, datesheets, policies | **Admin → Website content → Downloadable documents** |
| Event photographs and videos | **Admin → Event media**, or the button on `/events` |
| Announcements, with an optional PDF attached | **Admin → Dashboard → Publish a notice** |

### Changing the principal's photograph

1. Sign in as `registrar`
2. **Website content** in the left-hand menu
3. Find the **Principal** card at the top of *Principal & college leadership*
4. **Choose file** — the picture you pick appears straight away, marked *New — not saved yet*
5. Correct the name or responsibilities in the same card if you need to
6. **Save this person**

The About page shows the new photograph immediately. **Remove photograph** puts the card back to its icon.

### Filling a gallery tile

The library and laboratory tiles ship as coloured placeholders. Open **Website content → Photo gallery**,
choose a file on the tile you want, write a one-line description for screen readers, and **Save this tile**.
*Add a new tile* at the end of the grid creates one that was not there before.

### Publishing an announcement with a document

**Admin → Dashboard**, fill in the notice, then use **Attachment** to add the datesheet or merit list.
The notice page offers it as a download, under its original filename.

### What the site accepts

| | Formats | Limit |
|---|---|---|
| Photographs | JPG, PNG, WebP, GIF, AVIF | 8 MB |
| Videos (events only) | MP4, WebM, OGG, MOV | 100 MB |
| Documents | PDF, Word, Excel | 20 MB |

Every file is checked in the browser for an instant answer **and again on the server**, which is the check
that decides. Files are stored under a generated name — never the name the browser supplied.

### Event media upload

The uploader on `/events` and `/portal/admin/media` takes photographs and videos in batches of up to 12 and
files them under the event they belong to. A still is captured from each video in the browser and stored as
its thumbnail, so a video tile has something to show without video tooling on the server.

## Project structure

```
start.bat / start.command   Double-click launchers (setup + run)
scripts/setup.mjs           One-command setup: database and tables
app/
  setup/               First-run wizard — claims a fresh copy for a college
  (public)/            Public website — home, about, departments, academics, faculty,
                       admissions, scholarships, notices, events, gallery, library,
                       facilities, downloads, student services, alumni, contact, search
  portal/login/        Sign-in page
  portal/(dash)/       Protected dashboards: admin, teacher, student
  api/                 Route handlers for file uploads (event media, admission documents)
  uploads/[...path]/   Serves uploaded files — they cannot live under public/
  actions/             Server actions: setup, auth, admin, teaching, public forms, website content
components/            Shared React components (header, nav, uploader, media gallery…)
  admin/               The website-content editor: photo picker, forms, delete buttons
lib/
  db.ts                Prisma client
  auth.ts              Sessions, password hashing, RBAC helpers
  grading.ts           Grade scale, GPA and attendance rules — the single source of truth
  site.ts              The institution — read from the database, never hardcoded
  setup.ts             Whether this copy has been claimed by a college yet
  example-content.ts   Neutral starter content offered during setup
  search.ts            Site-wide search
  i18n.ts              English / Urdu strings
prisma/
  schema.prisma        31 models covering every SRS module
  seed.ts              Seeds content and demo accounts
  seed-data.ts         The demonstration dataset (development only)
public/images/         Photographs shipped with the site (the fallbacks)
var/uploads/           Files uploaded from the admin panel (gitignored — runtime data)
```

## Deploying it live

The app runs on any host that supports Next.js. These steps are for Vercel, which is free for a
project this size.

**1. Create a hosted database.** Your laptop's PostgreSQL is not reachable from the internet.
[Neon](https://neon.tech) and [Supabase](https://supabase.com) both have free tiers. Create a database and copy
its **pooled** connection string — it looks like `postgresql://user:pass@host/db?sslmode=require`.

**2. Push your code to GitHub** (already done if you have been committing).

**3. Import the repository on Vercel.** New Project → pick the repo → before clicking Deploy, open
**Environment Variables** and add:

| Name | Value |
|---|---|
| `DATABASE_URL` | the pooled connection string from step 1 |

**4. Add a Blob store for uploads.** In the project: Storage → Create → **Blob**. Vercel adds
`BLOB_READ_WRITE_TOKEN` to the environment automatically. Without it the event photo and video uploads
will appear to work and then vanish on the next deploy, because a hosting platform's filesystem is not
permanent.

**5. Deploy.** The build runs `prisma migrate deploy` first, so the tables are created on the hosted
database automatically.

**6. Load the college content, once.** From your laptop, pointing at the hosted database:

```bash
# macOS / Linux
DATABASE_URL="<the pooled connection string>" npm run db:seed

# Windows PowerShell
$env:DATABASE_URL="<the pooled connection string>"; npm run db:seed
```

**7. Change the demo passwords.** They are published in this README. Sign in as `registrar` and change
them, or edit `prisma/seed.ts` before step 6.

After that, every `git push` redeploys automatically. Old deployments are kept, so you can roll back
from the Vercel dashboard at any time.

### Where uploads are stored

| | On your own server | Hosted on Vercel |
|---|---|---|
| Backend | `var/uploads` on disk | Vercel Blob |
| Chosen by | no `BLOB_READ_WRITE_TOKEN` | `BLOB_READ_WRITE_TOKEN` present |
| Served by | `app/uploads/[...path]/route.ts` | Blob's own CDN |

`lib/storage.ts` is the only file that knows the difference. To use S3 or Cloudinary instead, that is the
one file to change. Set `UPLOAD_DIR` to put the files somewhere else on disk — a mounted volume, say.

Uploads deliberately do **not** live under `public/`. Next.js takes a snapshot of that folder when the site
is built, so a photograph uploaded while the site is running would return 404 until the next build.

**On Vercel you must add Blob storage**, or uploading will fail: the filesystem there is read-only and is
wiped on every deploy. Project → **Storage** → **Create Database** → **Blob**, connect it to the project,
then redeploy so the new token is picked up.

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

`prisma/seed-data.ts` holds the **demonstration** dataset — one college, its departments, staff and
notices, used for development. The names and figures in it are realistic placeholders, and it belongs
to the deployment it was written for. A new college should never load it: setting up a copy is done
through the wizard, which records that college's own details and offers neutral starter content from
`lib/example-content.ts`.

The photographs in `public/images` are fallbacks used until a college uploads its own. The privacy and
accessibility statements should be reviewed and approved by the college administration before the site
goes live.

## Accessibility

Server-rendered HTML that works without JavaScript for reading and filtering; one `h1` and a `main`
landmark per page; labelled form controls; keyboard-operable menus and dialogs; visible focus rings;
WCAG 2.1 AA contrast in both themes; `prefers-reduced-motion` respected; English/Urdu with full RTL.
Verified across all 22 public routes at 390px and 1280px.

## History

This repository previously held a static HTML version of the same site. It is preserved in git history
at commit `29ee449` if you ever need it.
