# Government Degree College Zaim — Website & Management Portal

The public website and portal front-end for the **Government College Website & Management Portal**,
built to the *Software Requirements Specification* and the *Detailed Feature Proposal* prepared for the
7th-semester Computer Science team project.

This repository contains **Phase 1 of the roadmap in the proposal**: the complete presentation layer —
the public website and the role-specific portal interfaces — implemented as a responsive, accessible,
bilingual static site with no build step and no runtime dependencies.

---

## Contents

| Area | Pages |
|---|---|
| **Public website** | Home, About (history, vision, mission, principal's message, administration), Departments, Department detail, Programmes/Timetable/Examinations, Faculty directory, Admissions, Scholarships, Notices, Events, Gallery, Digital library, Facilities, Downloads, Student services, Alumni & careers, Contact, Search |
| **Portal** | Login (four roles), Student dashboard, Faculty dashboard, Administration dashboard |
| **Statutory** | Sitemap, Accessibility statement, Privacy policy, 404 |

26 pages in total.

## Running it

No build, no install, no server required:

```bash
git clone https://github.com/amnaanamds-cmyk/GDC-zaim-official--website1.git
cd GDC-zaim-official--website1
# open index.html in a browser, or serve the folder:
python3 -m http.server 8000     # then visit http://localhost:8000
```

A local server is recommended over `file://` so that query-string pages
(`department.html?id=…`, `notices.html?id=…`) and relative links behave exactly as they will in production.

**Deploying to GitHub Pages:** Settings → Pages → *Deploy from a branch* → select this branch, folder `/ (root)`.
The site is served as-is; `.nojekyll` stops GitHub from reprocessing the files.

## Project structure

```
index.html … search.html      Public pages (standalone HTML)
portal/                       login.html, student.html, teacher.html, admin.html
assets/css/styles.css         Design system: tokens, components, light/dark, LTR/RTL, print
assets/js/data.js             ALL site content — the single source of truth
assets/js/main.js             Navigation, theme, language, search index, shared helpers
docs/requirements-coverage.md Which SRS requirements this phase implements
```

### Editing content

Almost nothing is hard-coded in the pages. Departments, faculty, notices, events, programmes, books,
downloads, scholarships, services, facilities and gallery items all live in **`assets/js/data.js`**, and
every page — plus the site-wide search index — renders from it. To publish a notice, add an object to the
`notices` array; it appears on the home page, the notice board, the relevant department page and in search
results automatically.

When the Phase 2 API is ready, replace the literals in `data.js` with `fetch()` calls to the REST
endpoints. The page-level render functions do not need to change.

The site header and footer are written into each page directly (standard for a dependency-free static
site). If you change the navigation, change it in every page — or generate the pages from a template once
you move to a framework.

## What is implemented

- **Responsive layout** — single-column on phones, no horizontal scrolling, verified from 320px upward.
- **Light and dark themes** — follows the system preference, overridable, remembered per browser.
- **English / Urdu with RTL** — the language toggle switches navigation, headings and key labels, sets
  `dir="rtl"`, and isolates Latin runs (phone numbers, dates, references) so they are not reordered.
- **Site-wide search** — one index built from `data.js`, covering departments, faculty, notices, events,
  programmes, library titles, documents, scholarships, facilities and student services.
- **Filtering and search** on departments, faculty, notices, gallery, library catalogue and downloads.
- **Portal dashboards** — attendance with low-attendance alerts, GPA trend, marks tables, assignment
  tracking, library account, attendance marking, marks entry with admin verification, admissions queue,
  activity log and an RBAC permission matrix.
- **Accessibility** — skip link, landmarks, one `h1` per page, labelled controls, keyboard-operable menus,
  tabs and gallery, visible focus, `prefers-reduced-motion` support, and colour contrast meeting WCAG 2.1
  AA (verified for every text/background pair in the palette, both themes).
- **Print stylesheet** for notices, timetables and result pages.

## What is not implemented yet

This phase has **no backend**. Forms (admission application, complaints, service requests, event and
alumni registration, result enquiry, login) validate input and return a reference number, but nothing is
stored, and the portal login accepts any credentials and opens the sample dashboard for the chosen role.
Every such form says so on the page.

Phase 2 (REST API, database, real authentication, RBAC enforcement, file uploads) and Phase 3 (QR codes,
AI chatbot, academic-risk analytics, semantic search) are described in the proposal and mapped in
[`docs/requirements-coverage.md`](docs/requirements-coverage.md).

## Content note

College details — the principal's name, faculty, statistics, notices, contact numbers and photographs —
are realistic placeholders. Replace them with official records in `assets/js/data.js` and the page copy
before this site goes live. The privacy policy and accessibility statement should be reviewed and approved
by the college administration.

## Browser support

Current Chrome, Edge, Firefox and Safari, including mobile. The layout uses CSS grid, custom properties and
logical properties; there is no JavaScript framework and no polyfill.
