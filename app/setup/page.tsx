import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Crest from '@/components/Crest';
import { setupState } from '@/lib/setup';
import { storageBackend } from '@/lib/storage';
import SetupForm from './SetupForm';

export const metadata: Metadata = { title: 'Set up this site' };
export const dynamic = 'force-dynamic';

/**
 * The first screen a new copy of this project shows.
 *
 * It exists once. As soon as an account is created the wizard closes and this
 * page redirects to the sign-in screen, so it cannot be used to take over a
 * college's site afterwards.
 */
export default async function SetupPage() {
  const { open } = await setupState();
  if (!open) redirect('/portal/login');

  return (
    <main id="main" className="setup-page">
      <div className="setup-card">
        <header className="setup-head">
          <Crest id="crest-setup" className="" label="College crest" />
          <h1>Set up your college website</h1>
          <p className="text-muted">
            This copy of the site does not belong to anyone yet. Fill this in once and the whole
            website — its name, contact details, pages and portal — becomes your college’s.
          </p>
        </header>

        {storageBackend === 'disk' && (
          <div className="callout" style={{ marginBottom: '1.5rem' }}>
            <p className="mb-0" style={{ fontSize: '.9rem' }}>
              <strong>Hosting this on Vercel?</strong> Add Blob storage before you upload any
              photographs — the filesystem there is wiped on every deployment. Project →{' '}
              <strong>Storage</strong> → <strong>Create Database</strong> → <strong>Blob</strong>.
            </p>
          </div>
        )}

        <SetupForm year={new Date().getFullYear()} />

        <p className="form-note" style={{ marginTop: '2rem' }}>
          Everything here can be changed later from <strong>Admin → Website content</strong>. Nothing
          you enter now is permanent except the administrator account, which only you should hold.
        </p>
      </div>

      <p className="setup-foot">
        <Link href="/portal/login">Already set this up? Sign in</Link>
      </p>
    </main>
  );
}
