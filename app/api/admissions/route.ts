import { NextResponse } from 'next/server';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

const DOC_DIR = path.join(process.cwd(), 'public', 'uploads', 'applications');
const ALLOWED_DOC_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_DOC_BYTES = 2 * 1024 * 1024;
const MAX_DOCS = 6;

const schema = z.object({
  name: z.string().trim().min(3).max(120),
  fatherName: z.string().trim().min(3).max(120),
  cnic: z.string().trim().regex(/^\d{5}-\d{7}-\d$/, 'CNIC must look like 00000-0000000-0'),
  dob: z.string().min(4),
  phone: z.string().trim().min(7).max(40),
  email: z.union([z.email(), z.literal('')]).optional(),
  programmeId: z.string().trim().min(1, 'Choose a programme'),
  marks: z.coerce.number().min(0).max(1100),
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
    fatherName: form.get('fatherName'),
    cnic: form.get('cnic'),
    dob: form.get('dob'),
    phone: form.get('phone'),
    email: form.get('email') ?? '',
    programmeId: form.get('programmeId'),
    marks: form.get('marks'),
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
  const meritScore = Math.round((data.marks / 1100) * 50 * 100) / 100;

  const ref = `GDCZ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const written: string[] = [];

  try {
    await mkdir(DOC_DIR, { recursive: true });

    const application = await db.application.create({
      data: {
        ref,
        name: data.name,
        fatherName: data.fatherName,
        cnic: data.cnic,
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
      const id = randomUUID();
      const ext = (file.name.match(/\.[a-zA-Z0-9]{1,5}$/)?.[0] ?? '').toLowerCase();
      const filename = `${id}${ext}`;
      await writeFile(path.join(DOC_DIR, filename), Buffer.from(await file.arrayBuffer()));
      written.push(filename);

      await db.applicationDocument.create({
        data: {
          applicationId: application.id,
          filePath: `/uploads/applications/${filename}`,
          originalName: file.name.slice(0, 180),
          mime: file.type,
          size: file.size,
        },
      });
    }

    return NextResponse.json({ ok: true, ref, documents: files.length });
  } catch (err) {
    await Promise.all(written.map((f) => unlink(path.join(DOC_DIR, f)).catch(() => null)));
    console.error('Application failed:', err);
    return NextResponse.json({ error: 'The application could not be submitted.' }, { status: 500 });
  }
}
