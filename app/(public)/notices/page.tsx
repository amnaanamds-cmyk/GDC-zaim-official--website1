import Link from 'next/link';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { publishedNotices } from '@/lib/queries';
import { fmtDate, dayOf, monthOf } from '@/lib/format';
import PageHero from '@/components/PageHero';
import Icon from '@/components/Icon';

export const metadata: Metadata = {
  title: 'Notices & Announcements',
  description: 'Official notices from the college administration, examination office and departments.',
};
export const dynamic = 'force-dynamic';

const CATEGORIES = ['Admission', 'Examination', 'Academic', 'Scholarship', 'Holiday', 'Emergency', 'General'];

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; department?: string; q?: string }>;
}) {
  const { category, department, q } = await searchParams;

  const where: Record<string, unknown> = {};
  if (category && CATEGORIES.includes(category)) where.category = category;
  if (department) where.departmentId = department;
  if (q && q.trim().length > 1) {
    where.OR = [
      { title: { contains: q.trim(), mode: 'insensitive' } },
      { body: { contains: q.trim(), mode: 'insensitive' } },
    ];
  }

  const [notices, departments, counts] = await Promise.all([
    publishedNotices(undefined, where),
    db.department.findMany({ orderBy: { order: 'asc' } }),
    db.notice.groupBy({ by: ['category'], _count: true }),
  ]);

  const query = (next: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { category, department, q, ...next };
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
    const s = sp.toString();
    return s ? `/notices?${s}` : '/notices';
  };

  return (
    <>
      <PageHero
        title="Notices & Announcements"
        lead="Official notices issued by the college administration, examination office and departments. Filter by category or department, or search the archive."
        crumbs={[{ label: 'Notices' }]}
      />

      <section className="section">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1fr 320px', gap: '2.5rem', alignItems: 'start' }}>
            <div>
              <form className="search-field" style={{ marginBottom: '1.25rem' }} action="/notices" method="get">
                <Icon name="search" />
                <label className="visually-hidden" htmlFor="q">
                  Search notices
                </label>
                <input type="search" id="q" name="q" defaultValue={q ?? ''} placeholder="Search notices…" />
                {category && <input type="hidden" name="category" value={category} />}
                {department && <input type="hidden" name="department" value={department} />}
              </form>

              <div className="cluster" style={{ marginBottom: '1.5rem' }} role="group" aria-label="Filter by category">
                <Link className="chip" href={query({ category: undefined })} aria-pressed={!category}>
                  All
                </Link>
                {CATEGORIES.map((c) => (
                  <Link key={c} className="chip" href={query({ category: c })} aria-pressed={category === c}>
                    {c}
                  </Link>
                ))}
              </div>

              <p className="text-muted" style={{ marginBottom: '1rem' }}>
                {notices.length} notice{notices.length === 1 ? '' : 's'}
              </p>

              {notices.length === 0 ? (
                <div className="empty-state">
                  <Icon name="bell" />
                  <p>No notice matches these filters.</p>
                </div>
              ) : (
                <ul className="notice-list">
                  {notices.map((n) => (
                    <li className="notice-item" key={n.id}>
                      <span className="notice-date">
                        <span className="d">{dayOf(n.publishAt)}</span>
                        <span className="m">{monthOf(n.publishAt)}</span>
                      </span>
                      <div className="notice-body">
                        <h3>
                          <Link href={`/notices/${n.id}`}>{n.title}</Link>
                        </h3>
                        <p>
                          {n.body.slice(0, 190)}
                          {n.body.length > 190 ? '…' : ''}
                        </p>
                        <div className="notice-meta">
                          <span className="badge badge-brand">{n.category}</span>
                          {n.department && <span className="badge">{n.department.name}</span>}
                          {n.pinned && <span className="badge badge-accent">Important</span>}
                          <span className="text-muted" style={{ fontSize: '.85rem' }}>
                            {fmtDate(n.publishAt)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <aside className="stack">
              <div className="card">
                <h3>Filter by department</h3>
                <ul className="stack" style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '.92rem' }}>
                  <li>
                    <Link href={query({ department: undefined })}>All departments</Link>
                  </li>
                  {departments.map((d) => (
                    <li key={d.id}>
                      <Link href={query({ department: d.id })}>{d.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card">
                <h3>Notice categories</h3>
                <ul className="stack" style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '.92rem' }}>
                  {CATEGORIES.map((c) => (
                    <li className="split" key={c} style={{ gap: '.5rem' }}>
                      <Link href={query({ category: c })}>{c}</Link>
                      <span className="badge">{counts.find((x) => x.category === c)?._count ?? 0}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card">
                <h3>Archive</h3>
                <p className="mb-0" style={{ fontSize: '.9rem' }}>
                  Notices are retained for three academic years. Expired notices leave the board automatically
                  and remain searchable.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
