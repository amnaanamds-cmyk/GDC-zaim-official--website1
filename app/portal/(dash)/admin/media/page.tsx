import type { Metadata } from 'next';
import { Role } from '@prisma/client';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { fmtBytes } from '@/lib/format';
import PortalShell, { type PortalLink } from '@/components/PortalShell';
import MediaUploader from '@/components/MediaUploader';
import EventMediaGallery, { type MediaItem } from '@/components/EventMediaGallery';

export const metadata: Metadata = { title: 'Event Media' };
export const dynamic = 'force-dynamic';

const LINKS: PortalLink[] = [
  { label: 'Event media', href: '/portal/admin/media', icon: 'mic' },
  { label: 'Dashboard', href: '/portal/admin', icon: 'grid' },
  { label: 'Notices', href: '/portal/admin#notices', icon: 'bell' },
  { label: 'Results verification', href: '/portal/admin#results', icon: 'chart' },
];

export default async function AdminMediaPage() {
  const user = await requireRole(Role.ADMIN);

  const [events, media] = await Promise.all([
    db.event.findMany({ orderBy: { date: 'asc' } }),
    db.eventMedia.findMany({ orderBy: { createdAt: 'desc' }, include: { event: true, uploadedBy: true } }),
  ]);

  const items: MediaItem[] = media.map((m) => ({
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

  const totalBytes = media.reduce((s, m) => s + m.size, 0);
  const videos = media.filter((m) => m.kind === 'VIDEO').length;

  return (
    <PortalShell user={user} title="Admin Panel" subtitle="GDC Zaim" links={LINKS} heading="Event Media">
      <div className="kpi-grid">
        <div className="kpi">
          <span className="k-label">Items published</span>
          <span className="k-value">{media.length}</span>
          <span className="k-trend text-muted">
            {media.length - videos} photo{media.length - videos === 1 ? '' : 's'}, {videos} video
            {videos === 1 ? '' : 's'}
          </span>
        </div>
        <div className="kpi">
          <span className="k-label">Storage used</span>
          <span className="k-value">{fmtBytes(totalBytes)}</span>
          <span className="k-trend text-muted">On the college server</span>
        </div>
        <div className="kpi">
          <span className="k-label">Events covered</span>
          <span className="k-value">{new Set(media.map((m) => m.eventId ?? 'general')).size}</span>
          <span className="k-trend text-muted">of {events.length} events</span>
        </div>
      </div>

      <section className="panel">
        <div className="split" style={{ marginBottom: '1.25rem' }}>
          <h2 className="mb-0">Photographs &amp; videos</h2>
          <MediaUploader events={events.map((e) => ({ id: e.id, title: e.title }))} />
        </div>

        <EventMediaGallery items={items} canManage />

        <p className="form-note" style={{ marginTop: '1.5rem' }}>
          Files are stored under <code>public/uploads</code> on the server and appear on the public
          <a href="/events#media"> events page</a> immediately. Deleting an item removes the file from disk.
        </p>
      </section>
    </PortalShell>
  );
}
