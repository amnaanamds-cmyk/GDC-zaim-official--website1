import { redirect } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { setupState } from '@/lib/setup';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // A copy of this project that no college has claimed yet has nothing to
  // show a visitor — send whoever arrives to the wizard instead of rendering
  // a website with no name on it.
  const { configured } = await setupState();
  if (!configured) redirect('/setup');

  return (
    <>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
