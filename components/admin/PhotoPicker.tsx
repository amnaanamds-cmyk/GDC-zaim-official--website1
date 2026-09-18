'use client';

import { useEffect, useId, useState } from 'react';
import Icon from '@/components/Icon';
import { MEDIA_POLICY, validateImage } from '@/lib/media';

/**
 * A file picker for one photograph. It shows what is on the site now, swaps
 * in a preview the moment a file is chosen, and refuses an unsuitable file
 * before the form is ever submitted — the server checks it again anyway.
 */
export default function PhotoPicker({
  name = 'photo',
  current,
  alt,
  label = 'Photograph',
  hint,
  shape = 'wide',
}: {
  name?: string;
  current?: string | null;
  alt?: string | null;
  label?: string;
  hint?: string;
  shape?: 'wide' | 'portrait';
}) {
  const id = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Object URLs hold a reference to the file until they are revoked.
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);

    const file = event.target.files?.[0];
    if (!file) return;

    const check = validateImage({ type: file.type, size: file.size, name: file.name });
    if (!check.ok) {
      setError(check.error);
      event.target.value = '';
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  const src = preview ?? current ?? null;

  return (
    <div className="field">
      <span className="admin-photo-label">{label}</span>
      <div className={`admin-photo admin-photo--${shape}`}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={preview ? 'The photograph you just chose' : alt ?? ''} />
        ) : (
          <span className="admin-photo-empty">
            <Icon name="image" />
            No photograph yet
          </span>
        )}
        {preview && <span className="admin-photo-flag">New — not saved yet</span>}
      </div>
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <input
        type="file"
        id={id}
        name={name}
        accept={MEDIA_POLICY.image.mimes.join(',')}
        onChange={onChange}
      />
      <span className="hint">{hint ?? `${MEDIA_POLICY.image.label}. Leave empty to keep the current photograph.`}</span>
      {error && (
        <div className="form-status err" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
