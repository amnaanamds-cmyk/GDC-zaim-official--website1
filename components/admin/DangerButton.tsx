'use client';

import { useState, useTransition } from 'react';
import type { ContentState } from '@/app/actions/content';

/**
 * A destructive action — removing a portrait, a gallery tile, a document.
 * It asks once before running, because every one of these deletes a file
 * that cannot be recovered from the admin panel.
 */
export default function DangerButton({
  action,
  id,
  label,
  confirm,
  pendingLabel = 'Removing…',
}: {
  action: (id: string) => Promise<ContentState>;
  id: string;
  label: string;
  confirm: string;
  pendingLabel?: string;
}) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<ContentState>({});

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(confirm)) return;
          setState({});
          start(async () => setState(await action(id)));
        }}
      >
        {pending ? pendingLabel : label}
      </button>
      {state.error && (
        <span className="form-status err" role="alert">
          {state.error}
        </span>
      )}
      {state.ok && (
        <span className="form-status ok" role="status">
          {state.ok}
        </span>
      )}
    </>
  );
}
