'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { trackService } from '@/app/actions/public';

const STAGES = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'READY', 'DELIVERED'];

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary btn-sm btn-block" type="submit" disabled={pending} style={{ marginTop: '.75rem' }}>
      {pending ? 'Checking…' : 'Check status'}
    </button>
  );
}

export default function TrackRequest() {
  const [state, action] = useActionState(trackService, {} as { ok?: string; error?: string; stage?: string });

  return (
    <form action={action}>
      <div className="field">
        <label htmlFor="track-ref">Reference number</label>
        <input type="text" id="track-ref" name="ref" required placeholder="SRV-2026-0000" />
      </div>
      <Submit />

      {state.error && <div className="form-status err" role="alert">{state.error}</div>}
      {state.ok && (
        <>
          <div className="form-status ok" role="status">{state.ok}</div>
          <ul className="timeline" style={{ marginTop: '1rem' }}>
            {STAGES.map((s) => {
              const current = state.stage === s;
              const done = STAGES.indexOf(state.stage ?? '') > STAGES.indexOf(s);
              return (
                <li key={s} className={current ? 'is-current' : done ? 'is-done' : ''}>
                  <span className="t-stage">{s.replace('_', ' ').toLowerCase()}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </form>
  );
}
