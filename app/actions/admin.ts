'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Role, MarkStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { getSessionUser, logActivity } from '@/lib/auth';
import { validateDocument } from '@/lib/media';
import { saveUpload, deleteUpload } from '@/lib/storage';

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== Role.ADMIN) throw new Error('Not permitted');
  return user;
}

export type ActionState = { ok?: string; error?: string };

const noticeSchema = z.object({
  title: z.string().trim().min(6, 'Give the notice a title of at least 6 characters.').max(200),
  body: z.string().trim().min(20, 'The notice text should be at least 20 characters.').max(4000),
  category: z.string().trim().min(1),
  departmentId: z.string().trim().optional(),
  pinned: z.boolean(),
  publishAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

/** Publish a notice. Appears on the public site the moment it is saved. */
export async function publishNotice(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return { error: 'You do not have permission to publish notices.' };
  }

  const parsed = noticeSchema.safeParse({
    title: formData.get('title'),
    body: formData.get('body'),
    category: formData.get('category'),
    departmentId: formData.get('departmentId') || undefined,
    pinned: formData.get('pinned') === 'on',
    publishAt: formData.get('publishAt') || undefined,
    expiresAt: formData.get('expiresAt') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' };
  }
  const data = parsed.data;

  // An announcement may carry a document — a datesheet, a merit list, a form.
  let fileUrl: string | null = null;
  let fileName: string | null = null;
  const attachment = formData.get('attachment');
  if (attachment instanceof File && attachment.size > 0) {
    const check = validateDocument({
      type: attachment.type,
      size: attachment.size,
      name: attachment.name,
    });
    if (!check.ok) return { error: check.error };

    const stored = await saveUpload(
      Buffer.from(await attachment.arrayBuffer()),
      attachment.name,
      attachment.type,
      'notices',
    );
    fileUrl = stored.url;
    fileName = attachment.name.slice(0, 180);
  }

  const notice = await db.notice.create({
    data: {
      title: data.title,
      body: data.body,
      category: data.category,
      departmentId: data.departmentId || null,
      pinned: data.pinned,
      publishAt: data.publishAt ? new Date(data.publishAt) : new Date(),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      fileUrl,
      fileName,
      authorId: user.id,
    },
  }).catch(async (err) => {
    // Do not leave an orphaned attachment behind if the row cannot be written.
    await deleteUpload(fileUrl);
    throw err;
  });

  await logActivity(user.id, 'PUBLISH', 'Notice', notice.id, data.title);

  revalidatePath('/');
  revalidatePath('/notices');
  revalidatePath('/portal/admin');

  return {
    ok: fileName
      ? `Published “${data.title}” with ${fileName} attached. It is live on the notice board now.`
      : `Published “${data.title}”. It is live on the notice board now.`,
  };
}

/** Verify a course's submitted marks so students can see their results. */
export async function verifyMarks(markIds: string[], course: string): Promise<ActionState> {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return { error: 'You do not have permission to verify results.' };
  }

  const result = await db.mark.updateMany({
    where: { id: { in: markIds }, status: MarkStatus.SUBMITTED },
    data: { status: MarkStatus.VERIFIED, verifiedById: user.id },
  });

  await logActivity(user.id, 'VERIFY', 'Result', null, `${course} (${result.count} records)`);

  revalidatePath('/portal/admin');
  revalidatePath('/portal/student');
  return { ok: `Verified ${result.count} result${result.count === 1 ? '' : 's'} for ${course}.` };
}
