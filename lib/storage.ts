import 'server-only';
import { mkdir, writeFile, unlink, stat } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

/**
 * Where uploaded files go.
 *
 * On a college server there is a real, persistent disk, so files are written
 * under var/uploads and served back by app/uploads/[...path]/route.ts.
 *
 * They deliberately do NOT live in public/. Next.js takes a snapshot of that
 * folder when the site is built, so anything written there afterwards is not
 * served until the next build — exactly the wrong behaviour for photographs
 * the administrator uploads while the site is running.
 *
 * On a hosting platform such as Vercel the filesystem is read-only and is
 * wiped on every deploy, so files must go to object storage instead. Setting
 * BLOB_READ_WRITE_TOKEN (Vercel creates it when you add a Blob store) switches
 * this module over; nothing else in the app changes, because both paths return
 * a URL that an <img> or <video> tag can use.
 */
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const UPLOAD_ROOT = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), 'var', 'uploads');

/**
 * Uploads made before they were moved out of public/. Read-only, so files
 * already on a college server keep being served; nothing new is written here.
 */
const LEGACY_ROOT = path.join(process.cwd(), 'public', 'uploads');

export type StoredFile = { url: string };

/** Human-readable description of the active backend, for the admin screens. */
export const storageBackend = useBlob ? 'blob' : 'disk';

function safeName(originalName: string, id: string) {
  // Never trust the name the browser sent — keep only a short extension.
  const ext = (originalName.match(/\.[a-zA-Z0-9]{1,5}$/)?.[0] ?? '').toLowerCase();
  return `${id}${ext}`;
}

/**
 * Turns the tail of a `/uploads/…` URL into an absolute path inside one of the
 * upload roots, or null if it points anywhere else. Every filesystem read and
 * delete goes through here, so a crafted path cannot escape the directory.
 */
function resolveInRoot(relative: string, root: string): string | null {
  const clean = relative.replace(/^\/+/, '');
  if (!clean || clean.includes('\0')) return null;

  const resolved = path.resolve(root, clean);
  const prefix = root.endsWith(path.sep) ? root : root + path.sep;
  return resolved.startsWith(prefix) ? resolved : null;
}

/**
 * Finds an uploaded file on disk, checking the legacy location too so that
 * uploads made before the move keep working.
 *
 * @param relative  the part of the URL after `/uploads/`
 */
export async function findUpload(relative: string): Promise<string | null> {
  for (const root of [UPLOAD_ROOT, LEGACY_ROOT]) {
    const resolved = resolveInRoot(relative, root);
    if (!resolved) continue;
    try {
      const info = await stat(resolved);
      if (info.isFile()) return resolved;
    } catch {
      // Not in this root — try the next one.
    }
  }
  return null;
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

    // Anything that is not an upload is a file shipped with the repository
    // (the photographs under public/images). Replacing one of those in the
    // admin panel must not delete it from the build.
    if (!url.startsWith('/uploads/')) return;

    const resolved = await findUpload(url.slice('/uploads/'.length));
    if (resolved) await unlink(resolved);
  } catch {
    // Already gone, or storage is unavailable — nothing useful to do here.
  }
}
