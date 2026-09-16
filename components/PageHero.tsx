import Link from 'next/link';

export default function PageHero({
  title,
  lead,
  crumbs,
}: {
  title: string;
  lead?: string;
  crumbs: { label: string; href?: string }[];
}) {
  return (
    <section className="page-hero">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href="/">Home</Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label}>{c.href ? <Link href={c.href}>{c.label}</Link> : c.label}</li>
            ))}
          </ol>
        </nav>
        <h1>{title}</h1>
        {lead && <p>{lead}</p>}
      </div>
    </section>
  );
}
