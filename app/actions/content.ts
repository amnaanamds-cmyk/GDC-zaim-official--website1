'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { db } from '@/lib/db';
import { getSessionUser, logActivity } from '@/lib/auth';
import { validateImage, validateDocument, documentLabel } from '@/lib/media';
import { saveUpload, deleteUpload } from '@/lib/storage';
import { fmtBytes } from '@/lib/format';

/**
 * Everything on this page is website content that the college administrator
 * maintains from the browser: the principal's photograph, the leadership
 * details, the page banners, the gallery tiles and the downloadable
 * documents. Nothing here needs a developer, a code change or a redeploy.
 *
 * Every action re-checks the caller's role on the server. The admin screen
 * hides these controls from everyone else, but that is only a convenience —
 * this check is the one that decides.
 */

export type ContentState = { ok?: string; error?: string };

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== Role.ADMIN) throw new Error('Not permitted');
  return user;
}

const DENIED: ContentState = {
  error: 'Only an administrator can change website content. Sign in as the administrator and try again.',
};

/** Pulls an optional uploaded file out of a form, ignoring empty file inputs. */
function fileFrom(formData: FormData, field: string): File | null {
  const value = formData.get(field);
  if (!(value instanceof File) || value.size === 0) return null;
  return value;
}

/** Saves a photograph and returns its URL, or an error message. */
async function storePhoto(file: File, folder: string) {
  const check = validateImage({ type: file.type, size: file.size, name: file.name });
  if (!check.ok) return { error: check.error } as const;
  const stored = await saveUpload(Buffer.from(await file.arrayBuffer()), file.name, file.type, folder);
  return { url: stored.url } as const;
}

/* ------------------------------------------------------------------ *
 * Leadership — including the principal's photograph
 * ------------------------------------------------------------------ */

const leaderSchema = z.object({
  id: z.string().min(1),
  role: z.string().trim().min(2, 'Give the office a name.').max(80),
  name: z.string().trim().min(3, 'Give the person a name.').max(120),
  detail: z.string().trim().min(10, 'Describe the responsibilities in at least 10 characters.').max(400),
  alt: z.string().trim().max(300).optional(),
});

/**
 * Updates one member of the leadership and, if a photograph was chosen,
 * replaces their portrait. The old portrait is removed once the new one is
 * safely stored, so a failed upload never leaves the card with no picture.
 */
export async function saveLeader(_prev: ContentState, formData: FormData): Promise<ContentState> {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return DENIED;
  }

  const parsed = leaderSchema.safeParse({
    id: formData.get('id'),
    role: formData.get('role'),
    name: formData.get('name'),
    detail: formData.get('detail'),
    alt: formData.get('alt') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' };
  const data = parsed.data;

  const existing = await db.leader.findUnique({ where: { id: data.id } });
  if (!existing) return { error: 'That entry no longer exists — reload the page.' };

  let photoPath = existing.photoPath;
  const photo = fileFrom(formData, 'photo');
  if (photo) {
    const stored = await storePhoto(photo, 'leaders');
    if ('error' in stored) return { error: stored.error };
    photoPath = stored.url;
  }

  await db.leader.update({
    where: { id: data.id },
    data: {
      role: data.role,
      name: data.name,
      detail: data.detail,
      photoPath,
      alt: data.alt || `Portrait of ${data.name}, ${data.role} of Government Degree College Zaim.`,
    },
  });

  if (photo && existing.photoPath && existing.photoPath !== photoPath) {
    await deleteUpload(existing.photoPath);
  }

  await logActivity(user.id, photo ? 'UPLOAD' : 'UPDATE', 'Leader', data.id, `${data.role}: ${data.name}`);
  revalidatePath('/about');
  revalidatePath('/portal/admin/website');

  return {
    ok: photo
      ? `Saved. The new photograph of ${data.name} is on the About page now.`
      : `Saved ${data.name}'s details.`,
  };
}

/** Removes a portrait, putting the card back to its icon. */
export async function removeLeaderPhoto(id: string): Promise<ContentState> {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return DENIED;
  }

  const leader = await db.leader.findUnique({ where: { id } });
  if (!leader) return { error: 'That entry no longer exists — reload the page.' };
  if (!leader.photoPath) return { error: 'There is no photograph to remove.' };

  await db.leader.update({ where: { id }, data: { photoPath: null, alt: null } });
  await deleteUpload(leader.photoPath);
  await logActivity(user.id, 'DELETE', 'LeaderPhoto', id, leader.name);

  revalidatePath('/about');
  revalidatePath('/portal/admin/website');
  return { ok: `Removed the photograph of ${leader.name}.` };
}

/* ------------------------------------------------------------------ *
 * Page banners
 * ------------------------------------------------------------------ */

/**
 * Replaces the photograph in a fixed slot of the design. Because pages look
 * the slot up by name, one upload changes every page that uses it.
 */
export async function setSiteImage(_prev: ContentState, formData: FormData): Promise<ContentState> {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return DENIED;
  }

  const slot = String(formData.get('slot') ?? '').trim();
  const alt = String(formData.get('alt') ?? '').trim();
  if (!slot) return { error: 'Missing slot.' };

  const photo = fileFrom(formData, 'photo');
  const existing = await db.siteImage.findUnique({ where: { slot } });

  if (!photo) {
    // Nothing uploaded — the administrator only edited the description.
    if (!existing) return { error: 'Choose a photograph to upload.' };
    if (!alt) return { error: 'Describe the photograph for visitors using a screen reader.' };
    await db.siteImage.update({ where: { slot }, data: { alt } });
    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath('/portal/admin/website');
    return { ok: 'Saved the description.' };
  }

  const stored = await storePhoto(photo, 'site');
  if ('error' in stored) return { error: stored.error };

  await db.siteImage.upsert({
    where: { slot },
    create: { slot, imagePath: stored.url, alt, updatedById: user.id },
    update: { imagePath: stored.url, alt: alt || existing?.alt || '', updatedById: user.id },
  });

  if (existing?.imagePath) await deleteUpload(existing.imagePath);

  await logActivity(user.id, 'UPLOAD', 'SiteImage', slot, slot);
  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/contact');
  revalidatePath('/portal/admin/website');

  return { ok: 'Uploaded. The new photograph is live on the site.' };
}

/* ------------------------------------------------------------------ *
 * Gallery
 * ------------------------------------------------------------------ */

const gallerySchema = z.object({
  title: z.string().trim().min(3, 'Give the photograph a caption.').max(120),
  category: z.string().trim().min(2).max(40),
  alt: z.string().trim().max(300).optional(),
});

/**
 * Puts a photograph into an existing gallery tile, or creates a new tile.
 * The placeholder tiles seeded with the site — Central Library, Computer
 * Laboratory, Chemistry Laboratory, Zoology Laboratory — are filled this way.
 */
export async function saveGalleryItem(_prev: ContentState, formData: FormData): Promise<ContentState> {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return DENIED;
  }

  const id = String(formData.get('id') ?? '').trim();
  const parsed = gallerySchema.safeParse({
    title: formData.get('title'),
    category: formData.get('category'),
    alt: formData.get('alt') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' };
  const data = parsed.data;

  const photo = fileFrom(formData, 'photo');

  if (!id) {
    // A brand new tile has to arrive with a photograph.
    if (!photo) return { error: 'Choose a photograph for the new gallery tile.' };
    const stored = await storePhoto(photo, 'gallery');
    if ('error' in stored) return { error: stored.error };

    const last = await db.galleryItem.findFirst({ orderBy: { order: 'desc' }, select: { order: true } });
    const item = await db.galleryItem.create({
      data: {
        title: data.title,
        category: data.category,
        imagePath: stored.url,
        alt: data.alt || data.title,
        order: (last?.order ?? 0) + 1,
      },
    });

    await logActivity(user.id, 'UPLOAD', 'GalleryItem', item.id, data.title);
    revalidatePath('/gallery');
    revalidatePath('/portal/admin/website');
    return { ok: `Added “${data.title}” to the gallery.` };
  }

  const existing = await db.galleryItem.findUnique({ where: { id } });
  if (!existing) return { error: 'That tile no longer exists — reload the page.' };

  let imagePath = existing.imagePath;
  if (photo) {
    const stored = await storePhoto(photo, 'gallery');
    if ('error' in stored) return { error: stored.error };
    imagePath = stored.url;
  }

  await db.galleryItem.update({
    where: { id },
    data: { title: data.title, category: data.category, imagePath, alt: data.alt || data.title },
  });

  if (photo && existing.imagePath && existing.imagePath !== imagePath) {
    await deleteUpload(existing.imagePath);
  }

  await logActivity(user.id, photo ? 'UPLOAD' : 'UPDATE', 'GalleryItem', id, data.title);
  revalidatePath('/gallery');
  revalidatePath('/portal/admin/website');

  return { ok: photo ? `Uploaded the photograph for “${data.title}”.` : `Saved “${data.title}”.` };
}

/** Removes a gallery tile and its photograph. */
export async function deleteGalleryItem(id: string): Promise<ContentState> {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return DENIED;
  }

  const item = await db.galleryItem.findUnique({ where: { id } });
  if (!item) return { error: 'That tile no longer exists — reload the page.' };

  await db.galleryItem.delete({ where: { id } });
  await deleteUpload(item.imagePath);
  await logActivity(user.id, 'DELETE', 'GalleryItem', id, item.title);

  revalidatePath('/gallery');
  revalidatePath('/portal/admin/website');
  return { ok: `Removed “${item.title}” from the gallery.` };
}

/* ------------------------------------------------------------------ *
 * Downloadable documents
 * ------------------------------------------------------------------ */

const downloadSchema = z.object({
  title: z.string().trim().min(4, 'Give the document a title.').max(160),
  category: z.string().trim().min(2).max(60),
});

/** Publishes a document — prospectus, form, datesheet, policy — for download. */
export async function addDownload(_prev: ContentState, formData: FormData): Promise<ContentState> {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return DENIED;
  }

  const parsed = downloadSchema.safeParse({
    title: formData.get('title'),
    category: formData.get('category'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' };
  const data = parsed.data;

  const file = fileFrom(formData, 'file');
  if (!file) return { error: 'Choose the document to publish.' };

  const check = validateDocument({ type: file.type, size: file.size, name: file.name });
  if (!check.ok) return { error: check.error };

  const stored = await saveUpload(
    Buffer.from(await file.arrayBuffer()),
    file.name,
    file.type,
    'documents',
  );

  const record = await db.download.create({
    data: {
      title: data.title,
      category: data.category,
      fileType: documentLabel(file.type),
      size: fmtBytes(file.size),
      bytes: file.size,
      mime: file.type,
      filePath: stored.url,
      uploadedById: user.id,
    },
  });

  await logActivity(user.id, 'UPLOAD', 'Download', record.id, data.title);
  revalidatePath('/downloads');
  revalidatePath('/portal/admin/website');

  return { ok: `Published “${data.title}”. Visitors can download it now.` };
}

/** Withdraws a document and deletes the file. */
export async function deleteDownload(id: string): Promise<ContentState> {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return DENIED;
  }

  const doc = await db.download.findUnique({ where: { id } });
  if (!doc) return { error: 'That document no longer exists — reload the page.' };

  await db.download.delete({ where: { id } });
  await deleteUpload(doc.filePath);
  await logActivity(user.id, 'DELETE', 'Download', id, doc.title);

  revalidatePath('/downloads');
  revalidatePath('/portal/admin/website');
  return { ok: `Withdrew “${doc.title}”.` };
}
