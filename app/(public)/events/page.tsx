import Link from 'next/link';
import type { Metadata } from 'next';
import { Role } from '@prisma/client';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { fmtDate, fmtShort, dayOf, monthOf } from '@/lib/format';
import MediaUploader from '@/components/MediaUploader';
import EventMediaGallery, { type MediaItem } from '@/components/EventMediaGallery';

export const metadata: Metadata = {
  title: 'Events & Calendar',
  description: 'Seminars, workshops, competitions, sports and cultural events at Government Degree College Zaim.',
};
export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const user = await getSessionUser();
  const isAdmin = user?.role === Role.ADMIN;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [events, media] = await Promise.all([
    db.event.findMany({ orderBy: { date: 'asc' }, include: { _count: { select: { media: true, registrations: true } } } }),
    db.eventMedia.findMany({ orderBy: { createdAt: 'desc' }, include: { event: true } }),
  ]);

  const upcoming = events.filter((e) => e.date >= today);
  const past = events.filter((e) => e.date < today).reverse();

  const mediaItems: MediaItem[] = media.map((m) => ({
    id: m.id,
    kind: m.kind,
    title: m.title,
    description: m.description,
    filePath: m.filePath,
    posterPath: m.posterPath,
    mime: m.mime,
    size: m.size,
    duration: m.duration,
    eventTitle: m.event?.title ?? 'General college events',
  }));

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>Events</li>
            </ol>
          </nav>
          <h1>Events &amp; Academic Calendar</h1>
          <p>
            Seminars, workshops, competitions, sports and cultural activities organised across the campus
            during the academic year.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Coming up</span>
            <h2>Upcoming events</h2>
          </div>
          <div className="grid grid-2">
            {upcoming.map((e) => (
              <article className="card card--hover" id={e.slug} key={e.id}>
                <div className="cluster" style={{ marginBottom: '.9rem' }}>
                  <span className="notice-date">
                    <span className="d">{dayOf(e.date)}</span>
                    <span className="m">{monthOf(e.date)}</span>
                  </span>
                  <div>
                    <span className="badge badge-brand">{e.category}</span>{' '}
                    {e.registrationOpen && <span className="badge badge-success">Registration open</span>}
                  </div>
                </div>
                <h3>{e.title}</h3>
                <p>{e.summary}</p>
                <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '.4rem .8rem', fontSize: '.88rem', margin: '0 0 1rem' }}>
                  <dt className="text-muted">Date</dt>
                  <dd style={{ margin: 0 }}>{fmtDate(e.date)}</dd>
                  <dt className="text-muted">Time</dt>
                  <dd style={{ margin: 0 }}>{e.time}</dd>
                  <dt className="text-muted">Venue</dt>
                  <dd style={{ margin: 0 }}>{e.venue}</dd>
                </dl>
                {e._count.media > 0 && (
                  <a className="card-link" href="#media">
                    {e._count.media} photo{e._count.media === 1 ? '' : 's'} &amp; videos
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Event media ---------------- */}
      <section className="section section--alt" id="media">
        <div className="container">
          <div className="split" style={{ marginBottom: '1.5rem' }}>
            <div>
              <span className="eyebrow">Gallery</span>
              <h2 className="mb-0">Event photographs &amp; videos</h2>
            </div>

            {isAdmin ? (
              <MediaUploader events={events.map((e) => ({ id: e.id, title: e.title }))} />
            ) : (
              <p className="text-muted mb-0" style={{ fontSize: '.9rem' }}>
                Administrators can <Link href="/portal/login">sign in</Link> to upload event media.
              </p>
            )}
          </div>

          <EventMediaGallery items={mediaItems} canManage={isAdmin} />

          {isAdmin && (
            <p className="form-note" style={{ marginTop: '1.5rem' }}>
              Uploads are stored on the college server and are visible to every visitor immediately.
            </p>
          )}
        </div>
      </section>

      {past.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Archive</span>
              <h2>Past events</h2>
            </div>
            <div className="grid grid-3">
              {past.map((e) => (
                <article className="card" key={e.id}>
                  <span className="badge badge-accent">{fmtShort(e.date)}</span>
                  <h3 style={{ marginTop: '.75rem' }}>{e.title}</h3>
                  <p className="mb-0">{e.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section section--alt">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
            <div>
              <span className="eyebrow">Participation</span>
              <h2>Registering for an event</h2>
              <p>
                Registration for most events is open to all enrolled students and is handled by the organising
                department or society. Attendance at seminars and workshops is recorded against the
                student&rsquo;s co-curricular record, and participation certificates are issued afterwards.
              </p>
              <ul className="stack" style={{ paddingInlineStart: '1.2rem' }}>
                <li>Team events require the department&rsquo;s representative to submit the team list.</li>
                <li>Certificates are generated from the participant list and published in the student portal.</li>
              </ul>
            </div>
            <div className="card">
              <h3>Academic calendar</h3>
              <ul className="timeline">
                <li className="is-done">
                  <span className="t-stage">Fall semester classes begin</span>
                  <span className="t-date">01 October 2026</span>
                </li>
                <li className="is-current">
                  <span className="t-stage">Mid-term examinations</span>
                  <span className="t-date">06 – 17 October 2026</span>
                </li>
                <li>
                  <span className="t-stage">Annual Sports Week</span>
                  <span className="t-date">20 – 26 October 2026</span>
                </li>
                <li>
                  <span className="t-stage">Final examinations</span>
                  <span className="t-date">26 January – 10 February 2027</span>
                </li>
                <li>
                  <span className="t-stage">Result notification</span>
                  <span className="t-date">10 March 2027</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
