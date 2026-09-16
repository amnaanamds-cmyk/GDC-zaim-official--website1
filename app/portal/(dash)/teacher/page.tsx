import type { Metadata } from 'next';
import { Role, MarkStatus } from '@prisma/client';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { ATTENDANCE_THRESHOLD, totalMarks, gradeFor } from '@/lib/grading';
import PortalShell, { type PortalLink } from '@/components/PortalShell';
import AttendanceSheet from './AttendanceSheet';
import MarksSheet from './MarksSheet';

export const metadata: Metadata = { title: 'Faculty Dashboard' };
export const dynamic = 'force-dynamic';

const LINKS: PortalLink[] = [
  { label: 'Dashboard', href: '/portal/teacher', icon: 'grid' },
  { label: 'Take attendance', href: '/portal/teacher#attendance', icon: 'check' },
  { label: 'Marks entry', href: '/portal/teacher#marks', icon: 'chart' },
  { label: 'My courses', href: '/portal/teacher#courses', icon: 'book' },
];

export default async function TeacherDashboard({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const user = await requireRole(Role.TEACHER, Role.ADMIN);
  const params = await searchParams;

  const faculty = await db.faculty.findFirst({ where: { userId: user.id } });

  const courses = await db.course.findMany({
    where: faculty ? { teacherId: faculty.id } : {},
    include: {
      department: true,
      enrollments: {
        include: {
          student: true,
          mark: true,
          attendance: true,
        },
        orderBy: { student: { regNo: 'asc' } },
      },
    },
    orderBy: { title: 'asc' },
  });

  const selected = courses.find((c) => c.id === params.course) ?? courses[0];

  // Attendance percentage per student, computed from the records themselves.
  const roster = (selected?.enrollments ?? []).map((e) => {
    const total = e.attendance.length;
    const present = e.attendance.filter((a) => a.status === 'PRESENT').length;
    return {
      enrollmentId: e.id,
      regNo: e.student.regNo,
      name: e.student.name,
      percent: total ? Math.round((present / total) * 100) : null,
      sessional: e.mark?.sessional ?? null,
      midterm: e.mark?.midterm ?? null,
      status: e.mark?.status ?? MarkStatus.DRAFT,
    };
  });

  const totalStudents = courses.reduce((s, c) => s + c.enrollments.length, 0);
  const lowAttendance = courses.reduce((count, c) => {
    for (const e of c.enrollments) {
      const total = e.attendance.length;
      if (!total) continue;
      const present = e.attendance.filter((a) => a.status === 'PRESENT').length;
      if ((present / total) * 100 < ATTENDANCE_THRESHOLD) count++;
    }
    return count;
  }, 0);

  // Grade distribution for the selected course, from verified marks.
  const distribution = new Map<string, number>([['A', 0], ['B', 0], ['C', 0], ['D', 0], ['F', 0]]);
  for (const e of selected?.enrollments ?? []) {
    const total = totalMarks({ sessional: e.mark?.sessional, midterm: e.mark?.midterm });
    if (total === null) continue;
    // Sessional + mid-term are out of 50 at this point in the semester.
    const g = gradeFor(Math.round((total / 50) * 100));
    if (!g) continue;
    const bucket = g.grade.charAt(0);
    distribution.set(bucket, (distribution.get(bucket) ?? 0) + 1);
  }
  const maxBucket = Math.max(1, ...distribution.values());

  return (
    <PortalShell user={user} title="Faculty Portal" subtitle="GDC Zaim" links={LINKS} heading="Faculty Dashboard">
      <div className="kpi-grid">
        <div className="kpi">
          <span className="k-label">Assigned courses</span>
          <span className="k-value">{courses.length}</span>
          <span className="k-trend text-muted">
            {courses.reduce((s, c) => s + c.creditHours, 0)} credit hours
          </span>
        </div>
        <div className="kpi">
          <span className="k-label">Students taught</span>
          <span className="k-value">{totalStudents}</span>
          <span className="k-trend text-muted">Across {courses.length} sections</span>
        </div>
        <div className="kpi">
          <span className="k-label">Below {ATTENDANCE_THRESHOLD}% attendance</span>
          <span className="k-value" style={{ color: lowAttendance ? 'var(--danger)' : undefined }}>
            {lowAttendance}
          </span>
          <span className="k-trend text-muted">Cannot sit the terminal examination</span>
        </div>
        <div className="kpi">
          <span className="k-label">Marks awaiting verification</span>
          <span className="k-value">
            {roster.filter((r) => r.status === MarkStatus.SUBMITTED).length}
          </span>
          <span className="k-trend text-muted">In the selected course</span>
        </div>
      </div>

      {courses.length === 0 ? (
        <section className="panel">
          <h2>No courses assigned</h2>
          <p className="mb-0 text-muted">
            No courses are currently assigned to this account. An administrator assigns teaching duties from
            the admin panel.
          </p>
        </section>
      ) : (
        <>
          <AttendanceSheet
            courses={courses.map((c) => ({ id: c.id, title: c.title, department: c.department.name }))}
            selectedCourseId={selected!.id}
            roster={roster}
          />

          <div className="panel-grid" style={{ marginTop: '1.5rem' }}>
            <MarksSheet courseId={selected!.id} courseTitle={selected!.title} roster={roster} />

            <section className="panel">
              <h2>Grade distribution — {selected!.title}</h2>
              <div className="bar-chart">
                {[...distribution.entries()].map(([grade, n]) => (
                  <div className="bar" key={grade} title={`${grade}: ${n} students`}>
                    <span style={{ fontWeight: 700, color: 'var(--brand)' }}>{n}</span>
                    <i style={{ height: `${Math.round((n / maxBucket) * 100)}%` }} />
                    <span>{grade}</span>
                  </div>
                ))}
              </div>
              <p className="form-note" style={{ marginTop: '1rem' }}>
                Based on sessional and mid-term marks recorded so far. Students in the D and F bands are
                flagged for academic counselling.
              </p>
            </section>
          </div>

          <section className="panel" id="courses" style={{ marginTop: '1.5rem' }}>
            <h2>My courses</h2>
            <div className="table-wrap">
              <table className="data">
                <caption className="visually-hidden">Assigned courses</caption>
                <thead>
                  <tr>
                    <th scope="col">Course</th>
                    <th scope="col">Code</th>
                    <th scope="col">Semester</th>
                    <th scope="col">Students</th>
                    <th scope="col">Average attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => {
                    const records = c.enrollments.flatMap((e) => e.attendance);
                    const present = records.filter((a) => a.status === 'PRESENT').length;
                    const avg = records.length ? Math.round((present / records.length) * 100) : null;
                    return (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.title}</strong>
                        </td>
                        <td>{c.code}</td>
                        <td>{c.semester}</td>
                        <td>{c.enrollments.length}</td>
                        <td>
                          {avg === null ? (
                            <span className="text-muted">—</span>
                          ) : (
                            <span className={`badge ${avg >= 80 ? 'badge-success' : avg >= ATTENDANCE_THRESHOLD ? 'badge-warning' : 'badge-danger'}`}>
                              {avg}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </PortalShell>
  );
}
