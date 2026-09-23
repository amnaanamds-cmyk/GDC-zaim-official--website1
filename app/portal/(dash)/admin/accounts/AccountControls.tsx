'use client';

import { useActionState, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import {
  createAccount,
  resetPassword,
  unlockAccount,
  setAccountActive,
  type AccountState,
} from '@/app/actions/accounts';
import { MIN_PASSWORD_LENGTH } from '@/lib/password';

type Option = { id: string; label: string };

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary" type="submit" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

function Status({ state }: { state: AccountState }) {
  return (
    <>
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
    </>
  );
}

/**
 * Creating an account. The fields change with the role, because a teacher
 * needs a staff record to teach through and a student needs an enrolment
 * record to have results — an account on its own would have nothing to show.
 */
export function CreateAccountForm({
  departments,
  programmes,
  unlinkedFaculty,
  unlinkedStudents,
}: {
  departments: Option[];
  programmes: Option[];
  unlinkedFaculty: Option[];
  unlinkedStudents: Option[];
}) {
  const [state, action] = useActionState<AccountState, FormData>(createAccount, {});
  const [role, setRole] = useState('TEACHER');
  const [linkId, setLinkId] = useState('');

  const linkable = role === 'TEACHER' ? unlinkedFaculty : role === 'STUDENT' ? unlinkedStudents : [];
  const creatingNew = !linkId;

  return (
    <form action={action}>
      <div className="stack">
        <div className="field">
          <label htmlFor="ac-role">Role</label>
          <select
            id="ac-role"
            name="role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setLinkId('');
            }}
          >
            <option value="TEACHER">Teacher</option>
            <option value="STUDENT">Student</option>
            <option value="LIBRARIAN">Library staff</option>
            <option value="ADMIN">Administrator</option>
          </select>
          <span className="hint">
            {role === 'TEACHER' && 'Marks attendance and submits marks for their courses.'}
            {role === 'STUDENT' && 'Sees their own attendance, marks and results.'}
            {role === 'LIBRARIAN' && 'Library records, on the administration dashboard.'}
            {role === 'ADMIN' && 'Full control, including these accounts. Create a second one for succession.'}
          </span>
        </div>

        {linkable.length > 0 && (
          <div className="field">
            <label htmlFor="ac-link">
              {role === 'TEACHER' ? 'Existing staff record' : 'Existing student record'}
            </label>
            <select id="ac-link" name="linkId" value={linkId} onChange={(e) => setLinkId(e.target.value)}>
              <option value="">Create a new record</option>
              {linkable.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="hint">
              These already exist without a login. Pick one to give it an account instead of creating a
              duplicate.
            </span>
          </div>
        )}

        <div className="field">
          <label htmlFor="ac-name">Full name</label>
          <input type="text" id="ac-name" name="name" required minLength={3} />
        </div>

        <div className="form-grid" style={{ gap: '1rem' }}>
          <div className="field">
            <label htmlFor="ac-username">Username</label>
            <input
              type="text"
              id="ac-username"
              name="username"
              required
              minLength={4}
              pattern="[a-zA-Z0-9._\-]+"
            />
            <span className="hint">What they type to sign in.</span>
          </div>
          <div className="field">
            <label htmlFor="ac-email">Email</label>
            <input type="email" id="ac-email" name="email" required />
          </div>
        </div>

        {role === 'TEACHER' && creatingNew && (
          <div className="form-grid" style={{ gap: '1rem' }}>
            <div className="field">
              <label htmlFor="ac-designation">Designation</label>
              <input type="text" id="ac-designation" name="designation" placeholder="Lecturer" />
            </div>
            <div className="field">
              <label htmlFor="ac-dept">Department</label>
              <select id="ac-dept" name="departmentId" defaultValue="">
                <option value="">Not attached to a department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {role === 'STUDENT' && creatingNew && (
          <div className="form-grid" style={{ gap: '1rem' }}>
            <div className="field">
              <label htmlFor="ac-reg">Registration number</label>
              <input type="text" id="ac-reg" name="regNo" required={role === 'STUDENT'} />
              <span className="hint">They can sign in with this or their username.</span>
            </div>
            <div className="field">
              <label htmlFor="ac-prog">Programme</label>
              <select id="ac-prog" name="programmeId" required={role === 'STUDENT'} defaultValue="">
                <option value="">Choose a programme</option>
                {programmes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              {programmes.length === 0 && (
                <span className="hint">Add a programme under Academics before creating student accounts.</span>
              )}
            </div>
            <div className="field">
              <label htmlFor="ac-sem">Semester</label>
              <input type="number" id="ac-sem" name="semester" min={1} max={12} defaultValue={1} />
            </div>
          </div>
        )}

        <div className="field">
          <label htmlFor="ac-password">Password to give them</label>
          <input
            type="text"
            id="ac-password"
            name="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="off"
          />
          <span className="hint">
            At least {MIN_PASSWORD_LENGTH} characters. Shown in plain text so you can pass it on — the
            portal makes them replace it the first time they sign in.
          </span>
        </div>

        <div className="cluster">
          <Submit label="Create account" pendingLabel="Creating…" />
        </div>
      </div>

      <Status state={state} />
    </form>
  );
}

/** Setting a new password for someone who has lost theirs. */
export function ResetPasswordForm({ userId, name }: { userId: string; name: string }) {
  const [state, action] = useActionState<AccountState, FormData>(resetPassword, {});
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>
        Reset password
      </button>
    );
  }

  return (
    <form action={action} className="stack" style={{ minWidth: 220 }}>
      <input type="hidden" name="userId" value={userId} />
      <div className="field">
        <label htmlFor={`rp-${userId}`}>New password for {name}</label>
        <input
          type="text"
          id={`rp-${userId}`}
          name="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="off"
        />
      </div>
      <div className="cluster">
        <Submit label="Set password" pendingLabel="Setting…" />
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
      <Status state={state} />
    </form>
  );
}

/** Unlock after too many failed attempts, or switch an account off and on. */
export function AccountToggles({
  userId,
  name,
  active,
  locked,
}: {
  userId: string;
  name: string;
  active: boolean;
  locked: boolean;
}) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<AccountState>({});

  return (
    <div className="stack" style={{ gap: '.4rem' }}>
      <div className="cluster" style={{ gap: '.4rem' }}>
        {locked && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={pending}
            onClick={() => start(async () => setState(await unlockAccount(userId)))}
          >
            Unlock
          </button>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={pending}
          onClick={() => {
            if (active && !window.confirm(`Stop ${name} from signing in? Their records are kept.`)) return;
            start(async () => setState(await setAccountActive(userId, !active)));
          }}
        >
          {active ? 'Deactivate' : 'Reactivate'}
        </button>
      </div>
      <Status state={state} />
    </div>
  );
}
