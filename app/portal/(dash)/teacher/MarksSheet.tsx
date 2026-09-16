'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitMarks, type ActionState } from '@/app/actions/teaching';

type Row = {
  enrollmentId: string;
  regNo: string;
  name: string;
  sessional: number | null;
  midterm: number | null;
  status: string;
};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary" type="submit" disabled={pending}>
      {pending ? 'Submitting…' : 'Submit for verification'}
    </button>
  );
}

export default function MarksSheet({
  courseId,
  courseTitle,
  roster,
}: {
  courseId: string;
  courseTitle: string;
  roster: Row[];
}) {
  const [state, action] = useActionState<ActionState, FormData>(submitMarks, {});

  return (
    <section className="panel" id="marks">
      <div className="split" style={{ marginBottom: '1.25rem' }}>
        <h2 className="mb-0">Marks entry — {courseTitle}</h2>
      </div>

      <form action={action}>
        <input type="hidden" name="courseId" value={courseId} />
        <div className="table-wrap">
          <table className="data">
            <caption className="visually-hidden">Marks entry</caption>
            <thead>
              <tr>
                <th scope="col">Student</th>
                <th scope="col">Sessional (25)</th>
                <th scope="col">Mid-term (25)</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((r) => (
                <tr key={r.enrollmentId}>
                  <td>
                    <strong>{r.name}</strong>
                    <br />
                    <span className="text-muted" style={{ fontSize: '.82rem' }}>
                      {r.regNo}
                    </span>
                  </td>
                  <td>
                    <label className="visually-hidden" htmlFor={`s-${r.enrollmentId}`}>
                      Sessional marks for {r.name}
                    </label>
                    <input
                      type="number"
                      id={`s-${r.enrollmentId}`}
                      name={`sessional-${r.enrollmentId}`}
                      min={0}
                      max={25}
                      step={0.5}
                      defaultValue={r.sessional ?? ''}
                      style={{ maxWidth: 90 }}
                    />
                  </td>
                  <td>
                    <label className="visually-hidden" htmlFor={`m-${r.enrollmentId}`}>
                      Mid-term marks for {r.name}
                    </label>
                    <input
                      type="number"
                      id={`m-${r.enrollmentId}`}
                      name={`midterm-${r.enrollmentId}`}
                      min={0}
                      max={25}
                      step={0.5}
                      defaultValue={r.midterm ?? ''}
                      style={{ maxWidth: 90 }}
                    />
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        r.status === 'VERIFIED' ? 'badge-success' : r.status === 'SUBMITTED' ? 'badge-warning' : ''
                      }`}
                    >
                      {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cluster" style={{ marginTop: '1.25rem' }}>
          <Submit />
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
