import 'server-only';
import type { PrismaClient, Institution } from '@prisma/client';

/**
 * Starter content for a college that has just set itself up.
 *
 * This is deliberately small and deliberately obvious. Every name here is a
 * placeholder, never a real person, because a copy of this repository must
 * never present another institution's staff as though they were this one's.
 * A new college edits these rows or deletes them; the point is to show the
 * shape of each screen rather than to fill the site with invented facts.
 *
 * It creates no students, attendance or marks — those are real records, and
 * inventing them in a live college's database would be worse than an empty
 * portal. `npm run db:seed` loads the full demo dataset for development.
 */

const departments = [
  {
    slug: 'computer-science',
    name: 'Computer Science',
    nameUr: 'Computer Science',
    icon: 'cpu',
    intro:
      'Replace this with a short description of the department — what it teaches, how long it has been running and what its laboratories offer.',
    hodName: 'Head of Department',
    courseTitles: ['Programming Fundamentals', 'Data Structures & Algorithms', 'Database Systems'],
    facilities: ['Computer laboratory', 'Project room'],
    achievements: ['Add the department’s achievements here.'],
  },
  {
    slug: 'general-science',
    name: 'General Science',
    nameUr: 'General Science',
    icon: 'flask',
    intro:
      'Replace this with a short description of the department. You can add, rename or remove departments from the admin panel at any time.',
    hodName: 'Head of Department',
    courseTitles: ['Introductory Physics', 'Introductory Chemistry', 'Introductory Biology'],
    facilities: ['Science laboratory'],
    achievements: ['Add the department’s achievements here.'],
  },
];

const leaders = [
  { role: 'Principal', icon: 'user', detail: 'Overall academic and administrative head of the institution.' },
  { role: 'Vice Principal', icon: 'users', detail: 'Academic coordination, discipline and timetabling.' },
  { role: 'Registrar / Admissions', icon: 'clipboard', detail: 'Admissions, enrolment, student records and certificates.' },
  { role: 'Controller of Examinations', icon: 'chart', detail: 'Examination conduct, marks verification and result publication.' },
  { role: 'Librarian', icon: 'book', detail: 'Library services, catalogue and digital resources.' },
];

const facilities = [
  { name: 'Central Library', icon: 'book', detail: 'Describe the library — its collection, reading hall and opening hours.' },
  { name: 'Science Laboratories', icon: 'flask', detail: 'Describe the laboratories available to students.' },
  { name: 'Computer Laboratory', icon: 'cpu', detail: 'Describe the computer laboratory and its equipment.' },
  { name: 'Sports Ground', icon: 'trophy', detail: 'Describe the sports facilities and the games played here.' },
  { name: 'Transport', icon: 'bus', detail: 'Describe the college transport routes, if any.' },
  { name: 'Prayer Room', icon: 'mosque', detail: 'Describe the prayer facilities on campus.' },
];

const gallery = [
  { title: 'Main Academic Block', category: 'Campus', tone: 'a' },
  { title: 'Central Library', category: 'Campus', tone: 'b' },
  { title: 'Computer Laboratory', category: 'Academic', tone: 'c' },
  { title: 'Science Laboratory', category: 'Academic', tone: 'd' },
  { title: 'Sports Ground', category: 'Sports', tone: 'e' },
  { title: 'Annual Function', category: 'Events', tone: 'f' },
];

const admissionStages = [
  { stage: 'Applications open', dates: 'Set the dates for your admission cycle', status: 'Open' },
  { stage: 'Last date to apply', dates: 'Set the closing date', status: 'Upcoming' },
  { stage: 'First merit list', dates: 'Set the publication date', status: 'Upcoming' },
  { stage: 'Enrolment and fee deposit', dates: 'Set the enrolment window', status: 'Upcoming' },
  { stage: 'Classes begin', dates: 'Set the start of term', status: 'Upcoming' },
];

/** Notices dated relative to setup, so the board is never full of past dates. */
function exampleNotices(inst: Institution) {
  const today = new Date();
  const inDays = (n: number) => new Date(today.getTime() + n * 86_400_000);

  return [
    {
      title: `Welcome to the new ${inst.shortName} website`,
      category: 'General',
      pinned: true,
      publishAt: today,
      body:
        'This is an example notice. Sign in to the portal as the administrator and use the dashboard to publish your own announcements — you can attach a datesheet or merit list to any of them.\n\nDelete this notice once you have published your first real one.',
    },
    {
      title: 'Admissions schedule to be announced',
      category: 'Admission',
      pinned: false,
      publishAt: today,
      expiresAt: inDays(60),
      body:
        'Replace this with your admission announcement. The admission schedule shown on the admissions page is edited from the same place.',
    },
    {
      title: 'Examination datesheet',
      category: 'Examination',
      pinned: false,
      publishAt: today,
      expiresAt: inDays(45),
      body:
        'Replace this with your examination announcement, and attach the datesheet as a PDF so students can download it.',
    },
  ];
}

function exampleEvents(inst: Institution) {
  const today = new Date();
  const inDays = (n: number) => new Date(today.getTime() + n * 86_400_000);

  return [
    {
      slug: 'orientation-day',
      title: 'Orientation Day',
      summary: `An introduction to ${inst.shortName} for newly admitted students and their parents.`,
      date: inDays(21),
      time: '09:00 – 12:00',
      venue: 'Main Hall',
      category: 'Academic',
    },
    {
      slug: 'annual-sports-gala',
      title: 'Annual Sports Gala',
      summary: 'Inter-departmental athletics and team sports, followed by the prize distribution.',
      date: inDays(60),
      time: '08:00 – 16:00',
      venue: 'Sports Ground',
      category: 'Sports',
    },
  ];
}

/**
 * Installs the starter content. Safe to skip entirely — a college that would
 * rather begin from nothing simply leaves the box unticked during setup.
 */
export async function installExampleContent(db: PrismaClient, inst: Institution) {
  const createdDepartments = [];
  for (const [i, d] of departments.entries()) {
    createdDepartments.push(
      await db.department.create({
        data: {
          slug: d.slug,
          name: d.name,
          nameUr: d.nameUr,
          icon: d.icon,
          intro: d.intro,
          hodName: d.hodName,
          hodDesignation: 'Associate Professor',
          established: inst.established,
          email: `${d.slug}@${inst.email.split('@')[1] ?? 'example.edu'}`,
          courseTitles: d.courseTitles,
          facilities: d.facilities,
          achievements: d.achievements,
          order: i,
        },
      }),
    );
  }

  await db.programme.createMany({
    data: [
      {
        code: 'PROG-1',
        name: 'Bachelor of Computer Science',
        level: 'Undergraduate',
        duration: 'Set the length of this programme',
        seats: 50,
        eligibility: 'Set the entry requirements for this programme',
        fee: 'Set the fee for this programme',
        departmentId: createdDepartments[0].id,
      },
      {
        code: 'PROG-2',
        name: 'Certificate in General Science',
        level: 'Pre-degree',
        duration: 'Set the length of this programme',
        seats: 80,
        eligibility: 'Set the entry requirements for this programme',
        fee: 'Set the fee for this programme',
        departmentId: createdDepartments[1].id,
      },
    ],
  });

  await db.leader.createMany({
    data: leaders.map((l, i) => ({
      role: l.role,
      // The principal's name is the one fact setup already collected.
      name: l.role === 'Principal' && inst.principalName ? inst.principalName : 'Name not set',
      detail: l.detail,
      icon: l.icon,
      order: i,
    })),
  });

  await db.facility.createMany({
    data: facilities.map((f, i) => ({ name: f.name, icon: f.icon, detail: f.detail, order: i })),
  });

  await db.galleryItem.createMany({
    data: gallery.map((g, i) => ({ title: g.title, category: g.category, tone: g.tone, order: i })),
  });

  await db.admissionStage.createMany({
    data: admissionStages.map((a, i) => ({ stage: a.stage, dates: a.dates, status: a.status, order: i })),
  });

  await db.notice.createMany({ data: exampleNotices(inst) });
  await db.event.createMany({ data: exampleEvents(inst) });

  await db.download.createMany({
    data: [
      { title: 'Prospectus', category: 'Prospectus', fileType: 'PDF', size: '—' },
      { title: 'Admission Form', category: 'Admission', fileType: 'PDF', size: '—' },
    ],
  });
}
