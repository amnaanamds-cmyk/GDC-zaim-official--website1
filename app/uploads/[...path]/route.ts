import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import path from 'node:path';
import { findUpload } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Serves files uploaded from the admin panel.
 *
 * These cannot live in public/: Next.js snapshots that folder at build time,
 * so a photograph uploaded while the site is running would return 404 until
 * the next build. Reading them here means an upload is visible immediately.
 *
 * When the site runs on a platform with object storage (Vercel Blob), the
 * stored URLs are absolute and the browser never reaches this route at all.
 */
const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogv': 'video/ogg',
  '.mov': 'video/quicktime',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const relative = segments.map(decodeURIComponent).join('/');

  // findUpload refuses anything that resolves outside the upload directory.
  const file = await findUpload(relative);
  if (!file) return new Response('Not found', { status: 404 });

  const info = await stat(file);
  const type = CONTENT_TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream';

  // Every stored filename contains a fresh UUID, so a URL always refers to the
  // same bytes and can be cached hard. Replacing a photograph produces a new URL.
  const headers = new Headers({
    'Content-Type': type,
    'Content-Length': String(info.size),
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
    'Last-Modified': info.mtime.toUTCString(),
  });

  if (request.method === 'HEAD') return new Response(null, { headers });

  const stream = Readable.toWeb(createReadStream(file)) as ReadableStream;
  return new Response(stream, { headers });
}

export const HEAD = GET;
