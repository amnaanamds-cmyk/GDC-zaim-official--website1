import 'server-only';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

/**
 * Where uploaded files go.
 *
 * On a laptop there is a real, persistent disk, so files are written to
 * public/uploads and served straight from there.
 *
 * On a hosting platform such as Vercel the filesystem is read-only and is
 * wiped on every deploy, so files must go to object storage instead. Setting
 * BLOB_READ_WRITE_TOKEN (Vercel creates it when you add a Blob store) switches
 * this module over; nothing else in the app changes, because both paths return
 * a URL that an <img> or <video> tag can use.
 */
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads');

export type StoredFile = { url: string };

/** Human-readable description of the active backend, for the admin screens. */
export const storageBackend = useBlob ? 'blob' : 'disk';

function safeName(originalName: string, id: string) {
  // Never trust the name the browser sent — keep only a short extension.
  const ext = (originalName.match(/\.[a-zA-Z0-9]{1,5}$/)?.[0] ?? '').toLowerCase();
  return `${id}${ext}`;
}

/**
 * Saves a file and returns the URL to serve it from.
 *
 * @param folder  sub-folder, e.g. 'events' or 'applications'
 */
export async function saveUpload(
  data: Buffer,
  originalName: string,
  contentType: string,
  folder = 'events',
): Promise<StoredFile> {
  const filename = safeName(originalName, randomUUID());

  if (useBlob) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`${folder}/${filename}`, data, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
    });
    return { url: blob.url };
  }

  const dir = path.join(UPLOAD_ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), data);
  return { url: `/uploads/${folder}/${filename}` };
}

/**
 * Removes a previously saved file. Never throws: a missing file should not
 * stop the database row from being deleted.
 */
export async function deleteUpload(url: string | null | undefined): Promise<void> {
  if (!url) return;

  try {
    if (url.startsWith('http')) {
      const { del } = await import('@vercel/blob');
      await del(url);
      return;
    }
    // Local file. Resolve inside the uploads directory only, so a crafted
    // path can never reach anything else on disk.
    const relative = url.replace(/^\/uploads\//, '');
    const resolved = path.resolve(UPLOAD_ROOT, relative);
    if (!resolved.startsWith(UPLOAD_ROOT)) return;
    await unlink(resolved);
  } catch {
    // Already gone, or storage is unavailable — nothing useful to do here.
  }
}
