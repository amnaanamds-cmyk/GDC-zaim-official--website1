'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction, type LoginState } from '@/app/actions/auth';

const ROLES = [
  { key: 'student', label: 'Student', hint: 'Registration number', example: '2023-GDCZ-CS-045' },
  { key: 'teacher', label: 'Teacher', hint: 'Faculty username or email', example: 'bilal.ahmad' },
  { key: 'admin', label: 'Admin', hint: 'Administrator username', example: 'registrar' },
  { key: 'library', label: 'Library', hint: 'Library staff username', example: 'librarian' },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={formAction}>
      <div className="stack">
        <div className="field">
          <label htmlFor="identifier">Username, email or registration number</label>
          <input
            type="text"
            id="identifier"
            name="identifier"
            required
            autoComplete="username"
            placeholder="registrar"
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required autoComplete="current-password" />
        </div>
        <SubmitButton />
      </div>

      {state.error && (
        <div className="form-status err" role="alert" style={{ marginTop: '1rem' }}>
          {state.error}
        </div>
      )}

      <div className="callout" style={{ marginTop: '1.5rem', fontSize: '.86rem' }}>
        <p style={{ marginBottom: '.5rem' }}>
          <strong>Demo accounts</strong> — password <code>gdc12345</code> for all four:
        </p>
        <ul style={{ margin: 0, paddingInlineStart: '1.1rem' }}>
          {ROLES.map((r) => (
            <li key={r.key}>
              {r.label}: <code>{r.example}</code>
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}
