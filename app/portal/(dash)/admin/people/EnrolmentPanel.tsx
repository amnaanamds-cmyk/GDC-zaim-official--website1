'use client';

import { useActionState, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { enrolStudent, removeEnrolment, type RecordState } from '@/app/actions/records';

type Student = { id: string; label: string };
type Course = { id: string; label: string; semester: number };
export type EnrolmentRow = {
  id: string;
  student: string;
  regNo: string;
  course: string;
  session: string;
  attendance: number;
  hasMark: boolean;
};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary" type="submit" disabled={pending}>
      {pending ? 'Enrolling…' : 'Enrol on the chosen courses'}
    </button>
  );
}

function Status({ state }: { state: RecordState }) {
  if (!state.error && !state.ok) return null;
  return state.error ? (
    <div className="form-status err" role="alert">{state.error}</div>
  ) : (
    <div className="form-status ok" role="status">{state.ok}</div>
  );
}

/**
 * Putting a student on the courses they take.
 *
 * This is the join that makes the portal work: a teacher's register is the
 * students enrolled on their course, and a student's result is the mark on
 * their enrolment. Until it exists both dashboards are empty.
 */
export default function EnrolmentPanel({
  students,
  courses,
  rows,
  defaultSession,
}: {
  students: Student[];
  courses: Course[];
  rows: EnrolmentRow[];
  defaultSession: string;
}) {
  const [state, action] = useActionState<RecordState, FormData>(enrolStudent, {});
  const [removeState, setRemoveState] = useState<RecordState>({});
  const [pending, start] = useTransition();
  const [filter, setFilter] = useState('');

  const shown = filter
    ? rows.filter((r) =>
        `${r.student} ${r.regNo} ${r.course} ${r.session}`.toLowerCase().includes(filter.toLowerCase()),
      )
    : rows;

  const blocked = students.length === 0 || courses.length === 0;

  return (
    <section className="panel" id="enrolment">
      <h2>Enrolment</h2>
      <p className="text-muted">
        Which students take which courses. A teacher&rsquo;s register is the students enrolled on their
        course, and a student&rsquo;s result is the mark on their enrolment — so until this is done, both
        dashboards are empty.
      </p>

      {blocked ? (
        <div className="callout callout--accent">
          <p className="mb-0">
            {students.length === 0 && 'Add a student before enrolling anyone. '}
            {courses.length === 0 && 'Add a course under Academics first. '}
          </p>
        </div>
      ) : (
        <div className="admin-edit-card" style={{ marginBottom: '1.5rem' }}>
          <form action={action}>
            <div className="form-grid" style={{ gap: '1rem' }}>
              <div className="field">
                <label htmlFor="en-student">Student</label>
                <select id="en-student" name="studentId" required defaultValue="">
                  <option value="">Choose a student…</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="en-session">Session</label>
                <input type="text" id="en-session" name="session" required defaultValue={defaultSession} />
                <span className="hint">However your college names its terms.</span>
              </div>
            </div>

            <fieldset className="field field--full" style={{ border: 0, padding: 0, margin: '1rem 0 0' }}>
              <legend style={{ fontSize: '.82rem', fontWeight: 700, padding: 0 }}>Courses</legend>
              <div className="grid grid-2" style={{ gap: '.4rem', marginTop: '.5rem' }}>
                {courses.map((c) => (
                  <label
                    key={c.id}
                    style={{ display: 'flex', gap: '.5rem', alignItems: 'center', fontSize: '.9rem' }}
                  >
                    <input type="checkbox" name="courseIds" value={c.id} style={{ width: 'auto' }} />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="cluster" style={{ marginTop: '1rem' }}>
              <Submit />
            </div>
            <Status state={state} />
          </form>
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="field" style={{ maxWidth: 320 }}>
            <label htmlFor="en-filter">Find an enrolment</label>
            <input
              type="search"
              id="en-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Student, registration number or course"
            />
          </div>

          <div className="table-wrap">
            <table className="data">
              <caption className="visually-hidden">Enrolments</caption>
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Course</th>
                  <th scope="col">Session</th>
                  <th scope="col">Recorded</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.student}</strong>
                      <br />
                      <span className="text-muted" style={{ fontSize: '.85rem' }}>{r.regNo}</span>
                    </td>
                    <td>{r.course}</td>
                    <td>{r.session}</td>
                    <td>
                      {r.attendance} attendance
                      {r.hasMark && <> · <span className="badge badge-brand">marked</span></>}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={pending}
                        onClick={() => {
                          const warn = r.attendance
                            ? `Remove ${r.student} from ${r.course}? Their ${r.attendance} attendance record(s)${r.hasMark ? ' and marks' : ''} go too.`
                            : `Remove ${r.student} from ${r.course}?`;
                          if (!window.confirm(warn)) return;
                          setRemoveState({});
                          start(async () => setRemoveState(await removeEnrolment(r.id)));
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {shown.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-muted">Nothing matches that.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Status state={removeState} />
        </>
      )}
    </section>
  );
}
