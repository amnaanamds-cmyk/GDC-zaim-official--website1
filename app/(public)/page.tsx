import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { publishedNotices, upcomingEvents, siteStats } from '@/lib/queries';
import { getLocale, translator } from '@/lib/i18n';
import { fmtShort, dayOf, monthOf } from '@/lib/format';
import { SITE } from '@/lib/site';
import Icon from '@/components/Icon';
import Reveal from '@/components/Reveal';
import CountUp from '@/components/CountUp';
import type { IconName } from '@/lib/icons';

export const dynamic = 'force-dynamic';

const QUICK_LINKS: { label: string; icon: IconName; href: string }[] = [
  { label: 'Admissions 2026', icon: 'clipboard', href: '/admissions' },
  { label: 'Examinations & Results', icon: 'chart', href: '/academics#examinations' },
  { label: 'Digital Library', icon: 'book', href: '/library' },
  { label: 'Prospectus & Forms', icon: 'download', href: '/downloads' },
  { label: 'Faculty Directory', icon: 'users', href: '/faculty' },
  { label: 'Scholarships', icon: 'shield', href: '/scholarships' },
  { label: 'Certificates & Requests', icon: 'file', href: '/student-services' },
  { label: 'Complaints & Feedback', icon: 'bell', href: '/contact#complaint' },
];

export default async function HomePage() {
  const locale = await getLocale();
  const t = translator(locale);

  const [notices, events, stats, departments, schedule, facilities, gallery] = await Promise.all([
    publishedNotices(5),
    upcomingEvents(3),
    siteStats(),
    db.department.findMany({ orderBy: { order: 'asc' }, take: 6 }),
    db.admissionStage.findMany({ orderBy: { order: 'asc' } }),
    db.facility.findMany({ orderBy: { order: 'asc' }, take: 6 }),
    db.galleryItem.findMany({ orderBy: { order: 'asc' }, take: 4 }),
  ]);

  const pinned = notices.find((n) => n.pinned);

  return (
    <>
      {pinned && (
        <div className="alert-strip">
          <div className="container">
            <span className="badge badge-danger">Notice</span>
            <p>
              <Link href={`/notices/${pinned.id}`} style={{ color: 'inherit' }}>
                {locale === 'ur' && pinned.titleUr ? pinned.titleUr : pinned.title}
              </Link>
            </p>
            <Link href="/notices" className="btn btn-sm btn-ghost" style={{ marginInlineStart: 'auto', flexShrink: 0 }}>
              View all
            </Link>
          </div>
        </div>
      )}

      {/* ---------------- Hero ---------------- */}
      <section className="hero hero--photo">
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">Government of Khyber Pakhtunkhwa · Higher Education Department</span>
              <h1>{t('home.hero.title', SITE.name)}</h1>
              <p className="lead">
                {t(
                  'home.hero.lead',
                  'Knowledge, character and service since 1998. BS programmes in Computer Science and Zoology, intermediate studies in Science, Arts and Computer Science, and a campus built around the students of this district.',
                )}
              </p>
              <div className="hero-actions">
                <Link className="btn btn-accent btn-lg" href="/admissions">
                  Admissions 2026
                </Link>
                <Link className="btn btn-on-dark btn-lg" href="/portal/login">
                  Student &amp; Faculty Portal
                </Link>
              </div>
              <p style={{ marginTop: '1.75rem', color: '#a9c4b8', fontSize: '.9rem' }}>
                Second merit list displayed · Enrolment closes 22 September 2026
              </p>
            </div>

            <aside className="hero-card" aria-labelledby="hero-notices-title">
              <h2 id="hero-notices-title">
                <Icon name="bell" />
                <span>{t('home.noticesTitle', 'Latest Notices')}</span>
              </h2>
              <ul>
                {notices.slice(0, 4).map((n) => (
                  <li key={n.id}>
                    <Link href={`/notices/${n.id}`}>
                      <span className="date">
                        {fmtShort(n.publishAt)} · {n.category}
                      </span>
                      {locale === 'ur' && n.titleUr ? n.titleUr : n.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link className="btn btn-on-dark btn-sm btn-block" href="/notices" style={{ marginTop: '1rem' }}>
                {t('common.viewAll', 'View all notices')}
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* ---------------- Quick links ---------------- */}
      <section className="section section--tight">
        <div className="container">
          <h2 className="visually-hidden">{t('common.quickLinks', 'Quick Links')}</h2>
          <div className="grid grid-4">
            {QUICK_LINKS.map((l) => (
              <Reveal as="a" key={l.href + l.label} className="quicklink" {...{ href: l.href }}>
                <Icon name={l.icon} />
                <span>{l.label}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Statistics ---------------- */}
      <section className="stat-band">
        <div className="container">
          <div className="grid grid-4" style={{ gap: 0 }}>
            {stats.map((s) => (
              <div className="stat" key={s.label}>
                <span className="stat-value">
                  <CountUp to={s.value} />
                  {s.suffix}
                </span>
                <span className="stat-label">{locale === 'ur' ? s.labelUr : s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Principal ---------------- */}
      <section className="section">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: 'minmax(240px,320px) 1fr', alignItems: 'start' }}>
            <Reveal>
              <div
                className="ph ph-a"
                style={{ aspectRatio: '4/5', borderRadius: 'var(--radius-lg)', display: 'grid', placeItems: 'center', color: '#fff' }}
              >
                <Icon name="user" className="principal-silhouette" />
              </div>
              <div style={{ marginTop: '1rem' }}>
                <strong style={{ display: 'block', fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>
                  {SITE.principal.name}
                </strong>
                <span className="text-muted" style={{ fontSize: '.9rem' }}>
                  {SITE.principal.designation} · Ph.D. Education
                </span>
              </div>
            </Reveal>
            <Reveal>
              <span className="eyebrow">{t('home.principalTitle', "Principal's Message")}</span>
              <h2>A college that opens doors</h2>
              <p>
                Government Degree College Zaim has served this region for more than two decades, opening the
                doors of higher education to students who might otherwise have been left behind. Our purpose is
                simple: to combine academic rigour with character, so that every graduate leaves here able to
                think independently and serve honourably.
              </p>
              <p>
                This portal is part of that commitment — it puts admissions, attendance, results, library
                services and official notices in one transparent place, accessible to students, parents and
                faculty alike.
              </p>
              <Link className="card-link" href="/about#principal">
                Read the full message <Icon name="arrow" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Notices & events ---------------- */}
      <section className="section section--alt">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1.45fr 1fr' }}>
            <div>
              <div className="split" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <span className="eyebrow">Notice Board</span>
                  <h2 className="mb-0">{t('home.noticesTitle', 'Latest Announcements')}</h2>
                </div>
                <Link className="btn btn-outline btn-sm" href="/notices">
                  {t('common.viewAll', 'View all')}
                </Link>
              </div>
              <ul className="notice-list">
                {notices.map((n) => (
                  <Reveal as="li" className="notice-item" key={n.id}>
                    <span className="notice-date">
                      <span className="d">{dayOf(n.publishAt)}</span>
                      <span className="m">{monthOf(n.publishAt)}</span>
                    </span>
                    <div className="notice-body">
                      <h3>
                        <Link href={`/notices/${n.id}`}>
                          {locale === 'ur' && n.titleUr ? n.titleUr : n.title}
                        </Link>
                      </h3>
                      <p>{n.body.slice(0, 135)}…</p>
                      <div className="notice-meta">
                        <span className="badge badge-brand">{n.category}</span>
                        {n.pinned && <span className="badge badge-accent">Important</span>}
                        {n.department && <span className="badge">{n.department.name}</span>}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </ul>
            </div>

            <div>
              <div className="split" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <span className="eyebrow">Calendar</span>
                  <h2 className="mb-0">{t('home.eventsTitle', 'Upcoming Events')}</h2>
                </div>
              </div>
              <div className="stack">
                {events.map((e) => (
                  <Reveal as="article" className="card card--hover" key={e.id} style={{ padding: '1.1rem' }}>
                    <div className="cluster" style={{ gap: '.5rem', marginBottom: '.5rem' }}>
                      <span className="badge badge-accent">{fmtShort(e.date)}</span>
                      <span className="badge">{e.category}</span>
                      {e._count.media > 0 && <span className="badge badge-success">{e._count.media} media</span>}
                    </div>
                    <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-sans)' }}>{e.title}</h3>
                    <p style={{ fontSize: '.88rem', marginBottom: 0 }}>
                      {e.venue} · {e.time}
                    </p>
                  </Reveal>
                ))}
              </div>
              <Link className="btn btn-outline btn-sm btn-block" href="/events" style={{ marginTop: '1.25rem' }}>
                Full event calendar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Departments ---------------- */}
      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">Academics</span>
            <h2>{t('home.deptTitle', 'Our Departments')}</h2>
            <p>
              Two departments deliver four-year BS programmes in Computer Science and Zoology, alongside FSc,
              FA and ICS at intermediate level, supported by dedicated laboratories and a central library.
            </p>
          </div>
          <div className="grid grid-3">
            {departments.map((d) => (
              <Reveal as="article" className="card card--hover" key={d.id}>
                <span className="card-icon">
                  <Icon name={d.icon as IconName} />
                </span>
                <h3>{locale === 'ur' ? d.nameUr : d.name}</h3>
                <p>{d.intro.slice(0, 118)}…</p>
                <Link className="card-link" href={`/departments/${d.slug}`}>
                  Visit department <Icon name="arrow" />
                </Link>
              </Reveal>
            ))}
          </div>
          <p className="text-center" style={{ marginTop: '2rem' }}>
            <Link className="btn btn-primary" href="/departments">
              Explore all departments
            </Link>
          </p>
        </div>
      </section>

      {/* ---------------- Admissions ---------------- */}
      <section className="section section--brand">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1.3fr 1fr', alignItems: 'center' }}>
            <div>
              <span className="eyebrow">{t('home.admissionsTitle', 'Admissions Open')}</span>
              <h2>Applications for the 2026 session</h2>
              <p style={{ color: '#cfe0d8', maxWidth: '58ch' }}>
                Admission to all BS four-year programmes, ICS and I.Com is open. Apply online, upload your
                documents and track your application through every stage.
              </p>
              <div className="cluster" style={{ marginTop: '1.5rem' }}>
                <Link className="btn btn-accent" href="/admissions">
                  Admission details
                </Link>
                <Link className="btn btn-on-dark" href="/downloads">
                  Download prospectus
                </Link>
              </div>
            </div>
            <div className="hero-card">
              <h2 style={{ fontSize: '1.05rem' }}>Admission schedule</h2>
              <ul className="timeline" style={{ ['--line' as string]: 'rgba(255,255,255,.25)' }}>
                {schedule.map((s) => (
                  <li className={`is-${s.status}`} key={s.id}>
                    <span className="t-stage" style={{ color: '#fff' }}>
                      {s.stage}
                    </span>
                    <span className="t-date" style={{ color: '#a9c4b8' }}>
                      {s.dates}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Gallery ---------------- */}
      <section className="section">
        <div className="container">
          <div className="split" style={{ marginBottom: '1.5rem' }}>
            <div>
              <span className="eyebrow">Campus</span>
              <h2 className="mb-0">Life at GDC Zaim</h2>
            </div>
            <Link className="btn btn-outline btn-sm" href="/gallery">
              Open gallery
            </Link>
          </div>
          <div className="gallery-grid">
            {gallery.map((g) => (
              <figure className="gallery-item" key={g.id} style={{ cursor: 'default' }}>
                {g.imagePath ? (
                  <Image src={g.imagePath} alt={g.alt ?? g.title} fill sizes="(max-width: 700px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
                ) : (
                  <span className={`ph ph-${g.tone}`} />
                )}
                <figcaption>{g.title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Facilities & contact ---------------- */}
      <section className="section section--alt">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <span className="eyebrow">Facilities</span>
              <h2>Everything a campus needs</h2>
              <p className="text-muted">
                From science laboratories and a 28,000-volume library to hostel accommodation, transport and
                sports facilities.
              </p>
              <div className="grid grid-2" style={{ gap: '.75rem' }}>
                {facilities.map((f) => (
                  <div className="cluster" key={f.id} style={{ gap: '.6rem', fontSize: '.9rem', fontWeight: 600 }}>
                    <span style={{ color: 'var(--brand)', display: 'inline-flex', width: 20, height: 20 }}>
                      <Icon name={f.icon as IconName} />
                    </span>
                    {f.name}
                  </div>
                ))}
              </div>
              <Link className="btn btn-outline btn-sm" href="/facilities" style={{ marginTop: '1.25rem' }}>
                All facilities
              </Link>
            </div>
            <div className="card">
              <h3>Get in touch</h3>
              <p>
                Have a question about admissions, results or certificates? Reach the relevant office directly, or
                submit a request through the complaints and feedback system.
              </p>
              <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '.6rem 1rem', fontSize: '.93rem', margin: '0 0 1.5rem' }}>
                <dt style={{ fontWeight: 650 }}>Admissions</dt>
                <dd style={{ margin: 0 }}>
                  <a href={`tel:${SITE.admissionsPhone.replace(/\s/g, '')}`}>{SITE.admissionsPhone}</a>
                </dd>
                <dt style={{ fontWeight: 650 }}>Examinations</dt>
                <dd style={{ margin: 0 }}>
                  <a href="mailto:exams@gdczaim.edu.pk">exams@gdczaim.edu.pk</a>
                </dd>
                <dt style={{ fontWeight: 650 }}>Office hours</dt>
                <dd style={{ margin: 0 }}>{SITE.officeHours}</dd>
              </dl>
              <div className="cluster">
                <Link className="btn btn-primary btn-sm" href="/contact">
                  Contact page
                </Link>
                <Link className="btn btn-outline btn-sm" href="/contact#complaint">
                  Submit a complaint
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
