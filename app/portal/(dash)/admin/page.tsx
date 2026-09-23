import Link from 'next/link';
import type { Metadata } from 'next';
import { Role, MarkStatus } from '@prisma/client';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { site } from '@/lib/site';
import { ATTENDANCE_THRESHOLD } from '@/lib/grading';
import { fmtShort } from '@/lib/format';
import PortalShell, { type PortalLink } from '@/components/PortalShell';
import NoticeComposer from './NoticeComposer';
import VerifyMarks from './VerifyMarks';

export const metadata: Metadata = { title: 'Administration Dashboard' };
export const dynamic = 'force-dynamic';

const LINKS: PortalLink[] = [
  { label: 'Dashboard', href: '/portal/admin', icon: 'grid' },
  { label: 'Website content', href: '/portal/admin/website', icon: 'image' },
  { label: 'Event media', href: '/portal/admin/media', icon: 'mic' },
  { label: 'Notices', href: '/portal/admin#notices', icon: 'bell' },
  { label: 'Results verification', href: '/portal/admin#results', icon: 'chart' },
  { label: 'Students', href: '/portal/admin#students', icon: 'users' },
  { label: 'Complaints', href: '/portal/admin#complaints', icon: 'shield' },
  { label: 'Activity log', href: '/portal/admin#activity', icon: 'file' },
];

export default async function AdminDashboard() {
  const inst = await site();
  const user = await requireRole(Role.ADMIN, Role.LIBRARIAN);

  const [students, departments, complaints, pendingMarks, notices, activity, attendance, mediaCount] =
    await Promise.all([
      db.student.count(),
      db.department.findMany({
        orderBy: { order: 'asc' },
        include: { programmes: { include: { _count: { select: { students: true } } } } },
      }),
      db.complaint.findMany({ where: { status: { not: 'RESOLVED' } }, orderBy: { createdAt: 'desc' }, take: 6 }),
      db.mark.findMany({
        where: { status: MarkStatus.SUBMITTED },
        include: {
          enrollment: { include: { course: true, student: true } },
          submittedBy: true,
        },
      }),
      db.notice.findMany({ orderBy: { publishAt: 'desc' }, take: 6, include: { author: true } }),
      db.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { user: true } }),
      db.attendanceRecord.groupBy({ by: ['status'], _count: true }),
      db.eventMedia.count(),
    ]);

  const totalAttendance = attendance.reduce((s, a) => s + a._count, 0);
  const present = attendance.find((a) => a.status === 'PRESENT')?._count ?? 0;
  const averageAttendance = totalAttendance ? Math.round((present / totalAttendance) * 100) : 0;

  const enrolment = departments
    .map((d) => ({
      name: d.name,
      count: d.programmes.reduce((s, p) => s + p._count.students, 0),
    }))
    .sort((a, b) => b.count - a.count);
  const maxEnrolment = Math.max(1, ...enrolment.map((e) => e.count));

  // Group submitted marks by course so the verifier sees one row per course.
  const byCourse = new Map<string, { course: string; teacher: string; ids: string[] }>();
  for (const m of pendingMarks) {
    const key = m.enrollment.course.id;
    const row = byCourse.get(key) ?? {
      course: m.enrollment.course.title,
      teacher: m.submittedBy?.name ?? 'Unknown',
      ids: [],
    };
    row.ids.push(m.id);
    byCourse.set(key, row);
  }
  const verificationQueue = [...byCourse.values()];

  return (
    <PortalShell
      user={user}
      title="Admin Panel"
      subtitle={inst.shortName}
      links={LINKS}
      heading="Administration Dashboard"
    >
      <div className="kpi-grid">
        <div className="kpi">
          <span className="k-label">Enrolled students</span>
          <span className="k-value">{students.toLocaleString('en-US')}</span>
          <span className="k-trend text-muted">Across {departments.length} departments</span>
        </div>
        <div className="kpi">
          <span className="k-label">Average attendance</span>
          <span className="k-value">{averageAttendance}%</span>
          <span className="k-trend text-muted">
            Threshold {ATTENDANCE_THRESHOLD}% · {totalAttendance.toLocaleString('en-US')} records
          </span>
        </div>
        <div className="kpi">
          <span className="k-label">Results awaiting verification</span>
          <span className="k-value" style={{ color: verificationQueue.length ? 'var(--warning)' : undefined }}>
            {verificationQueue.length}
          </span>
          <span className="k-trend text-muted">{pendingMarks.length} student records</span>
        </div>
        <div className="kpi">
          <span className="k-label">Event media</span>
          <span className="k-value">{mediaCount}</span>
          <span className="k-trend">
            <Link href="/portal/admin/media">Upload photos &amp; videos →</Link>
          </span>
        </div>
      </div>

      <div className="panel-grid">
        <section className="panel" id="notices">
          <h2>Publish a notice</h2>
          <NoticeComposer
            departments={departments.map((d) => ({ id: d.id, name: d.name }))}
          />
        </section>

        <section className="panel">
          <h2>Enrolment by department</h2>
          <div className="stack">
            {enrolment.map((e) => (
              <div key={e.name}>
                <div className="split" style={{ marginBottom: '.3rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '.9rem' }}>{e.name}</span>
                  <span className="text-muted" style={{ fontSize: '.86rem' }}>
                    {e.count}
                  </span>
                </div>
                <div className="progress">
                  <span style={{ width: `${Math.round((e.count / maxEnrolment) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="form-note" style={{ marginTop: '1rem' }}>
            Counted live from student enrolment records.
          </p>
        </section>
      </div>

      <section className="panel" id="results" style={{ marginTop: '1.5rem' }}>
        <div className="split" style={{ marginBottom: '1.25rem' }}>
          <h2 className="mb-0">Results awaiting verification</h2>
          <span className="badge badge-warning">Students see marks only after verification</span>
        </div>
        {verificationQueue.length === 0 ? (
          <p className="text-muted mb-0">
            Nothing waiting. Marks submitted by teachers appear here for checking before publication.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <caption className="visually-hidden">Marks submitted by teachers</caption>
              <thead>
                <tr>
                  <th scope="col">Course</th>
                  <th scope="col">Submitted by</th>
                  <th scope="col">Students</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {verificationQueue.map((row) => (
                  <tr key={row.course}>
                    <td>
                      <strong>{row.course}</strong>
                    </td>
                    <td>{row.teacher}</td>
                    <td>{row.ids.length}</td>
                    <td>
                      <VerifyMarks markIds={row.ids} course={row.course} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="panel-grid" style={{ marginTop: '1.5rem' }}>
        <section className="panel">
          <h2>Recent notices</h2>
          <ul className="notice-list">
            {notices.map((n) => (
              <li className="notice-item" key={n.id} style={{ gridTemplateColumns: 'auto 1fr' }}>
                <span className="notice-date">
                  <span className="d">{String(n.publishAt.getUTCDate()).padStart(2, '0')}</span>
                  <span className="m">{fmtShort(n.publishAt).split(' ')[1].toUpperCase()}</span>
                </span>
                <div className="notice-body">
                  <h3>
                    <Link href={`/notices/${n.id}`}>{n.title}</Link>
                  </h3>
                  <div className="notice-meta">
                    <span className="badge badge-brand">{n.category}</span>
                    {n.author && <span className="text-muted" style={{ fontSize: '.85rem' }}>by {n.author.name}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel" id="complaints">
          <h2>Open complaints</h2>
          {complaints.length === 0 ? (
            <p className="text-muted mb-0">No open complaints.</p>
          ) : (
            <div className="table-wrap">
              <table className="data" style={{ minWidth: 'auto' }}>
                <caption className="visually-hidden">Open complaints</caption>
                <thead>
                  <tr>
                    <th scope="col">Ref</th>
                    <th scope="col">Category</th>
                    <th scope="col">Received</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c.id}>
                      <td>{c.ref}</td>
                      <td>{c.category}</td>
                      <td>{fmtShort(c.createdAt)}</td>
                      <td>
                        <span className="badge badge-warning">{c.status.replace('_', ' ').toLowerCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="panel" id="activity" style={{ marginTop: '1.5rem' }}>
        <h2>Activity log</h2>
        <ul className="timeline">
          {activity.map((a) => (
            <li className="is-done" key={a.id}>
              <span className="t-stage">
                {a.action} — {a.entity}
                {a.detail ? `: ${a.detail}` : ''}
              </span>
              <span className="t-date">
                {fmtShort(a.createdAt)}, {a.createdAt.toISOString().slice(11, 16)} · {a.user?.username ?? 'system'}
              </span>
            </li>
          ))}
        </ul>
        <p className="form-note" style={{ marginTop: '1rem' }}>
          Every administrative action is recorded with the responsible account.
        </p>
      </section>
    </PortalShell>
  );
}
