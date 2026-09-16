import Link from 'next/link';
import Crest from './Crest';
import Icon from './Icon';
import { SITE } from '@/lib/site';
import { getLocale, translator } from '@/lib/i18n';

const SOCIALS = [
  { label: 'Facebook', icon: 'facebook' as const },
  { label: 'X (Twitter)', icon: 'twitter' as const },
  { label: 'YouTube', icon: 'youtube' as const },
  { label: 'LinkedIn', icon: 'linkedin' as const },
];

export default async function SiteFooter() {
  const locale = await getLocale();
  const t = translator(locale);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link className="brand" href="/">
              <Crest id="crest-footer" />
              <span className="brand-text">
                <span className="brand-name">{t('site.short', SITE.shortName)}</span>
                <span className="brand-sub">Est. {SITE.established}</span>
              </span>
            </Link>
            <p style={{ marginTop: '1rem', fontSize: '.92rem', maxWidth: '34ch' }}>
              A government degree college committed to accessible, high-quality higher education for the
              students of Zaim and the surrounding districts.
            </p>
            <div className="social-row">
              {SOCIALS.map((s) => (
                <a href="#" key={s.label} aria-label={s.label}>
                  <Icon name={s.icon} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3>{t('footer.quickLinks', 'Quick Links')}</h3>
            <ul>
              <li><Link href="/admissions">Admissions 2026</Link></li>
              <li><Link href="/notices">Notice Board</Link></li>
              <li><Link href="/downloads">Prospectus &amp; Forms</Link></li>
              <li><Link href="/scholarships">Scholarships</Link></li>
              <li><Link href="/student-services">Certificates &amp; Requests</Link></li>
              <li><Link href="/contact#complaint">Complaints &amp; Feedback</Link></li>
            </ul>
          </div>

          <div>
            <h3>{t('footer.academics', 'Academics')}</h3>
            <ul>
              <li><Link href="/departments">Departments</Link></li>
              <li><Link href="/academics">Programmes &amp; Courses</Link></li>
              <li><Link href="/faculty">Faculty Directory</Link></li>
              <li><Link href="/academics#timetable">Class Timetable</Link></li>
              <li><Link href="/academics#examinations">Examinations &amp; Results</Link></li>
              <li><Link href="/library">Digital Library</Link></li>
            </ul>
          </div>

          <div>
            <h3>{t('footer.contact', 'Contact')}</h3>
            <ul className="footer-contact">
              <li>
                <Icon name="pin" />
                <span>
                  Main Campus Road, Zaim,
                  <br />
                  Khyber Pakhtunkhwa, Pakistan
                </span>
              </li>
              <li>
                <Icon name="phone" />
                <a href={`tel:${SITE.phone.replace(/\s/g, '')}`}>{SITE.phone}</a>
              </li>
              <li>
                <Icon name="mail" />
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
              <li>
                <Icon name="clock" />
                <span>{SITE.officeHours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} {SITE.name}. {t('footer.rights', 'All rights reserved.')}
          </p>
          <ul>
            <li><Link href="/sitemap">Sitemap</Link></li>
            <li><Link href="/accessibility">Accessibility</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/portal/login">Portal Login</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
