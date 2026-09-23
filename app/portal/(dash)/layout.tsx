import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';

/**
 * Everything under this layout requires a session. The check runs on the
 * server for every request in the group, so a protected page cannot render
 * for a signed-out visitor even for a moment.
 *
 * It also holds back anyone whose password was set by an administrator: until
 * they have chosen one of their own, the only page they can reach is the one
 * that lets them. /portal/account sits outside this group so it stays
 * reachable — otherwise the redirect would point at itself.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (user.mustChangePassword) redirect('/portal/account');
  return <>{children}</>;
}
