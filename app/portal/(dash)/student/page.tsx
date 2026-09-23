import Link from 'next/link';
import type { Metadata } from 'next';
import { Role, MarkStatus } from '@prisma/client';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { site } from '@/lib/site';
import { publishedNotices } from '@/lib/queries';
import { ATTENDANCE_THRESHOLD, totalMarks, gradeFor, gpa } from '@/lib/grading';
import { fmtShort, dayOf, monthOf } from '@/lib/format';
import PortalShell, { type PortalLink } from '@/components/PortalShell';

export const metadata: Metadata = { title: 'Student Dashboard' };
export const dynamic = 'force-dynamic';

const LINKS: PortalLink[] = [
  { label: 'Dashboard', href: '/portal/student', icon: 'grid' },
  { label: 'Attendance', href: '/portal/student#attendance', icon: 'check' },
  { label: 'Results & GPA', href: '/portal/student#results', icon: 'chart' },
  { label: 'Notices', href: '/portal/student#notices', icon: 'bell' },
  { label: 'Library', href: '/library', icon: 'book' },
];

export default async function StudentDashboard() {
  const inst = await site();
  const user = await requireRole(Role.STUDENT);

  const student = await db.student.findFirst({
    where: { userId: user.id },
    include: {
      programme: { include: { department: true } },
      enrollments: {
        include: { course: true, mark: true, attendance: true },
        orderBy: { course: { title: 'asc' } },
      },
    },
  });

  if (!student) {
    return (
      <PortalShell user={user} title="Student Portal" subtitle={inst.shortName} links={LINKS} heading="Student Dashboard">
        <section className="panel">
          <h2>No student record linked</h2>
          <p className="mb-0 text-muted">
            This account is not yet linked to a student record. Contact the Registrar&rsquo;s office.
          </p>
        </section>
      </PortalShell>
    );
  }

  /* Everything below is computed from the records, never stored pre-calculated. */
  const courses = student.enrollments.map((e) => {
    const total = e.attendance.length;
    const present = e.attendance.filter((a) => a.status === 'PRESENT').length;
    const percent = total ? Math.round((present / total) * 100) : null;
    const visible = e.mark?.status === MarkStatus.VERIFIED;
    const marks = visible ? totalMarks({ sessional: e.mark?.sessional, midterm: e.mark?.midterm }) : null;
    return {
      id: e.id,
      title: e.course.title,
      code: e.course.code,
      creditHours: e.course.creditHours,
      present,
      totalClasses: total,
      percent,
      sessional: visible ? e.mark?.sessional ?? null : null,
      midterm: visible ? e.mark?.midterm ?? null : null,
      marksVisible: visible,
      // Sessional + mid-term are out of 50 so far; scale to a percentage.
      scaled: marks === null ? null : Math.round((marks / 50) * 100),
    };
  });

  const allRecords = courses.reduce((s, c) => s + c.totalClasses, 0);
  const allPresent = courses.reduce((s, c) => s + c.present, 0);
  const overall = allRecords ? Math.round((allPresent / allRecords) * 100) : null;
  const atRisk = courses.filter((c) => c.percent !== null && c.percent < ATTENDANCE_THRESHOLD);
  const currentGpa = gpa(courses.map((c) => ({ total: c.scaled, creditHours: c.creditHours })));
  const creditsInProgress = courses.reduce((s, c) => s + c.creditHours, 0);

  const notices = await publishedNotices(4, {
    OR: [{ departmentId: null }, { departmentId: student.programme.departmentId }],
  });

  return (
    <PortalShell
      user={user}
      title="Student Portal"
      subtitle={inst.shortName}
      links={LINKS}
      heading={`Assalam-o-Alaikum, ${student.name.split(' ')[0]}`}
    >
      <p className="text-muted" style={{ marginTop: '-1rem', marginBottom: '1.5rem' }}>
        {student.programme.name} · Semester {student.semester} · Reg. {student.regNo}
      </p>

      {atRisk.length > 0 && (
        <div className="callout callout--accent" style={{ marginBottom: '1.5rem' }} role="alert">
          <p className="mb-0">
            <strong>Attendance warning.</strong> Your attendance in{' '}
            {atRisk.map((c, i) => (
              <span key={c.id}>
                <em>{c.title}</em> ({c.percent}%)
                {i < atRisk.length - 2 ? ', ' : i === atRisk.length - 2 ? ' and ' : ''}
              </span>
            ))}{' '}
            {atRisk.length === 1 ? 'is' : 'are'} below the {ATTENDANCE_THRESHOLD}% required to sit the terminal
            examination. Contact the course teacher.
          </p>
        </div>
      )}

      <div className="kpi-grid">
        <div className="kpi">
          <span className="k-label">Current GPA</span>
          <span className="k-value">{currentGpa === null ? '—' : currentGpa.toFixed(2)}</span>
          <span className="k-trend text-muted">From verified sessional &amp; mid-term marks</span>
        </div>
        <div className="kpi">
          <span className="k-label">Overall attendance</span>
          <span className="k-value" style={{ color: overall !== null && overall < ATTENDANCE_THRESHOLD ? 'var(--danger)' : undefined }}>
            {overall === null ? '—' : `${overall}%`}
          </span>
          <span className="k-trend text-muted">
            {allPresent} of {allRecords} classes attended
          </span>
        </div>
        <div className="kpi">
          <span className="k-label">Credit hours in progress</span>
          <span className="k-value">{creditsInProgress}</span>
          <span className="k-trend text-muted">{courses.length} courses this semester</span>
        </div>
        <div className="kpi">
          <span className="k-label">Dues</span>
          <span className="k-value">{student.duesCleared ? 'Cleared' : 'Pending'}</span>
          <span className="k-trend" style={{ color: student.duesCleared ? 'var(--success)' : 'var(--danger)' }}>
            {student.duesCleared ? 'Fee received' : 'Fee outstanding'}
          </span>
        </div>
      </div>

      <div className="panel-grid">
        <section className="panel" id="attendance">
          <h2>Subject-wise attendance</h2>
          <div className="stack">
            {courses.map((c) => (
              <div key={c.id}>
                <div className="split" style={{ marginBottom: '.35rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '.92rem' }}>{c.title}</span>
                  <span
                    style={{ fontSize: '.88rem' }}
                    className={c.percent !== null && c.percent < ATTENDANCE_THRESHOLD ? '' : 'text-muted'}
                  >
                    {c.percent === null ? '—' : `${c.percent}%`}
                  </span>
                </div>
                <div
                  className={`progress ${
                    c.percent === null ? '' : c.percent < ATTENDANCE_THRESHOLD ? 'low' : c.percent < 80 ? 'warn' : ''
                  }`}
                >
                  <span style={{ width: `${c.percent ?? 0}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="form-note" style={{ marginTop: '1rem' }}>
            Recorded by the course teacher after each class, from {allRecords} attendance records.
          </p>
        </section>

        <section className="panel" id="results">
          <h2>Marks — Semester {student.semester}</h2>
          <div className="table-wrap">
            <table className="data" style={{ minWidth: 'auto' }}>
              <caption className="visually-hidden">Current semester marks</caption>
              <thead>
                <tr>
                  <th scope="col">Course</th>
                  <th scope="col">Cr.</th>
                  <th scope="col">Sessional</th>
                  <th scope="col">Mid-term</th>
                  <th scope="col">Standing</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => {
                  const g = c.scaled === null ? null : gradeFor(c.scaled);
                  return (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.title}</strong>
                      </td>
                      <td>{c.creditHours}</td>
                      <td>{c.sessional ?? '—'}</td>
                      <td>{c.midterm ?? '—'}</td>
                      <td>
                        {!c.marksVisible ? (
                          <span className="badge">Awaiting verification</span>
                        ) : g ? (
                          <span className="badge badge-brand">
                            {g.grade} · {g.point.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="form-note" style={{ marginTop: '1rem' }}>
            Final examinations are not yet held. Grades shown are provisional standing from verified sessional
            and mid-term marks.
          </p>
        </section>
      </div>

      <section className="panel" id="notices" style={{ marginTop: '1.5rem' }}>
        <h2>Notices for you</h2>
        <ul className="notice-list">
          {notices.map((n) => (
            <li className="notice-item" key={n.id} style={{ gridTemplateColumns: 'auto 1fr' }}>
              <span className="notice-date">
                <span className="d">{dayOf(n.publishAt)}</span>
                <span className="m">{monthOf(n.publishAt)}</span>
              </span>
              <div className="notice-body">
                <h3>
                  <Link href={`/notices/${n.id}`}>{n.title}</Link>
                </h3>
                <div className="notice-meta">
                  <span className="badge badge-brand">{n.category}</span>
                  <span className="text-muted" style={{ fontSize: '.85rem' }}>
                    {fmtShort(n.publishAt)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </PortalShell>
  );
}
