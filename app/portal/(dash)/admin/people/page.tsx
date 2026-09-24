import Link from 'next/link';
import type { Metadata } from 'next';
import { Role } from '@prisma/client';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { site } from '@/lib/site';
import { adminNav } from '@/lib/admin-nav';
import { RESOURCES } from '@/lib/resources';
import PortalShell from '@/components/PortalShell';
import RecordManager, { type Row } from '@/components/admin/RecordManager';
import EnrolmentPanel, { type EnrolmentRow } from './EnrolmentPanel';

export const metadata: Metadata = { title: 'People & enrolment' };
export const dynamic = 'force-dynamic';

export default async function PeopleAdminPage() {
  const user = await requireRole(Role.ADMIN);
  const inst = await site();

  const [faculty, students, departments, programmes, courses, enrolments] = await Promise.all([
    db.faculty.findMany({ orderBy: { name: 'asc' } }),
    db.student.findMany({ orderBy: { name: 'asc' } }),
    db.department.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true } }),
    db.programme.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    db.course.findMany({
      orderBy: [{ semester: 'asc' }, { title: 'asc' }],
      select: { id: true, title: true, code: true, semester: true },
    }),
    db.enrollment.findMany({
      orderBy: { id: 'desc' },
      include: {
        student: { select: { name: true, regNo: true } },
        course: { select: { title: true } },
        _count: { select: { attendance: true } },
        mark: { select: { id: true } },
      },
    }),
  ]);

  const refs = {
    department: departments.map((d) => ({ id: d.id, label: d.name })),
    programme: programmes.map((p) => ({ id: p.id, label: p.name })),
  };

  const rows: EnrolmentRow[] = enrolments.map((e) => ({
    id: e.id,
    student: e.student.name,
    regNo: e.student.regNo,
    course: e.course.title,
    session: e.session,
    attendance: e._count.attendance,
    hasMark: Boolean(e.mark),
  }));

  // Whatever session the college is already using, so the field is usually right.
  const defaultSession = enrolments[0]?.session ?? `Session ${new Date().getFullYear()}`;

  return (
    <PortalShell
      user={user}
      title="Admin Panel"
      subtitle={inst.shortName}
      links={adminNav('/portal/admin/people')}
      heading="People & enrolment"
    >
      <p className="lead" style={{ marginTop: 0 }}>
        The staff and students of {inst.shortName}, and which courses each student takes. A record here
        is the person; a login is separate, and is given from{' '}
        <Link href="/portal/admin/accounts">Accounts</Link> when they need the portal.
      </p>

      <RecordManager spec={RESOURCES.faculty} rows={faculty as unknown as Row[]} refs={refs} />
      <RecordManager spec={RESOURCES.student} rows={students as unknown as Row[]} refs={refs} />

      <EnrolmentPanel
        students={students.map((s) => ({ id: s.id, label: `${s.name} — ${s.regNo}` }))}
        courses={courses.map((c) => ({
          id: c.id,
          label: `${c.title} (${c.code}) · semester ${c.semester}`,
          semester: c.semester,
        }))}
        rows={rows}
        defaultSession={defaultSession}
      />
    </PortalShell>
  );
}
