'use client';

import { useState, useTransition } from 'react';
import { verifyMarks } from '@/app/actions/admin';

export default function VerifyMarks({ markIds, course }: { markIds: string[]; course: string }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState<string | null>(null);

  if (done) return <span className="badge badge-success">{done}</span>;

  return (
    <button
      className="btn btn-primary btn-sm"
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await verifyMarks(markIds, course);
          setDone(res.ok ? 'Verified' : (res.error ?? 'Failed'));
        })
      }
    >
      {pending ? 'Verifying…' : 'Verify & publish'}
    </button>
  );
}
