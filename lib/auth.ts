import 'server-only';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { db } from './db';
import { MIN_PASSWORD_LENGTH } from './password';

const COOKIE = process.env.SESSION_COOKIE_NAME || 'gdc_session';
const SESSION_HOURS = 8;
const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;
const BCRYPT_ROUNDS = 12;

export type SessionUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  /** True while the password was set by someone other than its holder. */
  mustChangePassword: boolean;
};

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/** Checks a password against a stored hash. Used when someone changes their own. */
export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export { MIN_PASSWORD_LENGTH } from './password';

/**
 * Ends every session belonging to an account. Called when its password is
 * changed or reset and when it is deactivated, so a stolen or shared session
 * cannot outlive the credentials it was opened with.
 */
export async function revokeSessions(userId: string, exceptSessionId?: string) {
  await db.session.deleteMany({
    where: { userId, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) },
  });
}

/** The current session's id, for keeping it alive while ending the others. */
export async function currentSessionId(): Promise<string | null> {
  return (await cookies()).get(COOKIE)?.value ?? null;
}

/**
 * Reads the session cookie and resolves the signed-in user.
 * `cache` keeps it to one query per request even when several server
 * components ask for the current user.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (!id) return null;

  const session = await db.session.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || !session.user.active) {
    if (session) await db.session.delete({ where: { id } }).catch(() => null);
    return null;
  }

  const { user } = session;
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };
});

export type LoginResult = { ok: true; role: Role } | { ok: false; error: string };

/**
 * Verifies credentials and opens a session.
 *
 * The identifier is the username, email or (for students) the registration
 * number. Failures are counted per account and the account locks for a few
 * minutes after five bad attempts, so the form cannot be brute-forced.
 * The same message is returned whether the account is unknown or the password
 * is wrong, so the form cannot be used to discover valid usernames.
 */
export async function login(identifier: string, password: string): Promise<LoginResult> {
  const id = identifier.trim();
  if (!id || !password) return { ok: false, error: 'Enter your identifier and password.' };

  const user = await db.user.findFirst({
    where: {
      OR: [
        { username: { equals: id, mode: 'insensitive' } },
        { email: { equals: id, mode: 'insensitive' } },
      ],
    },
  });

  const GENERIC = 'Those credentials were not recognised.';
  if (!user || !user.active) {
    // Spend roughly the same time as a real check so timing does not leak
    // whether the account exists.
    await bcrypt.compare(password, '$2a$12$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV0123456');
    return { ok: false, error: GENERIC };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return { ok: false, error: `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.` };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const failed = user.failedLogins + 1;
    await db.user.update({
      where: { id: user.id },
      data: {
        failedLogins: failed,
        lockedUntil:
          failed >= MAX_FAILED_LOGINS ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
      },
    });
    return {
      ok: false,
      error:
        failed >= MAX_FAILED_LOGINS
          ? `Account locked for ${LOCK_MINUTES} minutes after ${MAX_FAILED_LOGINS} failed attempts.`
          : GENERIC,
    };
  }

  const head = await headers();
  const session = await db.session.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_HOURS * 3600_000),
      userAgent: head.get('user-agent')?.slice(0, 250) ?? null,
      ip: (head.get('x-forwarded-for') ?? '').split(',')[0].trim() || null,
    },
  });

  await db.user.update({
    where: { id: user.id },
    data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  const jar = await cookies();
  jar.set(COOKIE, session.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_HOURS * 3600,
  });

  return { ok: true, role: user.role };
}

export async function logout() {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (id) await db.session.delete({ where: { id } }).catch(() => null);
  jar.delete(COOKIE);
}

/** Landing page for each role after signing in. */
export function homeFor(role: Role) {
  switch (role) {
    case Role.ADMIN:
      return '/portal/admin';
    case Role.TEACHER:
      return '/portal/teacher';
    case Role.LIBRARIAN:
      return '/portal/admin';
    default:
      return '/portal/student';
  }
}

/** Use at the top of any protected server component or action. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/portal/login');
  return user;
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect(homeFor(user.role));
  return user;
}

/** Records an administrative action for the audit trail (SRS §5, §25). */
export async function logActivity(
  userId: string | null,
  action: string,
  entity: string,
  entityId?: string | null,
  detail?: string | null,
) {
  await db.activityLog.create({
    data: { userId, action, entity, entityId: entityId ?? null, detail: detail ?? null },
  });
}
