import Link from 'next/link';
import type { Metadata } from 'next';
import { searchSite } from '@/lib/search';
import PageHero from '@/components/PageHero';
import Icon from '@/components/Icon';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search departments, faculty, notices, events, programmes, library titles, documents and services.',
};
export const dynamic = 'force-dynamic';

const SUGGESTIONS = ['admission', 'merit list', 'computer science', 'transcript', 'scholarship', 'library', 'timetable'];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const results = query.length >= 2 ? await searchSite(query) : [];

  return (
    <>
      <PageHero
        title="Search the Website"
        lead="Search across departments, faculty, notices, events, programmes, library titles, documents, scholarships and campus services."
        crumbs={[{ label: 'Search' }]}
      />

      <section className="section">
        <div className="container-narrow">
          <form role="search" action="/search" method="get">
            <div className="search-field">
              <Icon name="search" />
              <label className="visually-hidden" htmlFor="q">Search terms</label>
              <input
                type="search"
                id="q"
                name="q"
                defaultValue={query}
                autoFocus
                placeholder="e.g. admission merit list, computer science, transcript…"
              />
            </div>
          </form>

          <div className="cluster" style={{ marginTop: '1rem' }}>
            <span className="text-muted" style={{ fontSize: '.88rem' }}>Try:</span>
            {SUGGESTIONS.map((s) => (
              <Link key={s} className="chip" href={`/search?q=${encodeURIComponent(s)}`}>
                {s}
              </Link>
            ))}
          </div>

          <div style={{ marginTop: '2rem' }} aria-live="polite">
            {query.length < 2 ? (
              <p className="text-muted">Type at least two characters to search.</p>
            ) : results.length === 0 ? (
              <div className="empty-state">
                <Icon name="search" />
                <p>No results for &ldquo;{query}&rdquo;.</p>
                <p style={{ fontSize: '.9rem' }}>
                  Try a different term, or browse the <Link href="/notices">notice board</Link>,{' '}
                  <Link href="/departments">departments</Link> or <Link href="/downloads">downloads</Link>.
                </p>
              </div>
            ) : (
              <>
                <p className="text-muted" style={{ marginBottom: '1rem' }}>
                  {results.length} result{results.length === 1 ? '' : 's'} for &ldquo;{query}&rdquo;
                </p>
                <div className="stack">
                  {results.map((r) => (
                    <article className="card" key={`${r.type}-${r.href}-${r.title}`} style={{ padding: '1.1rem' }}>
                      <div className="cluster" style={{ gap: '.5rem', marginBottom: '.4rem' }}>
                        <span className="badge badge-brand">{r.type}</span>
                        {r.meta && (
                          <span className="text-muted" style={{ fontSize: '.85rem' }}>{r.meta}</span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '1.02rem', fontFamily: 'var(--font-sans)', marginBottom: '.3rem' }}>
                        <Link href={r.href}>{r.title}</Link>
                      </h3>
                      <p className="mb-0" style={{ fontSize: '.9rem', color: 'var(--text-muted)' }}>
                        {r.snippet.slice(0, 165)}
                        {r.snippet.length > 165 ? '…' : ''}
                      </p>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
