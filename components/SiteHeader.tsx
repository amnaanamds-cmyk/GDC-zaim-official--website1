import Link from 'next/link';
import Crest from './Crest';
import MainNav from './MainNav';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import Icon from './Icon';
import { NAV } from '@/lib/nav';
import { site, localised } from '@/lib/site';
import { getLocale, translator } from '@/lib/i18n';

export default async function SiteHeader() {
  const locale = await getLocale();
  const t = translator(locale);
  const inst = await site();
  const L = localised(inst, locale);

  // Navigation labels are resolved on the server and handed to the client
  // component, so the menu is translated even before hydration.
  const labels: Record<string, string> = {};
  for (const item of NAV) {
    labels[item.key] = t(item.key, item.label);
    for (const child of item.children ?? []) labels[child.key] = t(child.key, child.label);
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <div className="topbar">
        <div className="container">
          <div className="topbar-meta">
            <span>{inst.affiliation}</span>
            <span className="dot" aria-hidden="true">
              •
            </span>
            <a href={`tel:${inst.phone.replace(/\s/g, '')}`}>{inst.phone}</a>
            <span className="dot" aria-hidden="true">
              •
            </span>
            <a href={`mailto:${inst.email}`}>{inst.email}</a>
          </div>
          <div className="topbar-tools">
            <Link href="/downloads" className="desktop-only">
              Downloads
            </Link>
            <Link href="/student-services" className="desktop-only">
              Student Services
            </Link>
            <LanguageToggle locale={locale} />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container">
          <Link className="brand" href="/">
            <Crest id="crest-header" label={`${inst.shortName} crest`} src={inst.crestPath} />
            <span className="brand-text">
              <span className="brand-name">{L.name}</span>
              <span className="brand-sub">{L.department}</span>
            </span>
          </Link>

          <MainNav t={labels} />

          <div className="header-actions">
            <Link className="icon-btn" href="/search" aria-label="Search the website" title="Search">
              <Icon name="search" />
            </Link>
            <Link className="btn btn-primary btn-sm desktop-only" href="/portal/login">
              {t('nav.portal', 'Portal Login')}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
