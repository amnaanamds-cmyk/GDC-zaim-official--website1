'use client';

import { useActionState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { publishNotice, type ActionState } from '@/app/actions/admin';

const CATEGORIES = ['Admission', 'Examination', 'Academic', 'Scholarship', 'Holiday', 'Emergency', 'General'];

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary" type="submit" disabled={pending}>
      {pending ? 'Publishing…' : 'Publish notice'}
    </button>
  );
}

export default function NoticeComposer({ departments }: { departments: { id: string; name: string }[] }) {
  const [state, action] = useActionState<ActionState, FormData>(publishNotice, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form action={action} ref={formRef}>
      <div className="stack">
        <div className="field">
          <label htmlFor="nt-title">Title</label>
          <input type="text" id="nt-title" name="title" required minLength={6} />
        </div>

        <div className="form-grid" style={{ gap: '1rem' }}>
          <div className="field">
            <label htmlFor="nt-cat">Category</label>
            <select id="nt-cat" name="category" required defaultValue="General">
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="nt-dept">Department</label>
            <select id="nt-dept" name="departmentId" defaultValue="">
              <option value="">Everyone</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="nt-publish">Publish on</label>
            <input type="date" id="nt-publish" name="publishAt" />
            <span className="hint">Leave blank to publish immediately.</span>
          </div>
          <div className="field">
            <label htmlFor="nt-expiry">Expires on</label>
            <input type="date" id="nt-expiry" name="expiresAt" />
            <span className="hint">After this date it leaves the notice board.</span>
          </div>
        </div>

        <div className="field">
          <label htmlFor="nt-body">Notice text</label>
          <textarea id="nt-body" name="body" required minLength={20} />
        </div>

        <label style={{ display: 'flex', gap: '.5rem', alignItems: 'center', fontSize: '.9rem', fontWeight: 600 }}>
          <input type="checkbox" name="pinned" style={{ width: 'auto' }} /> Pin to the top of the site
        </label>

        <div className="cluster">
          <Submit />
        </div>
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
  );
}
