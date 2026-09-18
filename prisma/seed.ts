/**
 * Seeds a fresh database with the college's content and a working set of
 * demo accounts, students, enrolments, attendance and marks so every screen
 * in the portal has real data to show.
 *
 *   npm run db:seed
 *
 * Safe to re-run: it clears the tables it owns first.
 */
import { PrismaClient, Role, AttendanceStatus, MarkStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import {
  departments as deptData,
  faculty as facultyData,
  notices as noticeData,
  events as eventData,
  programmes as programmeData,
  admissionSchedule,
  books as bookData,
  downloads as downloadData,
  scholarships as scholarshipData,
  facilities as facilityData,
  galleryItems,
  alumni as alumniData,
  careers as careerData,
  leaders as leaderData,
  siteImages as siteImageData,
} from './seed-data';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

/** Everyone in the demo shares this password — stated plainly in the README. */
const DEMO_PASSWORD = 'gdc12345';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  console.log('Clearing existing rows…');
  // Order matters: children before parents.
  await db.attendanceRecord.deleteMany();
  await db.mark.deleteMany();
  await db.enrollment.deleteMany();
  await db.student.deleteMany();
  await db.course.deleteMany();
  await db.applicationDocument.deleteMany();
  await db.application.deleteMany();
  await db.eventMedia.deleteMany();
  await db.eventRegistration.deleteMany();
  await db.event.deleteMany();
  await db.notice.deleteMany();
  await db.programme.deleteMany();
  await db.faculty.deleteMany();
  await db.complaint.deleteMany();
  await db.department.deleteMany();
  await db.book.deleteMany();
  await db.download.deleteMany();
  await db.scholarship.deleteMany();
  await db.serviceRequest.deleteMany();
  await db.contactMessage.deleteMany();
  await db.galleryItem.deleteMany();
  await db.leader.deleteMany();
  await db.siteImage.deleteMany();
  await db.facility.deleteMany();
  await db.alumnus.deleteMany();
  await db.careerOpportunity.deleteMany();
  await db.admissionStage.deleteMany();
  await db.activityLog.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  /* ---------------- Accounts ---------------- */
  console.log('Creating accounts…');
  const admin = await db.user.create({
    data: {
      email: 'registrar@gdczaim.edu.pk',
      username: 'registrar',
      passwordHash,
      name: 'Mr. Naeem Akhtar',
      role: Role.ADMIN,
    },
  });
  const teacherUser = await db.user.create({
    data: {
      email: 'bilal.ahmad@gdczaim.edu.pk',
      username: 'bilal.ahmad',
      passwordHash,
      name: 'Mr. Bilal Ahmad',
      role: Role.TEACHER,
    },
  });
  const librarian = await db.user.create({
    data: {
      email: 'library@gdczaim.edu.pk',
      username: 'librarian',
      passwordHash,
      name: 'Mr. Naveed Anjum',
      role: Role.LIBRARIAN,
    },
  });

  /* ---------------- Departments ---------------- */
  console.log('Creating departments…');
  const deptBySlug = new Map<string, string>();
  for (const [i, d] of deptData.entries()) {
    const created = await db.department.create({
      data: {
        slug: d.id,
        name: d.name,
        nameUr: d.nameUr,
        icon: d.icon,
        intro: d.intro,
        hodName: d.hod,
        hodDesignation: d.hodDesignation,
        established: d.established,
        email: d.email,
        courseTitles: d.courses,
        facilities: d.facilities,
        achievements: d.achievements,
        studentCount: d.students,
        facultyCount: d.faculty,
        order: i,
      },
    });
    deptBySlug.set(d.id, created.id);
  }

  /* ---------------- Faculty ---------------- */
  console.log('Creating faculty…');
  const facultyByEmail = new Map<string, string>();
  for (const [i, f] of facultyData.entries()) {
    const created = await db.faculty.create({
      data: {
        name: f.name,
        designation: f.designation,
        qualification: f.qualification,
        specialization: f.specialization,
        email: f.email,
        departmentId: deptBySlug.get(f.dept) ?? null,
        userId: f.email === 'bilal.ahmad@gdczaim.edu.pk' ? teacherUser.id : null,
        order: i,
      },
    });
    facultyByEmail.set(f.email, created.id);
  }

  /* ---------------- Programmes ---------------- */
  console.log('Creating programmes…');
  const programmeByCode = new Map<string, string>();
  for (const p of programmeData) {
    const created = await db.programme.create({
      data: {
        code: p.id,
        name: p.name,
        level: p.level,
        duration: p.duration,
        seats: p.seats,
        eligibility: p.eligibility,
        fee: p.fee,
        departmentId: deptBySlug.get(p.dept)!,
      },
    });
    programmeByCode.set(p.id, created.id);
  }

  /* ---------------- Courses ----------------
   * Each department's course list becomes real course rows spread across the
   * eight semesters. The Computer Science courses of semester 5 are the ones
   * the demo teacher teaches and the demo students take.                     */
  console.log('Creating courses…');
  const csDeptId = deptBySlug.get('computer-science')!;
  const bilalId = facultyByEmail.get('bilal.ahmad@gdczaim.edu.pk')!;
  const courseIds: Record<string, string> = {};

  for (const d of deptData) {
    const deptId = deptBySlug.get(d.id)!;
    const prefix = d.id.slice(0, 2).toUpperCase();
    for (const [i, title] of d.courses.entries()) {
      const semester = d.id === 'computer-science' && i < 5 ? 5 : ((i % 8) + 1);
      const course = await db.course.create({
        data: {
          code: `${prefix}-${300 + i}`,
          title,
          creditHours: /lab|practical/i.test(title) ? 1 : 3,
          semester,
          departmentId: deptId,
          teacherId: deptId === csDeptId && i < 5 ? bilalId : null,
        },
      });
      if (deptId === csDeptId && i < 5) courseIds[title] = course.id;
    }
  }
  const csSem5 = Object.entries(courseIds);

  /* ---------------- Students, enrolments, attendance, marks ---------------- */
  console.log('Creating students with attendance and marks…');
  const bscsId = programmeByCode.get('bscs')!;
  const roster = [
    { regNo: '2023-GDCZ-CS-045', name: 'Hamza Saeed', account: true, profile: [92, 68, 86, 79, 88] },
    { regNo: '2023-GDCZ-CS-001', name: 'Adeel Khan', account: false, profile: [88, 84, 90, 81, 86] },
    { regNo: '2023-GDCZ-CS-002', name: 'Bilal Hussain', account: false, profile: [71, 74, 69, 77, 72] },
    { regNo: '2023-GDCZ-CS-003', name: 'Fatima Noor', account: false, profile: [94, 96, 92, 95, 93] },
    { regNo: '2023-GDCZ-CS-004', name: 'Iqra Bibi', account: false, profile: [90, 88, 91, 87, 92] },
    { regNo: '2023-GDCZ-CS-005', name: 'Junaid Ali', account: false, profile: [82, 79, 85, 80, 83] },
    { regNo: '2023-GDCZ-CS-006', name: 'Kashif Mehmood', account: false, profile: [76, 73, 78, 74, 77] },
    { regNo: '2023-GDCZ-CS-007', name: 'Laiba Zahra', account: false, profile: [96, 94, 97, 93, 95] },
  ];

  // 24 teaching days ending just before "today" in the demo timeline.
  const classDates: Date[] = [];
  const cursor = new Date('2026-09-15T00:00:00Z');
  while (classDates.length < 24) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) classDates.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  classDates.reverse();

  for (const [si, s] of roster.entries()) {
    let studentUserId: string | null = null;
    if (s.account) {
      const u = await db.user.create({
        data: {
          email: 'hamza.saeed@student.gdczaim.edu.pk',
          username: s.regNo,
          passwordHash,
          name: s.name,
          role: Role.STUDENT,
        },
      });
      studentUserId = u.id;
    }

    const student = await db.student.create({
      data: {
        regNo: s.regNo,
        name: s.name,
        semester: 5,
        programmeId: bscsId,
        userId: studentUserId,
      },
    });

    for (const [ci, [, courseId]] of csSem5.entries()) {
      const enrollment = await db.enrollment.create({
        data: { studentId: student.id, courseId, semester: 5 },
      });

      // Attendance shaped to hit the intended percentage for this student.
      const target = s.profile[ci] ?? 85;
      const absences = Math.round(classDates.length * (1 - target / 100));
      const absentIdx = new Set<number>();
      for (let k = 0; k < absences; k++) {
        absentIdx.add((k * 7 + ci * 3 + si) % classDates.length);
      }
      await db.attendanceRecord.createMany({
        data: classDates.map((date, idx) => ({
          enrollmentId: enrollment.id,
          date,
          status: absentIdx.has(idx)
            ? idx % 5 === 0
              ? AttendanceStatus.LEAVE
              : AttendanceStatus.ABSENT
            : AttendanceStatus.PRESENT,
          markedById: teacherUser.id,
        })),
      });

      // Sessional and mid-term entered and verified; finals not yet taken.
      const base = Math.round(target / 4);
      await db.mark.create({
        data: {
          enrollmentId: enrollment.id,
          sessional: Math.min(25, base + (ci % 3)),
          midterm: Math.min(25, base - 1 + (si % 3)),
          status: MarkStatus.VERIFIED,
          submittedById: teacherUser.id,
          verifiedById: admin.id,
        },
      });
    }
  }

  /* ---------------- Notices ---------------- */
  console.log('Creating notices…');
  for (const n of noticeData) {
    await db.notice.create({
      data: {
        title: n.title,
        titleUr: n.titleUr,
        body: n.body,
        category: n.category,
        departmentId: n.dept === 'all' ? null : deptBySlug.get(n.dept) ?? null,
        pinned: n.pinned,
        publishAt: new Date(n.date),
        fileUrl: n.file || null,
        authorId: admin.id,
      },
    });
  }

  /* ---------------- Events ---------------- */
  console.log('Creating events…');
  for (const e of eventData) {
    await db.event.create({
      data: {
        slug: slugify(e.title),
        title: e.title,
        summary: e.summary,
        date: new Date(e.date),
        time: e.time,
        venue: e.venue,
        category: e.category,
        registrationOpen: e.registration,
      },
    });
  }

  /* ---------------- Library, downloads, scholarships ---------------- */
  console.log('Creating library, downloads and scholarships…');
  await db.book.createMany({
    data: bookData.map((b) => ({
      title: b.title, author: b.author, isbn: b.isbn,
      category: b.category, copies: b.copies, available: b.available, shelf: b.shelf,
    })),
  });
  await db.download.createMany({
    data: downloadData.map((d) => ({
      title: d.title, category: d.category, fileType: d.type,
      size: d.size, publishedAt: new Date(d.date),
    })),
  });
  for (const s of scholarshipData) {
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(s.deadline);
    await db.scholarship.create({
      data: {
        name: s.name, provider: s.provider, covers: s.covers, eligibility: s.eligibility,
        deadline: isDate ? new Date(s.deadline) : null,
        deadlineNote: isDate ? null : s.deadline,
      },
    });
  }

  /* ---------------- Site content ---------------- */
  console.log('Creating site content…');
  await db.facility.createMany({
    data: facilityData.map((f, i) => ({ name: f.name, icon: f.icon, detail: f.detail, order: i })),
  });
  await db.galleryItem.createMany({
    data: galleryItems.map((g, i) => ({
      title: g.title,
      category: g.category,
      tone: g.tone,
      order: i,
      imagePath: g.id === 'g01' ? '/images/campus-main-block.jpg' : null,
      alt: g.id === 'g01'
        ? 'The main academic block of Government Degree College Zaim: a two-storey brick building with arched windows and a central tower, fronted by a wide lawn and flowering shrubs.'
        : null,
    })),
  });
  await db.leader.createMany({
    data: leaderData.map((l, i) => ({
      role: l.role,
      name: l.name,
      detail: l.detail,
      icon: l.icon,
      order: i,
    })),
  });
  await db.siteImage.createMany({
    data: siteImageData.map((img) => ({
      slot: img.slot,
      imagePath: img.imagePath,
      alt: img.alt,
    })),
  });
  await db.alumnus.createMany({
    data: alumniData.map((a, i) => ({ name: a.name, batch: a.batch, role: a.role, order: i })),
  });
  await db.careerOpportunity.createMany({
    data: careerData.map((c) => ({
      title: c.title, org: c.org, type: c.type, deadline: new Date(c.deadline),
    })),
  });
  await db.admissionStage.createMany({
    data: admissionSchedule.map((s, i) => ({
      stage: s.stage, dates: s.date, status: s.status, order: i,
    })),
  });

  /* ---------------- A little live workflow data ---------------- */
  await db.serviceRequest.create({
    data: {
      ref: 'SRV-2026-1042', studentName: 'Hamza Saeed', regNo: '2023-GDCZ-CS-045',
      serviceType: 'Bonafide Certificate', purpose: 'Required for a scholarship application',
      contact: '0300-0000000', stage: 'UNDER_REVIEW',
    },
  });
  await db.complaint.create({
    data: {
      ref: 'CMP-2026-0091', category: 'IT & portal',
      details: 'The computer lab printer has been out of service for a week.',
      status: 'UNDER_REVIEW',
    },
  });
  await db.activityLog.create({
    data: {
      userId: admin.id, action: 'SEED', entity: 'System',
      detail: 'Database seeded with college content and demo accounts',
    },
  });

  const counts = {
    users: await db.user.count(),
    departments: await db.department.count(),
    faculty: await db.faculty.count(),
    programmes: await db.programme.count(),
    courses: await db.course.count(),
    students: await db.student.count(),
    enrollments: await db.enrollment.count(),
    attendance: await db.attendanceRecord.count(),
    marks: await db.mark.count(),
    notices: await db.notice.count(),
    events: await db.event.count(),
    books: await db.book.count(),
    leaders: await db.leader.count(),
  };
  console.log('\nSeeded:', counts);
  console.log(`\nDemo accounts (password: ${DEMO_PASSWORD})`);
  console.log('  admin    registrar');
  console.log('  teacher  bilal.ahmad');
  console.log('  student  2023-GDCZ-CS-045');
  console.log('  library  librarian');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
