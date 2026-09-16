# Requirements coverage — Phase 1 (Presentation Layer)

How this repository maps onto the modules of the *Complete Software Requirements Specification* and the
phases of the *Detailed Feature Proposal*.

Legend: **Built** = working in this repository · **UI ready** = the interface exists and is wired to the
sample data, but needs the Phase 2 API to persist or compute anything · **Phase 2/3** = not started, by design.

| # | SRS module | Status | Where |
|---|---|---|---|
| 1 | Public website / visitor side | **Built** | `index.html`, `about.html`, `departments.html`, `department.html`, `facilities.html` |
| 2 | Admissions | **UI ready** — announcements, eligibility, schedule, merit weighting, documents, online application form with file upload validation, application tracking | `admissions.html` |
| 3 | Student portal | **UI ready** — dashboard, subject-wise attendance with low-attendance alert, GPA trend, marks, assignments, timetable, library account, dues | `portal/student.html` |
| 4 | Teacher / faculty portal | **UI ready** — courses, attendance marking, marks entry submitted for verification, assignments, grade distribution | `portal/teacher.html` |
| 5 | Admin panel | **UI ready** — admissions queue, enrolment analytics, notice publishing, result verification, complaints, activity log, RBAC matrix | `portal/admin.html` |
| 6 | Notice & announcement system | **Built** — categories, department targeting, search, pinned/urgent notices, single-notice view, subscription form | `notices.html`, home page strip |
| 7 | Examination & result management | **UI ready** — examination calendar, rules, result enquiry, grading scheme; teacher entry → admin verification flow is modelled in the portals | `academics.html#examinations` |
| 8 | Attendance management | **UI ready** — percentage display, threshold warnings, teacher marking sheet | `portal/student.html`, `portal/teacher.html` |
| 9 | Timetable management | **Built** (display) — per-department, per-semester weekly timetable with room allocation. Automatic generation and conflict detection are Phase 2 | `academics.html#timetable` |
| 10 | Digital library | **Built** (catalogue) — search by title/author/ISBN/subject, availability, shelf, borrowing rules, reservation form | `library.html` |
| 11 | Fees & finance | **Built** (information) — fee structure per programme, challan download, dues status in the student portal. Online payment is explicitly out of scope | `academics.html#programs`, `downloads.html` |
| 12 | Scholarship module | **Built** — open schemes, eligibility, deadlines with open/closed state, college concessions, application guidance | `scholarships.html` |
| 13 | Student services | **Built** — six certificate types with turnaround times, request form, five-stage tracked workflow | `student-services.html` |
| 14 | Complaint / feedback | **UI ready** — categorised submission with department routing, anonymous option, reference number, admin queue with ageing | `contact.html#complaint`, `portal/admin.html#complaints` |
| 15 | Events management | **Built** — upcoming events, academic calendar, past events, registration form | `events.html` |
| 16 | Alumni management | **Built** — profiles, registration, association activities | `alumni.html` |
| 17 | Career & jobs | **Built** — opportunities table, guidance sections, employer note | `alumni.html#careers` |
| 18 | Hostel management | **Built** (information) — capacity, allocation criteria, application form reference | `facilities.html`, `student-services.html` |
| 19 | Transport management | **Built** (information) — four routes with coverage and departure times | `facilities.html` |
| 20 | College facilities | **Built** — ten facilities, laboratory inventory, FAQs | `facilities.html` |
| 21 | Document management | **Built** (index) — categorised, searchable document list with type, size and publication date | `downloads.html` |
| 22 | Search system | **Built** — one index across departments, faculty, notices, events, programmes, books, documents, scholarships, facilities and services, with scoring and suggestions | `search.html`, `assets/js/main.js` |
| 23 | Notification system | **Partial** — on-site notices and portal notification lists are built; email/SMS/push delivery is Phase 2 | `notices.html`, portals |
| 24 | AI features | **Phase 3** | — |
| 25 | Security requirements | **Partial** — no secrets in the client, no inline event handlers, all rendered strings HTML-escaped, `portal/` excluded from crawling, the RBAC model is documented. Hashing, sessions, CSRF, rate limiting and audit logging belong to the Phase 2 server | `assets/js/main.js`, `portal/admin.html#faculty` |
| 26 | Accessibility | **Built** — see the Accessibility section below | `accessibility.html` |
| 27 | Multi-language | **Partial** — English/Urdu toggle with RTL for navigation, headings and key labels; full body-text translation is a content task | `assets/js/main.js` |
| 28 | Analytics dashboard | **UI ready** — enrolment, applications, attendance, complaints and grade-distribution charts | `portal/admin.html` |
| 29 | Advanced reporting | **Phase 2** — export buttons are present but not wired | `portal/teacher.html` |
| 30 | QR code system | **Phase 3** | — |
| 31 | Additional proposed features | Parent portal, course evaluation, FYP repository and societies are **Phase 2/3**. The FYP archive is referenced in the library page | `library.html` |

## Proposal roadmap

- **Phase 1 — Core system:** public website, portal interfaces, notices, results display, timetable. **Complete in this repository.**
- **Phase 2 — Recommended features:** REST API, relational database, authentication and RBAC enforcement, document upload and storage, automated merit lists, GPA/CGPA computation, timetable conflict detection, library reservations and fines, complaint routing, email/SMS notification.
- **Phase 3 — Future scope:** QR-based identity, attendance, library and event check-in; AI chatbot; academic-risk analytics; semantic search; advanced result analytics.

## Accessibility measures in this phase

- Skip link, `<main>` landmark and a single `h1` on every page.
- All 26 pages checked for: one `h1`, present landmarks, labelled form controls, named links and buttons.
- Colour contrast verified for every text/background pair in both themes against WCAG 2.1 AA (4.5:1 for
  normal text, 3:1 for large text). The accent colour used for small text is a separate, darker token
  (`--accent-text`) for exactly this reason.
- Dropdown menus, tabs and the gallery lightbox are operable by keyboard, with `Escape` to close and
  focus returned to the trigger.
- `prefers-reduced-motion` disables scroll reveals, counters and smooth scrolling.
- Layout verified at 320px–1280px with no horizontal overflow.

## Known limitations

1. Lists are rendered client-side from `data.js`, so pages need JavaScript; a `<noscript>` message points
   to alternatives. Server-side rendering is a Phase 2 consideration for search-engine indexing.
2. Urdu translation covers interface labels rather than full body text.
3. One real campus photograph is in use (hero, gallery, About and Contact pages); the remaining
   gallery tiles and all document files are still placeholders pending official assets.
