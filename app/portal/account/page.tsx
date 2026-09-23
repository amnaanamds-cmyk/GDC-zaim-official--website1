import Link from 'next/link';
import type { Metadata } from 'next';
import { requireUser, homeFor } from '@/lib/auth';
import { site } from '@/lib/site';
import Crest from '@/components/Crest';
import PasswordForm from './PasswordForm';

export const metadata: Metadata = { title: 'Your password' };
export const dynamic = 'force-dynamic';

/**
 * Where anyone signed in changes their own password.
 *
 * Deliberately outside the (dash) route group: that layout sends people here
 * when an administrator set their password, so this page has to stay
 * reachable or the redirect would point at itself.
 */
export default async function AccountPage() {
  const user = await requireUser();
  const inst = await site();
  const forced = user.mustChangePassword;

  return (
    <main id="main" className="login-page">
      <div className="login-card">
        <div className="text-center" style={{ marginBottom: '1.5rem' }}>
          <Crest id="crest-account" className="" label={`${inst.shortName} crest`} src={inst.crestPath} />
          <h1 style={{ fontSize: '1.4rem', margin: '.9rem 0 .25rem' }}>
            {forced ? 'Choose your password' : 'Change your password'}
          </h1>
          <p className="text-muted" style={{ fontSize: '.9rem', margin: 0 }}>
            {user.name} · {user.username}
          </p>
        </div>

        {forced && (
          <div className="callout" style={{ marginBottom: '1.25rem' }}>
            <p className="mb-0" style={{ fontSize: '.9rem' }}>
              Your password was set for you when this account was created. Choose one only you know
              before going on to the portal.
            </p>
          </div>
        )}

        <PasswordForm forced={forced} home={homeFor(user.role)} />

        {!forced && (
          <p className="text-center" style={{ margin: '1.5rem 0 0', fontSize: '.88rem' }}>
            <Link href={homeFor(user.role)}>← Back to the portal</Link>
          </p>
        )}
      </div>
    </main>
  );
}
