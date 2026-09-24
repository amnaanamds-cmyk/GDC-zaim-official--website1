'use server';

import { revalidatePath } from 'next/cache';
import { Prisma, Role } from '@prisma/client';
import { db } from '@/lib/db';
import { getSessionUser, logActivity } from '@/lib/auth';
import { RESOURCES, isResourceKey, slugify, type Field, type ResourceKey } from '@/lib/resources';

/**
 * Creating, changing and removing the records a college enters about itself.
 *
 * One action serves every kind of record, driven by the specs in
 * lib/resources.ts. The resource key and every field name are checked against
 * that list before anything is written, so a crafted form cannot reach a table
 * or a column that was never meant to be edited here.
 */

export type RecordState = { ok?: string; error?: string };

const DENIED: RecordState = {
  error: 'Only an administrator can change these records. Sign in as the administrator and try again.',
};

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== Role.ADMIN) throw new Error('Not permitted');
  return user;
}

/** The one place a resource key becomes a table. Nothing else may pick one. */
function delegateFor(key: ResourceKey) {
  switch (key) {
    case 'department': return db.department;
    case 'programme': return db.programme;
    case 'course': return db.course;
    case 'faculty': return db.faculty;
    case 'student': return db.student;
    case 'event': return db.event;
    case 'facility': return db.facility;
    case 'admissionStage': return db.admissionStage;
    case 'scholarship': return db.scholarship;
    case 'book': return db.book;
    case 'alumnus': return db.alumnus;
    case 'career': return db.careerOpportunity;
  }
}

type Coerced = { data: Record<string, unknown> } | { error: string };

/** Turns the submitted form into a row, one declared field at a time. */
function coerce(fields: Field[], formData: FormData): Coerced {
  const data: Record<string, unknown> = {};

  for (const field of fields) {
    const raw = formData.get(field.name);

    switch (field.type) {
      case 'checkbox':
        data[field.name] = raw === 'on';
        break;

      case 'number': {
        const text = String(raw ?? '').trim();
        if (!text) {
          if (field.required) return { error: `${field.label} is required.` };
          break; // leave the column at its default
        }
        const n = Number(text);
        if (!Number.isFinite(n)) return { error: `${field.label} must be a number.` };
        if (field.min !== undefined && n < field.min) return { error: `${field.label} must be at least ${field.min}.` };
        if (field.max !== undefined && n > field.max) return { error: `${field.label} must be at most ${field.max}.` };
        data[field.name] = Math.trunc(n);
        break;
      }

      case 'date': {
        const text = String(raw ?? '').trim();
        if (!text) {
          if (field.required) return { error: `${field.label} is required.` };
          data[field.name] = null;
          break;
        }
        const d = new Date(text);
        if (Number.isNaN(d.getTime())) return { error: `${field.label} is not a valid date.` };
        data[field.name] = d;
        break;
      }

      case 'list': {
        const text = String(raw ?? '');
        data[field.name] = text
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .slice(0, 60);
        break;
      }

      case 'ref': {
        const text = String(raw ?? '').trim();
        if (!text) {
          if (field.required) return { error: `Choose a ${field.label.toLowerCase()}.` };
          data[field.name] = null;
          break;
        }
        data[field.name] = text;
        break;
      }

      case 'select': {
        const text = String(raw ?? '').trim();
        if (!text) {
          if (field.required) return { error: `Choose a ${field.label.toLowerCase()}.` };
          break;
        }
        if (!field.options.includes(text)) return { error: `${field.label} is not one of the choices.` };
        data[field.name] = text;
        break;
      }

      default: {
        const text = String(raw ?? '').trim();
        if (!text) {
          if (field.required) return { error: `${field.label} is required.` };
          data[field.name] = '';
          break;
        }
        if (field.max && text.length > field.max) {
          return { error: `${field.label} is too long — keep it under ${field.max} characters.` };
        }
        if (field.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text)) {
          return { error: `${field.label} is not a valid email address.` };
        }
        data[field.name] = text;
      }
    }
  }

  return { data };
}

function duplicateMessage(err: unknown, singular: string): string | null {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    const target = String((err.meta as { target?: string[] } | undefined)?.target ?? '');
    const field = target.split('_').filter((p) => p && p !== 'key')[1] ?? 'value';
    return `Another ${singular.toLowerCase()} already uses that ${field}. Choose a different one.`;
  }
  return null;
}

/** Adds a record, or saves changes to one when __id is supplied. */
export async function saveRecord(_prev: RecordState, formData: FormData): Promise<RecordState> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return DENIED;
  }

  const key = formData.get('__resource');
  if (!isResourceKey(key)) return { error: 'Unknown kind of record.' };
  const spec = RESOURCES[key];
  const id = String(formData.get('__id') ?? '').trim();

  const coerced = coerce(spec.fields, formData);
  if ('error' in coerced) return coerced;
  const data = coerced.data;

  // A blank web address is filled in from the record's name.
  if (spec.slugFrom) {
    const current = String(data[spec.slugFrom.field] ?? '').trim();
    const source = String(data[spec.slugFrom.from] ?? '');
    data[spec.slugFrom.field] = slugify(current || source) || slugify(source) || `item-${Date.now()}`;
  }

  try {
    const delegate = delegateFor(key);
    const saved = id
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (delegate as any).update({ where: { id }, data })
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (delegate as any).create({ data });

    await logActivity(
      admin.id,
      id ? 'UPDATE' : 'CREATE',
      spec.singular,
      saved.id,
      String(data.name ?? data.title ?? data.stage ?? saved.id),
    );
    for (const path of [...spec.revalidate, `/portal/admin`]) revalidatePath(path);

    return { ok: id ? `Saved.` : `Added to ${spec.plural.toLowerCase()}.` };
  } catch (err) {
    const duplicate = duplicateMessage(err, spec.singular);
    if (duplicate) return { error: duplicate };
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return { error: 'That record no longer exists — reload the page.' };
    }
    console.error(`Saving ${key} failed:`, err);
    return { error: 'That could not be saved.' };
  }
}

/**
 * What would be destroyed along with a record.
 *
 * The database cascades a department's deletion down through its programmes
 * to its students and their attendance and marks. That is far more than an
 * administrator means when they remove a department they added by mistake, so
 * anything still attached blocks the deletion and is named instead.
 */
async function blockers(key: ResourceKey, id: string): Promise<string[]> {
  const found: string[] = [];
  const note = (n: number, one: string, many: string) => {
    if (n > 0) found.push(`${n} ${n === 1 ? one : many}`);
  };

  if (key === 'department') {
    note(await db.programme.count({ where: { departmentId: id } }), 'programme', 'programmes');
    note(await db.course.count({ where: { departmentId: id } }), 'course', 'courses');
    note(await db.faculty.count({ where: { departmentId: id } }), 'faculty member', 'faculty members');
  }
  if (key === 'programme') {
    note(await db.student.count({ where: { programmeId: id } }), 'student', 'students');
    note(await db.application.count({ where: { programmeId: id } }), 'application', 'applications');
  }
  if (key === 'course') {
    note(await db.enrollment.count({ where: { courseId: id } }), 'enrolment', 'enrolments');
  }
  if (key === 'student') {
    note(await db.enrollment.count({ where: { studentId: id } }), 'enrolment', 'enrolments');
  }
  if (key === 'faculty') {
    note(await db.course.count({ where: { teacherId: id } }), 'assigned course', 'assigned courses');
  }
  if (key === 'event') {
    note(await db.eventMedia.count({ where: { eventId: id } }), 'photograph or video', 'photographs and videos');
  }
  return found;
}

/** Removes a record, unless something still depends on it. */
export async function deleteRecord(resource: string, id: string): Promise<RecordState> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return DENIED;
  }

  if (!isResourceKey(resource)) return { error: 'Unknown kind of record.' };
  const spec = RESOURCES[resource];

  const blocked = await blockers(resource, id);
  if (blocked.length) {
    return {
      error: `This ${spec.singular.toLowerCase()} still has ${blocked.join(' and ')} attached. Move or remove those first — deleting it now would take them with it.`,
    };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (delegateFor(resource) as any).delete({ where: { id } });
    await logActivity(admin.id, 'DELETE', spec.singular, id, null);
    for (const path of spec.revalidate) revalidatePath(path);
    return { ok: `Removed.` };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return { error: 'That record no longer exists — reload the page.' };
    }
    console.error(`Deleting ${resource} failed:`, err);
    return { error: 'That could not be removed.' };
  }
}

/* ------------------------------------------------------------------ *
 * Enrolment
 *
 * Not a plain record: it joins a student to a course for a session, and
 * without it a teacher has nothing to mark and a student has no result. The
 * screen enrols a student on several courses at once, because that is how a
 * registrar actually works.
 * ------------------------------------------------------------------ */

/** Enrols one student on the chosen courses for a session. */
export async function enrolStudent(_prev: RecordState, formData: FormData): Promise<RecordState> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return DENIED;
  }

  const studentId = String(formData.get('studentId') ?? '').trim();
  const session = String(formData.get('session') ?? '').trim();
  const courseIds = formData.getAll('courseIds').map(String).filter(Boolean);

  if (!studentId) return { error: 'Choose a student.' };
  if (!session) return { error: 'Name the session, such as “Fall 2026”.' };
  if (!courseIds.length) return { error: 'Choose at least one course.' };

  const student = await db.student.findUnique({ where: { id: studentId } });
  if (!student) return { error: 'That student no longer exists — reload the page.' };

  const courses = await db.course.findMany({ where: { id: { in: courseIds } } });
  if (courses.length !== courseIds.length) return { error: 'One of those courses no longer exists.' };

  // skipDuplicates so enrolling again on a course they already take is a
  // no-op rather than an error — a registrar adding one more course should
  // not have to untick the others.
  const result = await db.enrollment.createMany({
    data: courses.map((c) => ({
      studentId,
      courseId: c.id,
      semester: c.semester,
      session,
    })),
    skipDuplicates: true,
  });

  await logActivity(admin.id, 'ENROL', 'Enrollment', studentId, `${student.name}: ${result.count} course(s)`);
  revalidatePath('/portal/admin/people');
  revalidatePath('/portal/teacher');
  revalidatePath('/portal/student');

  if (result.count === 0) {
    return { ok: `${student.name} was already enrolled on every course you chose.` };
  }
  return {
    ok: `Enrolled ${student.name} on ${result.count} course${result.count === 1 ? '' : 's'} for ${session}.`,
  };
}

/** Removes one enrolment, along with the attendance and marks recorded on it. */
export async function removeEnrolment(id: string): Promise<RecordState> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return DENIED;
  }

  const enrolment = await db.enrollment.findUnique({
    where: { id },
    include: { student: true, course: true, _count: { select: { attendance: true } } },
  });
  if (!enrolment) return { error: 'That enrolment no longer exists — reload the page.' };

  await db.enrollment.delete({ where: { id } });
  await logActivity(
    admin.id,
    'DELETE',
    'Enrollment',
    id,
    `${enrolment.student.name} from ${enrolment.course.title}`,
  );
  revalidatePath('/portal/admin/people');
  revalidatePath('/portal/teacher');
  revalidatePath('/portal/student');

  const lost = enrolment._count.attendance;
  return {
    ok: `Removed ${enrolment.student.name} from ${enrolment.course.title}${
      lost ? `, along with ${lost} attendance record${lost === 1 ? '' : 's'}` : ''
    }.`,
  };
}
