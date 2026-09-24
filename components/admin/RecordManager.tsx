'use client';

import { useActionState, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { saveRecord, deleteRecord, type RecordState } from '@/app/actions/records';
import type { Field, Resource } from '@/lib/resources';

export type Row = Record<string, unknown> & { id: string };
export type RefOptions = Record<string, { id: string; label: string }[]>;

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary btn-sm" type="submit" disabled={pending}>
      {pending ? 'Saving…' : label}
    </button>
  );
}

function Status({ state }: { state: RecordState }) {
  if (!state.error && !state.ok) return null;
  return state.error ? (
    <div className="form-status err" role="alert">{state.error}</div>
  ) : (
    <div className="form-status ok" role="status">{state.ok}</div>
  );
}

/** Formats a stored value for the table. */
function display(value: unknown): string {
  if (value == null || value === '') return '—';
  if (value instanceof Date) return value.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length ? `${value.length}` : '—';
  const text = String(value);
  // Dates arrive from the server as ISO strings.
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
    return new Date(text).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return text.length > 70 ? `${text.slice(0, 70)}…` : text;
}

/** Turns a stored value into what the form control expects. */
function toInput(field: Field, value: unknown): string {
  if (value == null) return '';
  if (field.type === 'list') return Array.isArray(value) ? value.join('\n') : '';
  if (field.type === 'date') {
    const d = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  }
  return String(value);
}

function Control({ field, row, refs }: { field: Field; row?: Row; refs: RefOptions }) {
  const id = `f-${field.name}-${row?.id ?? 'new'}`;
  const value = row ? row[field.name] : undefined;
  const common = { id, name: field.name, required: 'required' in field ? field.required : undefined };

  return (
    <div className="field">
      <label htmlFor={id}>
        {field.label}
        {'required' in field && field.required ? ' *' : ''}
      </label>

      {field.type === 'textarea' && (
        <textarea {...common} rows={3} defaultValue={toInput(field, value)} />
      )}

      {field.type === 'list' && (
        <textarea {...common} rows={3} defaultValue={toInput(field, value)} placeholder={field.placeholder} />
      )}

      {field.type === 'checkbox' && (
        <input type="checkbox" {...common} defaultChecked={Boolean(value)} style={{ width: 'auto' }} />
      )}

      {field.type === 'number' && (
        <input type="number" {...common} min={field.min} max={field.max} defaultValue={toInput(field, value)} />
      )}

      {field.type === 'date' && <input type="date" {...common} defaultValue={toInput(field, value)} />}

      {field.type === 'select' && (
        <select {...common} defaultValue={toInput(field, value)}>
          <option value="">Choose…</option>
          {field.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      )}

      {field.type === 'ref' && (
        <select {...common} defaultValue={toInput(field, value)}>
          <option value="">{field.required ? 'Choose…' : 'None'}</option>
          {(refs[field.ref] ?? []).map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      )}

      {(field.type === 'text' || field.type === 'email') && (
        <input
          type={field.type === 'email' ? 'email' : 'text'}
          {...common}
          maxLength={field.max}
          placeholder={field.placeholder}
          defaultValue={toInput(field, value)}
        />
      )}

      {'hint' in field && field.hint && <span className="hint">{field.hint}</span>}
      {field.type === 'ref' && (refs[field.ref] ?? []).length === 0 && (
        <span className="hint">Nothing to choose from yet — add one first.</span>
      )}
    </div>
  );
}

function RecordForm({
  spec,
  refs,
  row,
  onDone,
}: {
  spec: Resource;
  refs: RefOptions;
  row?: Row;
  onDone?: () => void;
}) {
  const [state, action] = useActionState<RecordState, FormData>(saveRecord, {});

  return (
    <form action={action}>
      <input type="hidden" name="__resource" value={spec.key} />
      {row && <input type="hidden" name="__id" value={row.id} />}

      <div className="form-grid" style={{ gap: '1rem' }}>
        {spec.fields.map((f) => (
          <div
            key={f.name}
            className={f.type === 'textarea' || f.type === 'list' ? 'field--full' : undefined}
          >
            <Control field={f} row={row} refs={refs} />
          </div>
        ))}
      </div>

      <div className="cluster" style={{ marginTop: '1rem' }}>
        <Submit label={row ? 'Save changes' : `Add ${spec.singular.toLowerCase()}`} />
        {onDone && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onDone}>
            Cancel
          </button>
        )}
      </div>

      <Status state={state} />
    </form>
  );
}

/**
 * One kind of record: what exists now, a form to add another, and per-row
 * editing and removal. Every screen that lets a college enter its own data
 * uses this, so they all behave the same way.
 */
export default function RecordManager({
  spec,
  rows,
  refs = {},
}: {
  spec: Resource;
  rows: Row[];
  refs?: RefOptions;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [pending, start] = useTransition();
  const [state, setState] = useState<RecordState>({});

  return (
    <section className="panel" id={spec.key}>
      <div className="split" style={{ marginBottom: '.5rem' }}>
        <h2 className="mb-0">{spec.plural}</h2>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => { setAdding((v) => !v); setEditing(null); }}
        >
          {adding ? 'Close' : `Add ${spec.singular.toLowerCase()}`}
        </button>
      </div>
      <p className="text-muted">{spec.blurb}</p>

      {adding && (
        <div className="admin-edit-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>New {spec.singular.toLowerCase()}</h3>
          <RecordForm spec={spec} refs={refs} onDone={() => setAdding(false)} />
        </div>
      )}

      {rows.length === 0 ? (
        <p className="form-note">
          Nothing here yet. Use <strong>Add {spec.singular.toLowerCase()}</strong> above.
        </p>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <caption className="visually-hidden">{spec.plural}</caption>
            <thead>
              <tr>
                {spec.columns.map((c) => {
                  const f = spec.fields.find((x) => x.name === c);
                  return <th scope="col" key={c}>{f?.label ?? c}</th>;
                })}
                <th scope="col"><span className="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {spec.columns.map((c, i) => (
                    <td key={c}>{i === 0 ? <strong>{display(row[c])}</strong> : display(row[c])}</td>
                  ))}
                  <td>
                    <div className="cluster" style={{ gap: '.4rem' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => { setEditing(editing === row.id ? null : row.id); setAdding(false); }}
                      >
                        {editing === row.id ? 'Close' : 'Edit'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={pending}
                        onClick={() => {
                          if (!window.confirm(`Remove this ${spec.singular.toLowerCase()}?`)) return;
                          setState({});
                          start(async () => setState(await deleteRecord(spec.key, row.id)));
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Status state={state} />

      {editing && (
        <div className="admin-edit-card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Edit {spec.singular.toLowerCase()}</h3>
          <RecordForm
            spec={spec}
            refs={refs}
            row={rows.find((r) => r.id === editing)}
            onDone={() => setEditing(null)}
          />
        </div>
      )}
    </section>
  );
}
