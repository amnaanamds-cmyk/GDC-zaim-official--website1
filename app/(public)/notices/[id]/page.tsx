import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { fmtDate } from '@/lib/format';
import PageHero from '@/components/PageHero';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const notice = await db.notice.findUnique({ where: { id } });
  return notice
    ? { title: notice.title, description: notice.body.slice(0, 160) }
    : { title: 'Notice not found' };
}

export default async function NoticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notice = await db.notice.findUnique({ where: { id }, include: { department: true, author: true } });
  if (!notice) notFound();

  const related = await db.notice.findMany({
    where: { category: notice.category, id: { not: notice.id } },
    orderBy: { publishAt: 'desc' },
    take: 4,
  });

  return (
    <>
      <PageHero title={notice.title} crumbs={[{ label: 'Notices', href: '/notices' }, { label: notice.category }]} />

      <section className="section">
        <div className="container-narrow">
          <div className="cluster" style={{ marginBottom: '1.5rem' }}>
            <span className="badge badge-brand">{notice.category}</span>
            {notice.department && <span className="badge">{notice.department.name}</span>}
            {notice.pinned && <span className="badge badge-accent">Important</span>}
            <span className="text-muted" style={{ fontSize: '.88rem' }}>
              Issued {fmtDate(notice.publishAt)}
              {notice.author ? ` · ${notice.author.name}` : ''}
            </span>
          </div>

          {notice.body.split('\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}

          {notice.expiresAt && (
            <p className="form-note">This notice is archived after {fmtDate(notice.expiresAt)}.</p>
          )}

          <div className="cluster" style={{ marginTop: '2rem' }}>
            {notice.fileUrl && (
              <a className="btn btn-primary btn-sm" href={notice.fileUrl} download>
                Download {notice.fileName ?? 'attachment'}
              </a>
            )}
            <Link className="btn btn-outline btn-sm" href="/notices">
              Back to all notices
            </Link>
          </div>

          {related.length > 0 && (
            <>
              <h2 style={{ marginTop: '3rem' }}>Other {notice.category.toLowerCase()} notices</h2>
              <ul className="stack" style={{ listStyle: 'none', padding: 0 }}>
                {related.map((r) => (
                  <li key={r.id}>
                    <Link href={`/notices/${r.id}`}>{r.title}</Link>
                    <span className="text-muted" style={{ fontSize: '.85rem' }}>
                      {' '}
                      — {fmtDate(r.publishAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </>
  );
}
