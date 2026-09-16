import Link from 'next/link';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { fmtShort } from '@/lib/format';
import PageHero from '@/components/PageHero';
import Icon from '@/components/Icon';

export const metadata: Metadata = {
  title: 'Downloads',
  description: 'Prospectus, application forms, timetables, datesheets, policies and official notifications.',
};
export const dynamic = 'force-dynamic';

export default async function DownloadsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [documents, all] = await Promise.all([
    db.download.findMany({ where: category ? { category } : {}, orderBy: { publishedAt: 'desc' } }),
    db.download.findMany({ select: { category: true } }),
  ]);
  const categories = [...new Set(all.map((d) => d.category))].sort();

  return (
    <>
      <PageHero
        title="Downloads & Documents"
        lead="Prospectus, application forms, timetables, datesheets, policies and official notifications published by the college administration."
        crumbs={[{ label: 'Downloads' }]}
      />
      <section className="section">
        <div className="container">
          <div className="cluster" style={{ marginBottom: '1.5rem' }} role="group" aria-label="Filter by category">
            <Link className="chip" href="/downloads" aria-pressed={!category}>All categories</Link>
            {categories.map((c) => (
              <Link key={c} className="chip" href={`/downloads?category=${encodeURIComponent(c)}`} aria-pressed={category === c}>
                {c}
              </Link>
            ))}
          </div>

          <div className="table-wrap">
            <table className="data">
              <caption className="visually-hidden">Downloadable documents</caption>
              <thead>
                <tr>
                  <th scope="col">Document</th>
                  <th scope="col">Category</th>
                  <th scope="col">Published</th>
                  <th scope="col">Type</th>
                  <th scope="col">Size</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="cluster" style={{ gap: '.6rem' }}>
                        <span style={{ color: 'var(--brand)', display: 'inline-flex', width: 18, height: 18 }}>
                          <Icon name="file" />
                        </span>
                        <strong>{d.title}</strong>
                      </div>
                    </td>
                    <td><span className="badge badge-brand">{d.category}</span></td>
                    <td>{fmtShort(d.publishedAt)}</td>
                    <td>{d.fileType}</td>
                    <td>{d.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="callout" style={{ marginTop: '2rem' }}>
            <p className="mb-0">
              <strong>Note:</strong> the document index is managed from the admin panel. Upload of the actual
              PDF files uses the same storage as event media; until a file is attached, an entry is listed for
              information only.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
