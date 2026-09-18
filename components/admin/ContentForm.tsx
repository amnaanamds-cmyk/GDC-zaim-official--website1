'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { ContentState } from '@/app/actions/content';

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary" type="submit" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

/**
 * A form bound to one of the website-content actions, reporting the outcome
 * inline. It deliberately does not clear itself: after changing a
 * photograph the administrator should still see the details they just saved.
 */
export default function ContentForm({
  action,
  children,
  submitLabel = 'Save',
  pendingLabel = 'Saving…',
  footer,
}: {
  action: (prev: ContentState, formData: FormData) => Promise<ContentState>;
  children: React.ReactNode;
  submitLabel?: string;
  pendingLabel?: string;
  footer?: React.ReactNode;
}) {
  const [state, formAction] = useActionState<ContentState, FormData>(action, {});

  return (
    <form action={formAction}>
      {children}
      <div className="cluster" style={{ marginTop: '1rem' }}>
        <Submit label={submitLabel} pendingLabel={pendingLabel} />
        {footer}
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
