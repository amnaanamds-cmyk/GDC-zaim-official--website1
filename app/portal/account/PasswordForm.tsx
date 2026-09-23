'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { changeOwnPassword, type AccountState } from '@/app/actions/accounts';
import { MIN_PASSWORD_LENGTH } from '@/lib/password';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Change password'}
    </button>
  );
}

export default function PasswordForm({ forced, home }: { forced: boolean; home: string }) {
  const [state, action] = useActionState<AccountState, FormData>(changeOwnPassword, {});
  const router = useRouter();

  // Captured once, on purpose. Saving the password revalidates this route, so
  // the server re-renders with mustChangePassword already cleared and `forced`
  // arrives false — reading it in the effect would mean the redirect never
  // fired for the very people it exists for.
  const [wasForced] = useState(forced);

  // Someone sent here because an administrator set their password is stuck on
  // this page until it changes; once it has, take them on to their dashboard.
  useEffect(() => {
    if (state.ok && wasForced) router.replace(home);
  }, [state.ok, wasForced, home, router]);

  return (
    <form action={action}>
      <div className="stack">
        <div className="field">
          <label htmlFor="pw-current">Current password</label>
          <input
            type="password"
            id="pw-current"
            name="currentPassword"
            required
            autoComplete="current-password"
          />
          {forced && <span className="hint">The one you were given.</span>}
        </div>

        <div className="field">
          <label htmlFor="pw-new">New password</label>
          <input
            type="password"
            id="pw-new"
            name="newPassword"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
          />
          <span className="hint">At least {MIN_PASSWORD_LENGTH} characters, and not your current one.</span>
        </div>

        <div className="field">
          <label htmlFor="pw-confirm">Repeat new password</label>
          <input
            type="password"
            id="pw-confirm"
            name="confirmPassword"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
          />
        </div>

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
  );
}
