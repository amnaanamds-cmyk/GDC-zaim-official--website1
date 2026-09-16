'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import type { FormState } from '@/app/actions/public';

function Submit({ label, pendingLabel, block }: { label: string; pendingLabel: string; block?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className={`btn btn-primary${block ? ' btn-block' : ''}`} type="submit" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

/**
 * Wraps a server action in a form that reports success or failure inline and
 * clears itself after a successful submission. Works without JavaScript too:
 * the form posts and the page re-renders with the result.
 */
export default function ActionForm({
  action,
  children,
  submitLabel = 'Submit',
  pendingLabel = 'Submitting…',
  block,
  resetOnSuccess = true,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submitLabel?: string;
  pendingLabel?: string;
  block?: boolean;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && resetOnSuccess) ref.current?.reset();
  }, [state.ok, resetOnSuccess]);

  return (
    <form action={formAction} ref={ref}>
      {children}
      <div className="cluster" style={{ marginTop: '1.25rem' }}>
        <Submit label={submitLabel} pendingLabel={pendingLabel} block={block} />
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
