# Requirements coverage — full-stack build

How this repository maps onto the modules of the *Complete Software Requirements Specification* and the
phases of the *Detailed Feature Proposal*.

Legend: **Live** = working against the database · **Partial** = core works, extensions remain ·
**Future** = not started, by design.

| # | SRS module | Status | Where |
|---|---|---|---|
| 1 | Public website / visitor side | **Live** | `app/(public)/` — every page reads from Postgres |
| 2 | Admissions | **Live** — online application with document upload, server-side merit calculation, tracking reference, admin queue | `app/(public)/admissions`, `app/api/admissions` |
| 3 | Student portal | **Live** — attendance %, low-attendance alerts, GPA, marks, notices, all computed from records | `app/portal/(dash)/student` |
| 4 | Teacher portal | **Live** — attendance marking (upsert per date), marks entry, submission for verification, grade distribution | `app/portal/(dash)/teacher` |
| 5 | Admin panel | **Live** — notice publishing, result verification, event media, enrolment analytics, complaints, activity log | `app/portal/(dash)/admin` |
| 6 | Notice & announcement system | **Live** — categories, department targeting, scheduled publication, expiry, search, pinning | `app/(public)/notices`, `NoticeComposer` |
| 7 | Examination & result management | **Live** — teacher submits → admin verifies → student sees; GPA computed from the published grade scale | `lib/grading.ts`, teacher + admin + student portals |
| 8 | Attendance management | **Live** — daily records, per-course and overall percentages, threshold warnings | `app/actions/teaching.ts` |
| 9 | Timetable management | **Partial** — course catalogue per department and semester is live; automatic generation and conflict detection remain | `app/(public)/academics#timetable` |
| 10 | Digital library | **Partial** — catalogue with live search, availability and categories; issue/return workflow remains | `app/(public)/library` |
| 11 | Fees & finance | **Partial** — fee structure per programme and dues status in the student portal; payment gateway explicitly out of scope | `Programme.fee`, `Student.duesCleared` |
| 12 | Scholarship module | **Live** (listing) — schemes with deadlines and open/closed state | `app/(public)/scholarships` |
| 13 | Student services | **Live** — six certificate types, requests stored with a reference, five-stage tracking that reads the real record | `app/(public)/student-services` |
| 14 | Complaint / feedback | **Live** — categorised, routed to a department, anonymous option, reference number, admin queue | `app/actions/public.ts`, admin dashboard |
| 15 | Events management | **Live** — events, registration, **photo and video upload by administrators** | `app/(public)/events`, `app/api/events/media` |
| 16 | Alumni management | **Live** (directory) | `app/(public)/alumni` |
| 17 | Career & jobs | **Live** (listings) | `app/(public)/alumni#careers` |
| 18 | Hostel management | **Partial** — information published; allocation workflow remains | `app/(public)/facilities` |
| 19 | Transport management | **Partial** — routes and timings published | `app/(public)/facilities` |
| 20 | College facilities | **Live** | `app/(public)/facilities` |
| 21 | Document management | **Live** for uploads (event media, admission documents); download index is live, file attachment for prospectus/forms remains | `app/api/events/media`, `app/(public)/downloads` |
| 22 | Search system | **Live** — one server-side query across nine content types | `lib/search.ts` |
| 23 | Notification system | **Partial** — on-site notices and portal notification lists are live; email/SMS/push delivery remains | `Notice.audience` |
| 24 | AI features | **Future** | — |
| 25 | Security requirements | **Live** — bcrypt hashing, server-side sessions, RBAC enforced on the server, account lockout, Zod validation, upload validation, activity log. HTTPS is a deployment concern | `lib/auth.ts`, route handlers |
| 26 | Accessibility | **Live** — see the Accessibility section of the README | `app/(public)/accessibility` |
| 27 | Multi-language | **Partial** — English/Urdu with RTL for navigation, headings and labels, chosen server-side via cookie | `lib/i18n.ts` |
| 28 | Analytics dashboard | **Live** — enrolment by department, attendance averages, verification queue, media storage | `app/portal/(dash)/admin` |
| 29 | Advanced reporting | **Future** — export to PDF/Excel not implemented | — |
| 30 | QR code system | **Future** | — |
| 31 | Additional proposed features | **Future** — parent portal, course evaluation, FYP repository, societies | — |

## Roadmap status

- **Phase 1 — Core system.** Complete.
- **Phase 2 — Recommended features.** Largely complete: REST/server actions, PostgreSQL, authentication
  and RBAC, document upload, GPA computation, complaint routing, library catalogue, tracked service
  requests. Outstanding: automatic timetable generation with conflict detection, library issue/return
  and fines, email/SMS notification, PDF/Excel export.
- **Phase 3 — Future scope.** Not started: QR codes, AI chatbot, academic-risk analytics, semantic search.

## How the guarantees were verified

- Production build passes with TypeScript checks across all 30 routes.
- A scripted browser run signs in as teacher, admin and student in turn: marks attendance, submits marks,
  verifies them as admin, publishes a notice, and confirms the notice reaches the public site and the
  student dashboard — 15 assertions, all passing.
- Upload tested with a real photograph and a real video: files land on disk under generated names, the
  video poster frame is captured and stored, and both are served over HTTP and visible to a logged-out
  visitor.
- Authorisation probed directly against the API: anonymous and student `POST`/`DELETE` both return 403,
  and a student visiting `/portal/admin` is redirected to their own dashboard.
- All 22 public routes checked for console errors, single `h1`, `main` landmark, labelled controls, named
  links and buttons, image alt text, and horizontal overflow at 390px and 1280px.
- Data confirmed to survive a full server restart.
