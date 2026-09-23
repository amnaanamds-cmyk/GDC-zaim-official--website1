'use client';

import { useState } from 'react';

export default function ApplicationForm({ programmes }: { programmes: { id: string; name: string }[] }) {
  const [state, setState] = useState<{ ok?: string; error?: string }>({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setState({});
    try {
      const res = await fetch('/api/admissions', { method: 'POST', body: new FormData(form) });
      const json = await res.json();
      if (!res.ok) setState({ error: json.error ?? 'The application could not be submitted.' });
      else {
        setState({
          ok: `Application submitted. Your reference is ${json.ref} — keep it safe, you will need it to track your application. ${json.documents} document${json.documents === 1 ? '' : 's'} received.`,
        });
        form.reset();
      }
    } catch {
      setState({ error: 'The application could not be sent. Check your connection and try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="ap-name">Full name <span className="req">*</span></label>
          <input type="text" id="ap-name" name="name" required minLength={3} autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="ap-father">Parent or guardian&rsquo;s name <span className="req">*</span></label>
          <input type="text" id="ap-father" name="guardianName" required minLength={3} />
        </div>
        <div className="field">
          <label htmlFor="ap-id">Identity document number <span className="req">*</span></label>
          <input type="text" id="ap-id" name="idNumber" required minLength={5} maxLength={40} />
          <span className="hint">
            Your national identity card, birth registration or passport number.
          </span>
        </div>
        <div className="field">
          <label htmlFor="ap-dob">Date of birth <span className="req">*</span></label>
          <input type="date" id="ap-dob" name="dob" required />
        </div>
        <div className="field">
          <label htmlFor="ap-phone">Mobile number <span className="req">*</span></label>
          <input type="tel" id="ap-phone" name="phone" required placeholder="03xx-xxxxxxx" autoComplete="tel" />
        </div>
        <div className="field">
          <label htmlFor="ap-email">Email address</label>
          <input type="email" id="ap-email" name="email" autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="ap-programme">Programme applied for <span className="req">*</span></label>
          <select id="ap-programme" name="programmeId" required defaultValue="">
            <option value="">Select a programme</option>
            {programmes.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="ap-marks">Marks obtained <span className="req">*</span></label>
          <input type="number" id="ap-marks" name="marks" required min={0} step="any" />
          <span className="hint">In your most recent qualifying examination.</span>
        </div>
        <div className="field">
          <label htmlFor="ap-total">Out of <span className="req">*</span></label>
          <input type="number" id="ap-total" name="totalMarks" required min={1} step="any" defaultValue={100} />
          <span className="hint">The total that examination was marked out of.</span>
        </div>
        <div className="field field--full">
          <label htmlFor="ap-address">Postal address <span className="req">*</span></label>
          <textarea id="ap-address" name="address" required minLength={10} style={{ minHeight: 90 }} />
        </div>
        <div className="field field--full">
          <label htmlFor="ap-docs">Upload documents</label>
          <input type="file" id="ap-docs" name="documents" multiple accept=".pdf,.jpg,.jpeg,.png" />
          <span className="hint">
            PDF, JPG or PNG, up to 2 MB each. Attach the marks certificates, your identity document and a
            photograph.
          </span>
        </div>
      </div>

      <div className="cluster" style={{ marginTop: '1.25rem' }}>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Submitting…' : 'Submit application'}
        </button>
        <button className="btn btn-outline" type="reset" disabled={busy}>
          Clear form
        </button>
      </div>

      {state.error && <div className="form-status err" role="alert">{state.error}</div>}
      {state.ok && <div className="form-status ok" role="status">{state.ok}</div>}
    </form>
  );
}
