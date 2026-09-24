import type { Metadata } from 'next';
import { Role } from '@prisma/client';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { site } from '@/lib/site';
import { adminNav } from '@/lib/admin-nav';
import { RESOURCES } from '@/lib/resources';
import PortalShell from '@/components/PortalShell';
import RecordManager, { type Row } from '@/components/admin/RecordManager';

export const metadata: Metadata = { title: 'Campus & content' };
export const dynamic = 'force-dynamic';

/**
 * Everything on the public site that is a list of things: events, facilities,
 * the admission schedule, scholarships, the library catalogue, alumni and
 * career opportunities.
 */
export default async function CampusAdminPage() {
  const user = await requireRole(Role.ADMIN);
  const inst = await site();

  const [events, facilities, stages, scholarships, books, alumni, careers] = await Promise.all([
    db.event.findMany({ orderBy: { date: 'desc' } }),
    db.facility.findMany({ orderBy: { order: 'asc' } }),
    db.admissionStage.findMany({ orderBy: { order: 'asc' } }),
    db.scholarship.findMany({ orderBy: { name: 'asc' } }),
    db.book.findMany({ orderBy: { title: 'asc' } }),
    db.alumnus.findMany({ orderBy: { order: 'asc' } }),
    db.careerOpportunity.findMany({ orderBy: { title: 'asc' } }),
  ]);

  return (
    <PortalShell
      user={user}
      title="Admin Panel"
      subtitle={inst.shortName}
      links={adminNav('/portal/admin/campus')}
      heading="Campus & content"
    >
      <p className="lead" style={{ marginTop: 0 }}>
        The lists behind the public pages of {inst.shortName}. Everything saved here appears on the
        website immediately.
      </p>

      <RecordManager spec={RESOURCES.event} rows={events as unknown as Row[]} />
      <RecordManager spec={RESOURCES.admissionStage} rows={stages as unknown as Row[]} />
      <RecordManager spec={RESOURCES.facility} rows={facilities as unknown as Row[]} />
      <RecordManager spec={RESOURCES.scholarship} rows={scholarships as unknown as Row[]} />
      <RecordManager spec={RESOURCES.book} rows={books as unknown as Row[]} />
      <RecordManager spec={RESOURCES.alumnus} rows={alumni as unknown as Row[]} />
      <RecordManager spec={RESOURCES.career} rows={careers as unknown as Row[]} />
    </PortalShell>
  );
}
