'use server';

import { revalidatePath } from 'next/cache';
import { Role, AttendanceStatus, MarkStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { getSessionUser, logActivity } from '@/lib/auth';

export type ActionState = { ok?: string; error?: string };

async function requireTeacher() {
  const user = await getSessionUser();
  if (!user || (user.role !== Role.TEACHER && user.role !== Role.ADMIN)) throw new Error('Not permitted');
  return user;
}

/** Confirms the signed-in teacher actually teaches this course. */
async function assertTeaches(userId: string, courseId: string, role: Role) {
  if (role === Role.ADMIN) return;
  const course = await db.course.findUnique({ where: { id: courseId }, include: { teacher: true } });
  if (!course || course.teacher?.userId !== userId) throw new Error('That course is not assigned to you');
}

/** Saves one day's attendance for a course. Re-saving the same date updates it. */
export async function saveAttendance(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let user;
  try {
    user = await requireTeacher();
  } catch {
    return { error: 'You do not have permission to mark attendance.' };
  }

  const courseId = String(formData.get('courseId') ?? '');
  const dateStr = String(formData.get('date') ?? '');
  if (!courseId || !dateStr) return { error: 'Choose a course and a date.' };

  try {
    await assertTeaches(user.id, courseId, user.role);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const date = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return { error: 'That date is not valid.' };
  if (date > new Date()) return { error: 'Attendance cannot be recorded for a future date.' };

  const enrollments = await db.enrollment.findMany({ where: { courseId }, select: { id: true } });

  let saved = 0;
  for (const e of enrollments) {
    const raw = String(formData.get(`status-${e.id}`) ?? 'PRESENT');
    const status =
      raw === 'ABSENT' ? AttendanceStatus.ABSENT : raw === 'LEAVE' ? AttendanceStatus.LEAVE : AttendanceStatus.PRESENT;

    await db.attendanceRecord.upsert({
      where: { enrollmentId_date: { enrollmentId: e.id, date } },
      create: { enrollmentId: e.id, date, status, markedById: user.id },
      update: { status, markedById: user.id },
    });
    saved++;
  }

  await logActivity(user.id, 'ATTENDANCE', 'Course', courseId, `${saved} students for ${dateStr}`);
  revalidatePath('/portal/teacher');
  revalidatePath('/portal/student');

  return { ok: `Attendance saved for ${saved} students on ${dateStr}.` };
}

/**
 * Saves sessional and mid-term marks and submits them for verification.
 * Marks stay invisible to students until an administrator verifies them.
 */
export async function submitMarks(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let user;
  try {
    user = await requireTeacher();
  } catch {
    return { error: 'You do not have permission to enter marks.' };
  }

  const courseId = String(formData.get('courseId') ?? '');
  if (!courseId) return { error: 'Choose a course.' };

  try {
    await assertTeaches(user.id, courseId, user.role);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const enrollments = await db.enrollment.findMany({ where: { courseId }, select: { id: true } });

  for (const e of enrollments) {
    const sessionalRaw = formData.get(`sessional-${e.id}`);
    const midtermRaw = formData.get(`midterm-${e.id}`);
    const sessional = sessionalRaw === null || sessionalRaw === '' ? null : Number(sessionalRaw);
    const midterm = midtermRaw === null || midtermRaw === '' ? null : Number(midtermRaw);

    if (sessional !== null && (Number.isNaN(sessional) || sessional < 0 || sessional > 25))
      return { error: 'Sessional marks must be between 0 and 25.' };
    if (midterm !== null && (Number.isNaN(midterm) || midterm < 0 || midterm > 25))
      return { error: 'Mid-term marks must be between 0 and 25.' };

    await db.mark.upsert({
      where: { enrollmentId: e.id },
      create: {
        enrollmentId: e.id,
        sessional,
        midterm,
        status: MarkStatus.SUBMITTED,
        submittedById: user.id,
      },
      update: {
        sessional,
        midterm,
        status: MarkStatus.SUBMITTED,
        submittedById: user.id,
        verifiedById: null,
      },
    });
  }

  await logActivity(user.id, 'SUBMIT_MARKS', 'Course', courseId, `${enrollments.length} records`);
  revalidatePath('/portal/teacher');
  revalidatePath('/portal/admin');

  return {
    ok: `Marks submitted for ${enrollments.length} students. They reach students once the examination office verifies them.`,
  };
}
