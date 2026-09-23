import Link from 'next/link';
import { site, mailbox } from '@/lib/site';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import PageHero from '@/components/PageHero';
import Icon from '@/components/Icon';

export const metadata: Metadata = {
  title: 'Digital Library',
  description: 'Search the central library catalogue, check availability and review borrowing rules.',
};
export const dynamic = 'force-dynamic';

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const inst = await site();
  const { q, category } = await searchParams;

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (q && q.trim().length > 1) {
    const term = q.trim();
    where.OR = [
      { title: { contains: term, mode: 'insensitive' } },
      { author: { contains: term, mode: 'insensitive' } },
      { isbn: { contains: term, mode: 'insensitive' } },
      { category: { contains: term, mode: 'insensitive' } },
    ];
  }

  const [books, all, total] = await Promise.all([
    db.book.findMany({ where, orderBy: { title: 'asc' } }),
    db.book.findMany({ select: { category: true, copies: true, available: true } }),
    db.book.count(),
  ]);

  const categories = [...new Set(all.map((b) => b.category))].sort();
  const totalCopies = all.reduce((s, b) => s + b.copies, 0);
  const onShelf = all.reduce((s, b) => s + b.available, 0);

  const link = (next: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries({ q, category, ...next })) if (v) sp.set(k, v);
    const s = sp.toString();
    return s ? `/library?${s}` : '/library';
  };

  return (
    <>
      <PageHero
        title="Central Library"
        lead="A searchable catalogue and a reading hall. Every enrolled student is a member from the day of admission."
        crumbs={[{ label: 'Library' }]}
      />

      <section className="section section--tight">
        <div className="container">
          <div className="grid grid-4">
            <div className="card text-center">
              <span className="stat-value" style={{ color: 'var(--brand)', fontSize: 'var(--step-3)' }}>{totalCopies}</span>
              <p className="mb-0" style={{ marginTop: '.4rem' }}>Copies in this catalogue</p>
            </div>
            <div className="card text-center">
              <span className="stat-value" style={{ color: 'var(--brand)', fontSize: 'var(--step-3)' }}>{onShelf}</span>
              <p className="mb-0" style={{ marginTop: '.4rem' }}>Currently on the shelf</p>
            </div>
            <div className="card text-center">
              <span className="stat-value" style={{ color: 'var(--brand)', fontSize: 'var(--step-3)' }}>14</span>
              <p className="mb-0" style={{ marginTop: '.4rem' }}>Day borrowing period</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1fr 300px', gap: '2.5rem', alignItems: 'start' }}>
            <div>
              <form className="search-field" style={{ marginBottom: '1.25rem' }} action="/library" method="get">
                <Icon name="search" />
                <label className="visually-hidden" htmlFor="lib-q">Search the catalogue</label>
                <input type="search" id="lib-q" name="q" defaultValue={q ?? ''} placeholder="Title, author or ISBN…" />
                {category && <input type="hidden" name="category" value={category} />}
              </form>

              <div className="cluster" style={{ marginBottom: '1.25rem' }} role="group" aria-label="Filter by subject">
                <Link className="chip" href={link({ category: undefined })} aria-pressed={!category}>
                  All subjects
                </Link>
                {categories.map((c) => (
                  <Link key={c} className="chip" href={link({ category: c })} aria-pressed={category === c}>
                    {c}
                  </Link>
                ))}
              </div>

              <p className="text-muted" style={{ marginBottom: '1rem' }}>
                {books.length} of {total} titles
              </p>

              {books.length === 0 ? (
                <div className="empty-state">
                  <Icon name="book" />
                  <p>No title matches that search.</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="data">
                    <caption className="visually-hidden">Library catalogue</caption>
                    <thead>
                      <tr>
                        <th scope="col">Title</th>
                        <th scope="col">Author</th>
                        <th scope="col">Category</th>
                        <th scope="col">Shelf</th>
                        <th scope="col">Availability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map((b) => (
                        <tr key={b.id}>
                          <td>
                            <strong>{b.title}</strong>
                            <br />
                            <span className="text-muted" style={{ fontSize: '.82rem' }}>ISBN {b.isbn}</span>
                          </td>
                          <td>{b.author}</td>
                          <td>{b.category}</td>
                          <td>{b.shelf}</td>
                          <td>
                            <span
                              className={`badge ${b.available > 1 ? 'badge-success' : b.available === 1 ? 'badge-warning' : 'badge-danger'}`}
                            >
                              {b.available > 0 ? `${b.available} of ${b.copies} available` : 'All copies issued'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <aside className="stack">
              <div className="card">
                <h3>Library hours</h3>
                <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '.5rem 1rem', fontSize: '.92rem', margin: 0 }}>
                  <dt className="text-muted">Mon – Thu</dt><dd style={{ margin: 0 }}>08:00 – 16:00</dd>
                  <dt className="text-muted">Friday</dt><dd style={{ margin: 0 }}>08:00 – 12:00</dd>
                  <dt className="text-muted">Saturday</dt><dd style={{ margin: 0 }}>09:00 – 13:00</dd>
                  <dt className="text-muted">Exam period</dt><dd style={{ margin: 0 }}>Extended to 18:00</dd>
                </dl>
              </div>
              <div className="card">
                <h3>Borrowing rules</h3>
                <ul className="stack" style={{ paddingInlineStart: '1.1rem', fontSize: '.9rem', margin: 0 }}>
                  <li>Three books at a time for 14 days, renewable once if not reserved.</li>
                  <li>An overdue fine is charged per day per book, at the rate notified by the library.</li>
                  <li>Reference books and periodicals are for reading-hall use only.</li>
                  <li>Library clearance is required before transcripts are issued.</li>
                </ul>
              </div>
              <div className="card">
                <h3>Librarian</h3>
                <p className="mb-0" style={{ fontSize: '.92rem' }}>
                  Mr. Naveed Anjum, MLIS
                  <br />
                  <a href={`mailto:${mailbox(inst, 'library')}`}>{mailbox(inst, 'library')}</a>
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
