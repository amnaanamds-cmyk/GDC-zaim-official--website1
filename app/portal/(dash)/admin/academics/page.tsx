import type { Metadata } from 'next';
import { Role } from '@prisma/client';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { site } from '@/lib/site';
import { adminNav } from '@/lib/admin-nav';
import { RESOURCES } from '@/lib/resources';
import PortalShell from '@/components/PortalShell';
import RecordManager, { type Row } from '@/components/admin/RecordManager';

export const metadata: Metadata = { title: 'Academics' };
export const dynamic = 'force-dynamic';

/**
 * The academic structure of the college: departments, then the programmes
 * students enrol on, then the courses teachers actually teach.
 *
 * In that order deliberately — a programme needs a department and a course
 * needs both, so the page reads top to bottom as the job is done.
 */
export default async function AcademicsAdminPage() {
  const user = await requireRole(Role.ADMIN);
  const inst = await site();

  const [departments, programmes, courses, faculty] = await Promise.all([
    db.department.findMany({ orderBy: { order: 'asc' } }),
    db.programme.findMany({ orderBy: { name: 'asc' } }),
    db.course.findMany({ orderBy: [{ semester: 'asc' }, { title: 'asc' }] }),
    db.faculty.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, designation: true } }),
  ]);

  const refs = {
    department: departments.map((d) => ({ id: d.id, label: d.name })),
    faculty: faculty.map((f) => ({ id: f.id, label: `${f.name} — ${f.designation}` })),
  };

  return (
    <PortalShell
      user={user}
      title="Admin Panel"
      subtitle={inst.shortName}
      links={adminNav('/portal/admin/academics')}
      heading="Academics"
    >
      <p className="lead" style={{ marginTop: 0 }}>
        What {inst.shortName} teaches. Departments come first, then the programmes students enrol on,
        then the courses. A teacher can only mark attendance and enter marks for a course assigned to
        them, so nothing in the portal works until these exist.
      </p>

      {departments.length === 0 && (
        <div className="callout callout--accent">
          <p className="mb-0">
            <strong>Start here.</strong> Add your first department below. Programmes, courses, faculty
            and students all belong to one.
          </p>
        </div>
      )}

      <RecordManager spec={RESOURCES.department} rows={departments as unknown as Row[]} refs={refs} />
      <RecordManager spec={RESOURCES.programme} rows={programmes as unknown as Row[]} refs={refs} />
      <RecordManager spec={RESOURCES.course} rows={courses as unknown as Row[]} refs={refs} />
    </PortalShell>
  );
}
