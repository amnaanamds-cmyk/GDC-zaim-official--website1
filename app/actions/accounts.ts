'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Prisma, Role } from '@prisma/client';
import { db } from '@/lib/db';
import {
  getSessionUser,
  hashPassword,
  verifyPassword,
  logActivity,
  revokeSessions,
  currentSessionId,
} from '@/lib/auth';
import { MIN_PASSWORD_LENGTH } from '@/lib/password';

/**
 * Accounts for the people who run the college.
 *
 * The setup wizard creates one administrator and nothing else. Everything
 * after that — the teachers who mark attendance, the students who read their
 * results, the library staff — is created here by that administrator, with
 * credentials they choose. No account in this system is ever created by
 * anyone but the college itself.
 *
 * Every action re-checks the caller's role on the server. The screen hides
 * these controls from everyone else, but this check is the one that decides.
 */

export type AccountState = { ok?: string; error?: string };

const DENIED: AccountState = {
  error: 'Only an administrator can manage accounts. Sign in as the administrator and try again.',
};

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== Role.ADMIN) throw new Error('Not permitted');
  return user;
}

const password = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Use a password of at least ${MIN_PASSWORD_LENGTH} characters.`)
  .max(200);

const createSchema = z.object({
  name: z.string().trim().min(3, 'Enter the person’s name.').max(120),
  username: z
    .string()
    .trim()
    .min(4, 'Choose a username of at least 4 characters.')
    .max(40)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Usernames may use letters, numbers, dots, hyphens and underscores only.'),
  email: z.string().trim().email('Enter a valid email address.').max(160),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT', 'LIBRARIAN']),
  password,

  /* A teacher or student account is only useful attached to a record. */
  linkId: z.string().trim().optional(),
  designation: z.string().trim().max(80).optional(),
  departmentId: z.string().trim().optional(),
  regNo: z.string().trim().max(60).optional(),
  programmeId: z.string().trim().optional(),
  semester: z.coerce.number().int().min(1).max(12).optional(),
});

/** Turns a duplicate-key failure into something the administrator can act on. */
function duplicateMessage(err: unknown): string | null {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    const target = String((err.meta as { target?: string[] } | undefined)?.target ?? '');
    if (target.includes('username')) return 'That username is already taken.';
    if (target.includes('email')) return 'That email address already has an account.';
    if (target.includes('regNo')) return 'That registration number already exists.';
    return 'Those details are already in use by another account.';
  }
  return null;
}

/**
 * Creates an account and, for a teacher or student, the record it works
 * through — or links it to one that already exists without a login.
 */
export async function createAccount(_prev: AccountState, formData: FormData): Promise<AccountState> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return DENIED;
  }

  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' };
  const d = parsed.data;
  const role = d.role as Role;

  // Validate the attachment before creating anything, so a rejected form never
  // leaves an account behind with nothing to do.
  if (role === Role.STUDENT && !d.linkId) {
    if (!d.regNo) return { error: 'Enter the student’s registration number.' };
    if (!d.programmeId) return { error: 'Choose the programme this student is enrolled on.' };
  }

  try {
    const user = await db.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: d.name,
          username: d.username,
          email: d.email,
          role,
          passwordHash: await hashPassword(d.password),
          // The administrator knows this password, so it is not yet a credential
          // only its holder has. They must replace it before using the portal.
          mustChangePassword: true,
        },
      });

      if (role === Role.TEACHER) {
        if (d.linkId) {
          await tx.faculty.update({ where: { id: d.linkId }, data: { userId: created.id } });
        } else {
          await tx.faculty.create({
            data: {
              name: d.name,
              email: d.email,
              designation: d.designation || 'Lecturer',
              qualification: '',
              specialization: '',
              departmentId: d.departmentId || null,
              userId: created.id,
            },
          });
        }
      }

      if (role === Role.STUDENT) {
        if (d.linkId) {
          await tx.student.update({ where: { id: d.linkId }, data: { userId: created.id } });
        } else {
          await tx.student.create({
            data: {
              regNo: d.regNo!,
              name: d.name,
              semester: d.semester ?? 1,
              programmeId: d.programmeId!,
              userId: created.id,
            },
          });
        }
      }

      return created;
    });

    await logActivity(admin.id, 'CREATE', 'Account', user.id, `${d.username} (${role})`);
    revalidatePath('/portal/admin/accounts');

    return {
      ok: `Created ${d.name}. Give them the username “${d.username}” and the password you chose — the portal will ask them to change it when they first sign in.`,
    };
  } catch (err) {
    const duplicate = duplicateMessage(err);
    if (duplicate) return { error: duplicate };
    console.error('Account creation failed:', err);
    return { error: 'The account could not be created.' };
  }
}

const resetSchema = z.object({
  userId: z.string().min(1),
  password,
});

/**
 * Sets a new password for somebody who has lost theirs. Their sessions end
 * immediately, and they must choose their own password on the way back in.
 */
export async function resetPassword(_prev: AccountState, formData: FormData): Promise<AccountState> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return DENIED;
  }

  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' };

  const target = await db.user.findUnique({ where: { id: parsed.data.userId } });
  if (!target) return { error: 'That account no longer exists — reload the page.' };

  await db.user.update({
    where: { id: target.id },
    data: {
      passwordHash: await hashPassword(parsed.data.password),
      mustChangePassword: true,
      failedLogins: 0,
      lockedUntil: null,
    },
  });
  await revokeSessions(target.id);

  await logActivity(admin.id, 'RESET', 'Account', target.id, target.username);
  revalidatePath('/portal/admin/accounts');

  return { ok: `Set a new password for ${target.name}. They will be asked to change it when they sign in.` };
}

/** Clears a lockout after too many failed attempts. */
export async function unlockAccount(userId: string): Promise<AccountState> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return DENIED;
  }

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) return { error: 'That account no longer exists — reload the page.' };

  await db.user.update({ where: { id: userId }, data: { failedLogins: 0, lockedUntil: null } });
  await logActivity(admin.id, 'UNLOCK', 'Account', userId, target.username);
  revalidatePath('/portal/admin/accounts');

  return { ok: `${target.name} can sign in again.` };
}

/**
 * Turns an account off or back on. Accounts are never deleted: a teacher who
 * has left still marked the attendance that is on record, and removing them
 * would take that history with it.
 */
export async function setAccountActive(userId: string, active: boolean): Promise<AccountState> {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return DENIED;
  }

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) return { error: 'That account no longer exists — reload the page.' };

  if (!active) {
    // Locking out the last administrator would leave the college unable to
    // reach its own portal, and the setup wizard is closed for good.
    const otherAdmins = await db.user.count({
      where: { role: Role.ADMIN, active: true, id: { not: userId } },
    });
    if (target.role === Role.ADMIN && otherAdmins === 0) {
      return {
        error:
          'This is the only active administrator. Create another administrator account first, or nobody will be able to administer the site.',
      };
    }
  }

  await db.user.update({ where: { id: userId }, data: { active } });
  if (!active) await revokeSessions(userId);

  await logActivity(admin.id, active ? 'ENABLE' : 'DISABLE', 'Account', userId, target.username);
  revalidatePath('/portal/admin/accounts');

  return { ok: active ? `${target.name} can sign in again.` : `${target.name} can no longer sign in.` };
}

/* ------------------------------------------------------------------ *
 * Everyone's own password
 * ------------------------------------------------------------------ */

const changeSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password.'),
  newPassword: password,
  confirmPassword: z.string(),
});

/**
 * Lets anyone signed in replace their own password. Requires the current one,
 * so a borrowed session cannot lock the real owner out of their account.
 */
export async function changeOwnPassword(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const session = await getSessionUser();
  if (!session) return { error: 'Sign in first.' };

  const parsed = changeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' };
  const d = parsed.data;

  if (d.newPassword !== d.confirmPassword) return { error: 'The two new passwords do not match.' };

  const user = await db.user.findUnique({ where: { id: session.id } });
  if (!user) return { error: 'Sign in again.' };

  if (!(await verifyPassword(d.currentPassword, user.passwordHash))) {
    return { error: 'That is not your current password.' };
  }
  if (await verifyPassword(d.newPassword, user.passwordHash)) {
    return { error: 'Choose a password different from your current one.' };
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(d.newPassword), mustChangePassword: false },
  });

  // Every other session was opened with the old password — end them, but keep
  // the one doing the changing so the person is not signed out mid-task.
  await revokeSessions(user.id, (await currentSessionId()) ?? undefined);

  await logActivity(user.id, 'PASSWORD', 'Account', user.id, user.username);
  revalidatePath('/portal/account');

  return { ok: 'Your password has been changed. Any other device signed in as you has been signed out.' };
}
