import Link from 'next/link';
import Crest from './Crest';
import Icon from './Icon';
import ThemeToggle from './ThemeToggle';
import { logoutAction } from '@/app/actions/auth';
import type { IconName } from '@/lib/icons';
import type { SessionUser } from '@/lib/auth';

export type PortalLink = { label: string; href: string; icon: IconName };

export default function PortalShell({
  user,
  title,
  subtitle,
  links,
  heading,
  children,
}: {
  user: SessionUser;
  title: string;
  subtitle: string;
  links: PortalLink[];
  heading: string;
  children: React.ReactNode;
}) {
  const initial = user.name.replace(/^(Prof\.|Dr\.|Mr\.|Ms\.)\s*/, '').charAt(0);

  return (
    <div className="portal-shell">
      <aside className="portal-side">
        <Link className="brand" href="/" style={{ color: '#fff' }}>
          <Crest id="crest-portal" />
          <span className="brand-text">
            <span className="brand-name">{title}</span>
            <span className="brand-sub">{subtitle}</span>
          </span>
        </Link>

        <nav aria-label="Portal navigation">
          <ul className="portal-nav">
            {links.map((l, i) => (
              <li key={l.href}>
                <Link href={l.href} className={i === 0 ? 'active' : undefined}>
                  <Icon name={l.icon} />
                  <span>{l.label}</span>
                </Link>
              </li>
            ))}
            <li style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,.12)', paddingTop: '1rem' }}>
              <form action={logoutAction}>
                <button type="submit" className="portal-signout">
                  <Icon name="logout" />
                  <span>Sign out</span>
                </button>
              </form>
            </li>
          </ul>
        </nav>
      </aside>

      <div className="portal-main">
        <div className="portal-topbar">
          <div>
            <h1>{heading}</h1>
            <p>
              {user.name} · {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
            </p>
          </div>
          <div className="cluster">
            <ThemeToggle />
            <Link className="btn btn-outline btn-sm" href="/">
              College website
            </Link>
            <span className="avatar">{initial}</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
