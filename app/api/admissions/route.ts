import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { site, instCode } from '@/lib/site';
import { saveUpload, deleteUpload } from '@/lib/storage';

export const runtime = 'nodejs';
const ALLOWED_DOC_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_DOC_BYTES = 2 * 1024 * 1024;
const MAX_DOCS = 6;

const schema = z.object({
  name: z.string().trim().min(3).max(120),
  guardianName: z.string().trim().min(3).max(120),
  // Identity documents differ by country, so this checks only that something
  // plausible was entered — never that it matches one nation's format.
  idNumber: z
    .string()
    .trim()
    .min(5, 'Enter your identity document number.')
    .max(40)
    .regex(/^[A-Za-z0-9][A-Za-z0-9 \-\/]*$/, 'Use letters, numbers, spaces, hyphens or slashes only.'),
  dob: z.string().min(4),
  phone: z.string().trim().min(7).max(40),
  email: z.union([z.email(), z.literal('')]).optional(),
  programmeId: z.string().trim().min(1, 'Choose a programme'),
  marks: z.coerce.number().min(0).max(100_000),
  totalMarks: z.coerce.number().min(1).max(100_000),
  address: z.string().trim().min(10).max(500),
});

/**
 * Receives an admission application with its supporting documents.
 *
 * Merit is computed on the server from the marks supplied, using the published
 * weighting — never sent by the browser — and the applicant gets a reference
 * they can track.
 */
export async function POST(request: Request) {
  const form = await request.formData();

  const parsed = schema.safeParse({
    name: form.get('name'),
    guardianName: form.get('guardianName'),
    idNumber: form.get('idNumber'),
    dob: form.get('dob'),
    phone: form.get('phone'),
    email: form.get('email') ?? '',
    programmeId: form.get('programmeId'),
    marks: form.get('marks'),
    totalMarks: form.get('totalMarks') ?? 100,
    address: form.get('address'),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const data = parsed.data;

  const programme = await db.programme.findUnique({ where: { id: data.programmeId } });
  if (!programme) return NextResponse.json({ error: 'That programme is not offered.' }, { status: 400 });

  const files = form.getAll('documents').filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_DOCS) {
    return NextResponse.json({ error: `Attach at most ${MAX_DOCS} documents.` }, { status: 400 });
  }
  for (const f of files) {
    if (!ALLOWED_DOC_MIMES.includes(f.type)) {
      return NextResponse.json({ error: `${f.name}: attach PDF, JPG or PNG files only.` }, { status: 400 });
    }
    if (f.size > MAX_DOC_BYTES) {
      return NextResponse.json({ error: `${f.name}: each document must be under 2 MB.` }, { status: 400 });
    }
  }

  // Merit weighting published on this page: 50% intermediate, 30% matric, 20% test.
  // Only the intermediate marks are collected online, so the score recorded is
  // the intermediate component; the office adds the rest at verification.
  // Merit is a percentage of whatever total the qualification was marked out
  // of, so the scale of the examination does not change the ranking.
  const meritScore = Math.round((data.marks / data.totalMarks) * 50 * 100) / 100;

  const ref = `${instCode(await site())}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const written: string[] = [];

  try {
    const application = await db.application.create({
      data: {
        ref,
        name: data.name,
        guardianName: data.guardianName,
        idNumber: data.idNumber,
        totalMarks: data.totalMarks,
        dob: new Date(`${data.dob}T00:00:00.000Z`),
        phone: data.phone,
        email: data.email || null,
        programmeId: programme.id,
        marks: data.marks,
        address: data.address,
        meritScore,
      },
    });

    for (const file of files) {
      const stored = await saveUpload(
        Buffer.from(await file.arrayBuffer()),
        file.name,
        file.type,
        'applications',
      );
      written.push(stored.url);

      await db.applicationDocument.create({
        data: {
          applicationId: application.id,
          filePath: stored.url,
          originalName: file.name.slice(0, 180),
          mime: file.type,
          size: file.size,
        },
      });
    }

    return NextResponse.json({ ok: true, ref, documents: files.length });
  } catch (err) {
    await Promise.all(written.map((url) => deleteUpload(url)));
    console.error('Application failed:', err);
    return NextResponse.json({ error: 'The application could not be submitted.' }, { status: 500 });
  }
}
