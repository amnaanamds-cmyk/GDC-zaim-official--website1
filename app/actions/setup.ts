'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { db } from '@/lib/db';
import { hashPassword, login, logActivity } from '@/lib/auth';
import { setupState } from '@/lib/setup';
import { installExampleContent } from '@/lib/example-content';
import { validateImage } from '@/lib/media';
import { saveUpload } from '@/lib/storage';

export type SetupState = { error?: string };

const schema = z.object({
  name: z.string().trim().min(4, 'Enter the full name of the college.').max(160),
  shortName: z.string().trim().min(2, 'Enter a short name, such as the college’s initials.').max(60),
  nameUr: z.string().trim().max(160).optional(),
  shortNameUr: z.string().trim().max(60).optional(),
  established: z.coerce
    .number()
    .int()
    .min(1800, 'Enter the year the college was founded.')
    .max(new Date().getFullYear(), 'The founding year cannot be in the future.'),
  affiliation: z.string().trim().max(200).optional(),
  district: z.string().trim().min(2, 'Enter the city or district the college serves.').max(80),
  address: z.string().trim().min(6, 'Enter the postal address.').max(240),
  phone: z.string().trim().min(6, 'Enter a telephone number.').max(40),
  admissionsPhone: z.string().trim().max(40).optional(),
  email: z.string().trim().email('Enter a valid email address for the college.').max(160),
  admissionsEmail: z.string().trim().email('Enter a valid admissions email address.').max(160).optional().or(z.literal('')),

  principalName: z.string().trim().min(3, 'Enter the principal’s name.').max(120),
  principalDesignation: z.string().trim().max(60).optional(),
  principalQualification: z.string().trim().max(160).optional(),

  adminName: z.string().trim().min(3, 'Enter your own name.').max(120),
  adminUsername: z
    .string()
    .trim()
    .min(4, 'Choose a username of at least 4 characters.')
    .max(40)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Usernames may use letters, numbers, dots, hyphens and underscores only.'),
  adminEmail: z.string().trim().email('Enter a valid email address for your account.').max(160),
  adminPassword: z.string().min(10, 'Use a password of at least 10 characters.').max(200),
  adminPasswordConfirm: z.string(),
});

/**
 * Claims this deployment for a college: records the institution, creates the
 * first administrator and signs them in.
 *
 * The guard is `setupState().open` — zero accounts — re-checked here on the
 * server rather than trusted from the page that rendered the form. Once any
 * account exists this returns an error no matter what is posted, so the
 * wizard cannot be used to take over a college's live site later.
 */
export async function completeSetup(_prev: SetupState, formData: FormData): Promise<SetupState> {
  const { open } = await setupState();
  if (!open) {
    return { error: 'This site has already been set up. Sign in instead.' };
  }

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' };
  }
  const d = parsed.data;

  if (d.adminPassword !== d.adminPasswordConfirm) {
    return { error: 'The two passwords do not match.' };
  }

  // The crest is optional; a college without one gets the neutral shield.
  let crestPath: string | null = null;
  const crest = formData.get('crest');
  if (crest instanceof File && crest.size > 0) {
    const check = validateImage({ type: crest.type, size: crest.size, name: crest.name });
    if (!check.ok) return { error: check.error };
    const stored = await saveUpload(
      Buffer.from(await crest.arrayBuffer()),
      crest.name,
      crest.type,
      'institution',
    );
    crestPath = stored.url;
  }

  const institution = await db.institution.create({
    data: {
      id: 'institution',
      name: d.name,
      shortName: d.shortName,
      nameUr: d.nameUr || d.name,
      shortNameUr: d.shortNameUr || d.shortName,
      established: d.established,
      affiliation: d.affiliation || '',
      district: d.district,
      address: d.address,
      phone: d.phone,
      admissionsPhone: d.admissionsPhone || d.phone,
      email: d.email,
      admissionsEmail: d.admissionsEmail || d.email,
      principalName: d.principalName,
      principalDesignation: d.principalDesignation || 'Principal',
      principalQualification: d.principalQualification || '',
      crestPath,
      setupCompletedAt: new Date(),
    },
  });

  const admin = await db.user.create({
    data: {
      name: d.adminName,
      username: d.adminUsername,
      email: d.adminEmail,
      passwordHash: await hashPassword(d.adminPassword),
      role: Role.ADMIN,
    },
  });

  if (formData.get('exampleContent') === 'on') {
    await installExampleContent(db, institution);
  }

  await logActivity(admin.id, 'CREATE', 'Institution', institution.id, d.name);

  // Sign the new administrator in, so setup ends on their own dashboard
  // rather than at a login screen asking for credentials they just chose.
  await login(d.adminUsername, d.adminPassword);
  redirect('/portal/admin');
}
