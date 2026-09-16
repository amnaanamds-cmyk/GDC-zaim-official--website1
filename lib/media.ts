/**
 * Upload policy for event photographs and videos.
 *
 * These limits are enforced on the server in app/api/events/media/route.ts.
 * The browser checks them too, but only so the user gets an instant answer —
 * the server check is the one that matters.
 */
export const MEDIA_POLICY = {
  image: {
    mimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
    maxBytes: 8 * 1024 * 1024,
    label: 'JPG, PNG, WebP, GIF or AVIF up to 8 MB',
  },
  video: {
    mimes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    maxBytes: 100 * 1024 * 1024,
    label: 'MP4, WebM, OGG or MOV up to 100 MB',
  },
  maxFilesPerUpload: 12,
} as const;

export type MediaKindLower = 'image' | 'video';

export function kindForMime(mime: string): MediaKindLower | null {
  if ((MEDIA_POLICY.image.mimes as readonly string[]).includes(mime)) return 'image';
  if ((MEDIA_POLICY.video.mimes as readonly string[]).includes(mime)) return 'video';
  return null;
}

export function validateFile(file: { type: string; size: number; name: string }):
  | { ok: true; kind: MediaKindLower }
  | { ok: false; error: string } {
  const kind = kindForMime(file.type);
  if (!kind) return { ok: false, error: `${file.name}: not a supported photo or video (${file.type || 'unknown type'}).` };
  if (file.size === 0) return { ok: false, error: `${file.name}: the file is empty.` };
  if (file.size > MEDIA_POLICY[kind].maxBytes) {
    const mb = (MEDIA_POLICY[kind].maxBytes / (1024 * 1024)).toFixed(0);
    return { ok: false, error: `${file.name}: too large. The limit for ${kind}s is ${mb} MB.` };
  }
  return { ok: true, kind };
}

/** A safe, collision-proof filename — never trust the name the browser sends. */
export function safeFilename(originalName: string, id: string) {
  const ext = (originalName.match(/\.[a-zA-Z0-9]{1,5}$/)?.[0] ?? '').toLowerCase();
  return `${id}${ext}`;
}
