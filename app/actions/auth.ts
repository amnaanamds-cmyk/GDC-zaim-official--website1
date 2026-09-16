'use server';

import { redirect } from 'next/navigation';
import { login, logout, homeFor, logActivity, getSessionUser } from '@/lib/auth';

export type LoginState = { error?: string };

/** Form action for the portal login. */
export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const identifier = String(formData.get('identifier') ?? '');
  const password = String(formData.get('password') ?? '');

  const result = await login(identifier, password);
  if (!result.ok) return { error: result.error };

  redirect(homeFor(result.role));
}

export async function logoutAction() {
  const user = await getSessionUser();
  if (user) await logActivity(user.id, 'LOGOUT', 'Session', null, `${user.username} signed out`);
  await logout();
  redirect('/portal/login');
}
