'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import { fmtBytes, fmtDuration } from '@/lib/format';

export type MediaItem = {
  id: string;
  kind: 'IMAGE' | 'VIDEO';
  title: string;
  description: string;
  filePath: string;
  posterPath: string | null;
  mime: string;
  size: number;
  duration: number | null;
  eventTitle: string;
};

/** Grid of uploaded event photographs and videos, with a viewer and — for an
 *  administrator — a delete control on each tile. */
export default function EventMediaGallery({ items, canManage }: { items: MediaItem[]; canManage: boolean }) {
  const [viewing, setViewing] = useState<MediaItem | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();

  async function remove(item: MediaItem) {
    if (!confirm(`Delete “${item.title}”? This removes the file from the server and cannot be undone.`)) return;
    setBusy(item.id);
    const res = await fetch(`/api/events/media?id=${encodeURIComponent(item.id)}`, { method: 'DELETE' });
    setBusy(null);
    if (res.ok) router.refresh();
    else alert('Could not delete that item.');
  }

  if (!items.length) {
    return (
      <div className="empty-state">
        <Icon name="file" />
        <p>No photographs or videos have been published for this event yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="media-grid">
        {items.map((m) => {
          const thumb = m.kind === 'IMAGE' ? m.filePath : m.posterPath;
          return (
            <figure className="media-tile" key={m.id}>
              <div className="media-thumb">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt={m.description || m.title} loading="lazy" />
                ) : (
                  <span className="media-thumb-fallback" aria-hidden="true">
                    <Icon name="file" />
                  </span>
                )}
                {m.kind === 'VIDEO' && (
                  <>
                    <span className="media-play" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7Z" />
                      </svg>
                    </span>
                    {m.duration ? <span className="media-duration">{fmtDuration(m.duration)}</span> : null}
                  </>
                )}
                <button className="media-open" type="button" onClick={() => setViewing(m)}>
                  <span className="visually-hidden">
                    {m.kind === 'VIDEO' ? 'Play' : 'View'} {m.title}
                  </span>
                </button>
                {canManage && (
                  <button
                    className="media-delete"
                    type="button"
                    onClick={() => remove(m)}
                    disabled={busy === m.id}
                    aria-label={`Delete ${m.title}`}
                    title="Delete"
                  >
                    <Icon name="close" />
                  </button>
                )}
              </div>
              <figcaption>
                <strong>{m.description || m.title}</strong>
                <span className="media-meta">
                  {m.eventTitle} · {fmtBytes(m.size)} · {m.kind.toLowerCase()}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {viewing && (
        <div
          className="gdc-modal"
          role="dialog"
          aria-modal="true"
          aria-label={viewing.title}
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewing(null);
          }}
        >
          <div className="gdc-modal-card" style={{ width: 'min(100%, 940px)' }}>
            <div className="dialog-head">
              <div>
                <h2 style={{ fontSize: '1.05rem' }}>{viewing.description || viewing.title}</h2>
                <p>{viewing.eventTitle}</p>
              </div>
              <button className="media-remove" type="button" onClick={() => setViewing(null)} aria-label="Close">
                <Icon name="close" />
              </button>
            </div>
            <div className="viewer-body">
              {viewing.kind === 'VIDEO' ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={viewing.filePath} controls autoPlay playsInline preload="metadata" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={viewing.filePath} alt={viewing.description || viewing.title} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
