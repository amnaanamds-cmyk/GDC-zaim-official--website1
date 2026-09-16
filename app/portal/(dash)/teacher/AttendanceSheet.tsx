'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { saveAttendance, type ActionState } from '@/app/actions/teaching';
import { ATTENDANCE_THRESHOLD } from '@/lib/grading';

type Row = { enrollmentId: string; regNo: string; name: string; percent: number | null };

function Save() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary" type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save attendance'}
    </button>
  );
}

export default function AttendanceSheet({
  courses,
  selectedCourseId,
  roster,
}: {
  courses: { id: string; title: string; department: string }[];
  selectedCourseId: string;
  roster: Row[];
}) {
  const [state, action] = useActionState<ActionState, FormData>(saveAttendance, {});
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="panel" id="attendance">
      <div className="split" style={{ marginBottom: '1.25rem' }}>
        <h2 className="mb-0">Take attendance</h2>
        <div className="cluster">
          <label className="visually-hidden" htmlFor="course-select">
            Course
          </label>
          <select
            id="course-select"
            defaultValue={selectedCourseId}
            style={{ maxWidth: 280 }}
            onChange={(e) => router.push(`/portal/teacher?course=${e.target.value}#attendance`)}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <form action={action}>
        <input type="hidden" name="courseId" value={selectedCourseId} />
        <div className="cluster" style={{ marginBottom: '1rem' }}>
          <label htmlFor="att-date" style={{ fontWeight: 650, fontSize: '.9rem' }}>
            Date
          </label>
          <input type="date" id="att-date" name="date" defaultValue={today} max={today} style={{ maxWidth: 190 }} required />
        </div>

        <div className="table-wrap">
          <table className="data">
            <caption className="visually-hidden">Class attendance sheet</caption>
            <thead>
              <tr>
                <th scope="col">Roll no.</th>
                <th scope="col">Student</th>
                <th scope="col">Attendance to date</th>
                <th scope="col">Mark</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((r) => (
                <tr key={r.enrollmentId}>
                  <td>{r.regNo}</td>
                  <td>
                    <strong>{r.name}</strong>
                  </td>
                  <td>
                    {r.percent === null ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <span
                        className={`badge ${
                          r.percent >= 80 ? 'badge-success' : r.percent >= ATTENDANCE_THRESHOLD ? 'badge-warning' : 'badge-danger'
                        }`}
                      >
                        {r.percent}%
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="cluster" style={{ gap: '1rem' }}>
                      {(['PRESENT', 'ABSENT', 'LEAVE'] as const).map((value) => (
                        <label
                          key={value}
                          style={{ display: 'flex', gap: '.35rem', alignItems: 'center', fontSize: '.88rem', fontWeight: 600 }}
                        >
                          <input
                            type="radio"
                            name={`status-${r.enrollmentId}`}
                            value={value}
                            defaultChecked={value === 'PRESENT'}
                            style={{ width: 'auto' }}
                          />
                          {value.charAt(0) + value.slice(1).toLowerCase()}
                        </label>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cluster" style={{ marginTop: '1.25rem' }}>
          <Save />
          <span className="text-muted" style={{ fontSize: '.9rem' }}>
            Saving again for the same date updates that day&rsquo;s record.
          </span>
        </div>

        {state.error && (
          <div className="form-status err" role="alert">
            {state.error}
          </div>
        )}
        {state.ok && (
          <div className="form-status ok" role="status">
            {state.ok}
          </div>
        )}
      </form>
    </section>
  );
}
