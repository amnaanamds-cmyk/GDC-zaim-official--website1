'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import { MEDIA_POLICY, validateFile, type MediaKindLower } from '@/lib/media';
import { fmtBytes } from '@/lib/format';

type Staged = {
  file: File;
  ok: boolean;
  kind: MediaKindLower | null;
  error?: string;
  description: string;
  previewUrl: string | null;
};

/**
 * Captures a still from a video so its tile has a thumbnail. Done in the
 * browser because the server has no video tooling installed; if it fails for
 * any reason the upload still goes ahead, just without a poster.
 */
function posterFor(file: File): Promise<{ poster: Blob | null; duration: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    let settled = false;
    const finish = (poster: Blob | null, duration = 0) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      resolve({ poster, duration });
    };

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(1, (video.duration || 2) / 4);
      } catch {
        finish(null);
      }
    };
    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) return finish(null, video.duration);
        const scale = Math.min(1, 720 / w);
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => finish(blob, video.duration), 'image/jpeg', 0.8);
      } catch {
        finish(null, video.duration);
      }
    };
    video.onerror = () => finish(null);
    setTimeout(() => finish(null), 8000);
    video.src = url;
  });
}

export default function MediaUploader({
  events,
  defaultEventId,
}: {
  events: { id: string; title: string }[];
  defaultEventId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [staged, setStaged] = useState<Staged[]>([]);
  const [eventId, setEventId] = useState(defaultEventId ?? '');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function stage(fileList: FileList | null) {
    if (!fileList) return;
    const room = MEDIA_POLICY.maxFilesPerUpload - staged.length;
    const incoming = Array.from(fileList).slice(0, Math.max(0, room));
    if (Array.from(fileList).length > room) {
      setError(`Only ${MEDIA_POLICY.maxFilesPerUpload} files can be uploaded at a time.`);
    }
    setStaged((prev) => [
      ...prev,
      ...incoming.map((file) => {
        const check = validateFile({ type: file.type, size: file.size, name: file.name });
        return {
          file,
          ok: check.ok,
          kind: check.ok ? check.kind : null,
          error: check.ok ? undefined : check.error,
          description: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
          previewUrl: check.ok && check.kind === 'image' ? URL.createObjectURL(file) : null,
        };
      }),
    ]);
  }

  function unstage(index: number) {
    setStaged((prev) => {
      const next = [...prev];
      if (next[index]?.previewUrl) URL.revokeObjectURL(next[index].previewUrl!);
      next.splice(index, 1);
      return next;
    });
  }

  function close() {
    staged.forEach((s) => s.previewUrl && URL.revokeObjectURL(s.previewUrl));
    setStaged([]);
    setError(null);
    setProgress(null);
    setOpen(false);
  }

  async function upload() {
    const queue = staged.filter((s) => s.ok);
    if (!queue.length) return;
    if (!eventId) {
      setError('Choose the event these files belong to.');
      return;
    }

    setError(null);
    setProgress(5);

    const body = new FormData();
    body.append('eventId', eventId);
    for (const [i, s] of queue.entries()) {
      body.append('files', s.file, s.file.name);
      body.append(`description-${i}`, s.description);
      if (s.kind === 'video') {
        const { poster, duration } = await posterFor(s.file);
        if (poster) body.append(`poster-${i}`, poster, 'poster.jpg');
        body.append(`duration-${i}`, String(duration));
      }
      setProgress(5 + Math.round(((i + 1) / queue.length) * 40));
    }

    try {
      const res = await fetch('/api/events/media', { method: 'POST', body });
      setProgress(90);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'The upload failed.');
        setProgress(null);
        return;
      }
      setProgress(100);
      close();
      router.refresh();
    } catch {
      setError('The upload failed. Check your connection and try again.');
      setProgress(null);
    }
  }

  const validCount = staged.filter((s) => s.ok).length;

  return (
    <>
      <button className="btn btn-primary" type="button" onClick={() => setOpen(true)}>
        <Icon name="download" />
        Upload photos &amp; videos
      </button>

      {open && (
        <div className="gdc-modal" role="dialog" aria-modal="true" aria-labelledby="upload-title">
          <div className="gdc-modal-card">
            <div className="dialog-head">
              <div>
                <h2 id="upload-title">Upload event media</h2>
                <p>
                  Photographs and videos from your computer. {MEDIA_POLICY.image.label}; {MEDIA_POLICY.video.label}.
                </p>
              </div>
              <button className="media-remove" type="button" onClick={close} aria-label="Close">
                <Icon name="close" />
              </button>
            </div>

            <div className="dialog-body">
              <div className="field" style={{ marginBottom: '1rem' }}>
                <label htmlFor="upload-event">Event</label>
                <select id="upload-event" value={eventId} onChange={(e) => setEventId(e.target.value)} required>
                  <option value="">Select the event</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                  <option value="general">General college events</option>
                </select>
              </div>

              <div
                className={`dropzone${dragging ? ' is-over' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    inputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  stage(e.dataTransfer.files);
                }}
              >
                <Icon name="download" />
                <strong>Choose files from your computer</strong>
                <span>or drag and drop them here</span>
              </div>

              <input
                ref={inputRef}
                type="file"
                multiple
                accept={[...MEDIA_POLICY.image.mimes, ...MEDIA_POLICY.video.mimes].join(',')}
                className="visually-hidden"
                aria-label="Choose photos and videos to upload"
                onChange={(e) => {
                  stage(e.target.files);
                  e.target.value = '';
                }}
              />

              <div className="staged-list">
                {staged.length === 0 && (
                  <p className="text-muted" style={{ margin: 0, fontSize: '.9rem' }}>
                    No files chosen yet.
                  </p>
                )}
                {staged.map((s, i) => (
                  <div className={`staged-file${s.ok ? '' : ' is-invalid'}`} key={`${s.file.name}-${i}`}>
                    <div className="staged-thumb">
                      {s.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.previewUrl} alt="" />
                      ) : (
                        <Icon name={s.kind === 'video' ? 'mic' : 'file'} />
                      )}
                    </div>
                    <div className="staged-body">
                      <strong>{s.file.name}</strong>
                      <span className="media-meta">
                        {fmtBytes(s.file.size)} · {s.file.type || 'unknown type'}
                      </span>
                      {s.ok ? (
                        <>
                          <label className="visually-hidden" htmlFor={`desc-${i}`}>
                            Description of {s.file.name}
                          </label>
                          <input
                            type="text"
                            id={`desc-${i}`}
                            value={s.description}
                            placeholder={`Describe this ${s.kind} (used as alt text)`}
                            onChange={(e) =>
                              setStaged((prev) => {
                                const next = [...prev];
                                next[i] = { ...next[i], description: e.target.value };
                                return next;
                              })
                            }
                          />
                        </>
                      ) : (
                        <span className="staged-error">{s.error}</span>
                      )}
                    </div>
                    <button
                      className="media-remove"
                      type="button"
                      onClick={() => unstage(i)}
                      aria-label={`Remove ${s.file.name}`}
                    >
                      <Icon name="close" />
                    </button>
                  </div>
                ))}
              </div>

              {progress !== null && (
                <div className="upload-progress">
                  <div className="bar">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  <p>Uploading… {progress}%</p>
                </div>
              )}

              {error && (
                <div className="form-status err" role="alert">
                  {error}
                </div>
              )}
            </div>

            <div className="dialog-foot">
              <span className="spacer text-muted" style={{ fontSize: '.86rem' }}>
                {validCount} file{validCount === 1 ? '' : 's'} ready
              </span>
              <button className="btn btn-outline" type="button" onClick={close}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={upload}
                disabled={validCount === 0 || progress !== null}
              >
                {progress !== null ? 'Uploading…' : `Upload ${validCount || ''}`.trim()}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
