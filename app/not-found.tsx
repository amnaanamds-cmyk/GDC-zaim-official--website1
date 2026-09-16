import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Icon from '@/components/Icon';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="section" style={{ paddingBlock: 'var(--sp-9)' }}>
          <div className="container-narrow text-center">
            <span className="eyebrow">Error 404</span>
            <h1>This page could not be found</h1>
            <p className="text-muted" style={{ fontSize: 'var(--step-1)', maxWidth: '52ch', marginInline: 'auto' }}>
              The page you were looking for may have been moved, renamed or archived. Try searching the site, or
              use one of the links below.
            </p>
            <div className="cluster" style={{ justifyContent: 'center', marginTop: '2rem' }}>
              <Link className="btn btn-primary" href="/">Go to the home page</Link>
              <Link className="btn btn-outline" href="/search">Search the website</Link>
            </div>
            <div className="grid grid-3" style={{ marginTop: '3rem', textAlign: 'start' }}>
              <Link className="quicklink" href="/notices"><Icon name="bell" /><span>Notice board</span></Link>
              <Link className="quicklink" href="/admissions"><Icon name="clipboard" /><span>Admissions</span></Link>
              <Link className="quicklink" href="/contact"><Icon name="mail" /><span>Contact the college</span></Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
