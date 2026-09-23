import type { Metadata } from 'next';
import { site } from '@/lib/site';
import Link from 'next/link';
import { db } from '@/lib/db';
import PageHero from '@/components/PageHero';
import EventMediaGallery, { type MediaItem } from '@/components/EventMediaGallery';
import { getSessionUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function generateMetadata(): Promise<Metadata> {
  const inst = await site();
  return {
    title: 'Gallery',
    description: `Photographs of campus life, academic activities, events and sports at ${inst.name}.`,
  };
}
export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const inst = await site();
  const user = await getSessionUser();
  const [items, media] = await Promise.all([
    db.galleryItem.findMany({ orderBy: { order: 'asc' } }),
    db.eventMedia.findMany({ orderBy: { createdAt: 'desc' }, include: { event: true } }),
  ]);

  const uploaded: MediaItem[] = media.map((m) => ({
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
      <PageHero
        title="Photo Gallery"
        lead={`Campus life, academic activities, events and sports at ${inst.name}.`}
        crumbs={[{ label: 'Gallery' }]}
      />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Campus</span>
            <h2>Around the college</h2>
          </div>
          <div className="gallery-grid">
            {items.map((g) => (
              <figure className="gallery-item" key={g.id} style={{ cursor: 'default' }}>
                {g.imagePath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.imagePath} alt={g.alt ?? g.title} loading="lazy" />
                ) : (
                  <span className={`ph ph-${g.tone}`} />
                )}
                <figcaption>
                  {g.title}
                  <br />
                  <span style={{ fontWeight: 400, opacity: 0.85 }}>{g.category}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="form-note" style={{ marginTop: '1.5rem' }}>
            Tiles without a photograph are placeholders awaiting official images.
          </p>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="split" style={{ marginBottom: '1.5rem' }}>
            <div>
              <span className="eyebrow">Events</span>
              <h2 className="mb-0">Event photographs &amp; videos</h2>
            </div>
            <Link className="btn btn-outline btn-sm" href="/events#media">
              Manage on the events page
            </Link>
          </div>
          <EventMediaGallery items={uploaded} canManage={user?.role === Role.ADMIN} />
        </div>
      </section>
    </>
  );
}
