import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Crest from '@/components/Crest';
import { getSessionUser, homeFor } from '@/lib/auth';
import { SITE } from '@/lib/site';
import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Portal Login' };
export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(homeFor(user.role));

  return (
    <main id="main" className="login-page">
      <div className="login-card">
        <div className="text-center" style={{ marginBottom: '1.5rem' }}>
          <Crest id="crest-login" className="" />
          <h1 style={{ fontSize: '1.4rem', margin: '.9rem 0 .25rem' }}>Portal Login</h1>
          <p className="text-muted" style={{ fontSize: '.9rem', margin: 0 }}>
            {SITE.name}
          </p>
        </div>

        <LoginForm />

        <p className="text-center" style={{ margin: '1.5rem 0 0', fontSize: '.88rem' }}>
          <Link href="/">← Back to the college website</Link>
        </p>
      </div>
    </main>
  );
}
