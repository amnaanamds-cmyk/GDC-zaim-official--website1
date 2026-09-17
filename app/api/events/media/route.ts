import { NextResponse } from 'next/server';
import { Role, MediaKind } from '@prisma/client';
import { db } from '@/lib/db';
import { getSessionUser, logActivity } from '@/lib/auth';
import { MEDIA_POLICY, validateFile } from '@/lib/media';
import { saveUpload, deleteUpload } from '@/lib/storage';

export const runtime = 'nodejs';

/**
 * Receives event photographs and videos chosen from the administrator's local
 * drive and stores them on the server, so every visitor sees them.
 *
 * Only an administrator may post here. Every file is re-checked server-side
 * for type and size, written under a generated name (never the name the
 * browser supplied), and recorded in the database.
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Only an administrator can upload event media.' }, { status: 403 });
  }

  const form = await request.formData();
  const eventId = String(form.get('eventId') ?? '');
  const files = form.getAll('files').filter((f): f is File => f instanceof File);

  if (!files.length) return NextResponse.json({ error: 'No files were received.' }, { status: 400 });
  if (files.length > MEDIA_POLICY.maxFilesPerUpload) {
    return NextResponse.json(
      { error: `At most ${MEDIA_POLICY.maxFilesPerUpload} files per upload.` },
      { status: 400 },
    );
  }

  if (eventId && eventId !== 'general') {
    const exists = await db.event.findUnique({ where: { id: eventId }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: 'That event no longer exists.' }, { status: 400 });
  }

  const saved: string[] = [];
  const written: string[] = [];

  try {
    for (const [i, file] of files.entries()) {
      const check = validateFile({ type: file.type, size: file.size, name: file.name });
      if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });

      const buffer = Buffer.from(await file.arrayBuffer());
      const stored = await saveUpload(buffer, file.name, file.type, 'events');
      written.push(stored.url);

      // The browser captures a still from each video and sends it alongside,
      // so a video tile has something to show without ffmpeg on the server.
      let posterPath: string | null = null;
      const poster = form.get(`poster-${i}`);
      if (check.kind === 'video' && poster instanceof File && poster.size > 0 && poster.size < 2 * 1024 * 1024) {
        const posterStored = await saveUpload(
          Buffer.from(await poster.arrayBuffer()),
          `${file.name}-poster.jpg`,
          'image/jpeg',
          'events',
        );
        written.push(posterStored.url);
        posterPath = posterStored.url;
      }

      const durationRaw = Number(form.get(`duration-${i}`));
      const description = String(form.get(`description-${i}`) ?? '').trim() || file.name;

      const record = await db.eventMedia.create({
        data: {
          eventId: eventId && eventId !== 'general' ? eventId : null,
          kind: check.kind === 'video' ? MediaKind.VIDEO : MediaKind.IMAGE,
          title: file.name.slice(0, 180),
          description: description.slice(0, 400),
          filePath: stored.url,
          posterPath,
          mime: file.type,
          size: file.size,
          duration: Number.isFinite(durationRaw) && durationRaw > 0 ? durationRaw : null,
          uploadedById: user.id,
        },
      });
      saved.push(record.id);
    }
  } catch (err) {
    // Roll back any files already written so a failed upload leaves nothing behind.
    await Promise.all(written.map((url) => deleteUpload(url)));
    await db.eventMedia.deleteMany({ where: { id: { in: saved } } });
    console.error('Upload failed:', err);
    return NextResponse.json({ error: 'The upload could not be completed.' }, { status: 500 });
  }

  await logActivity(user.id, 'UPLOAD', 'EventMedia', null, `${saved.length} file(s)`);

  return NextResponse.json({ ok: true, count: saved.length });
}

/** Removes a media item and its files from disk. Administrators only. */
export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Only an administrator can delete event media.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });

  const item = await db.eventMedia.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  await Promise.all([item.filePath, item.posterPath].map((url) => deleteUpload(url)));

  await db.eventMedia.delete({ where: { id } });
  await logActivity(user.id, 'DELETE', 'EventMedia', id, item.title);

  return NextResponse.json({ ok: true });
}
