import { requireUser } from '@/lib/auth';

/**
 * Everything under this layout requires a session. The check runs on the
 * server for every request in the group, so a protected page cannot render
 * for a signed-out visitor even for a moment.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <>{children}</>;
}
