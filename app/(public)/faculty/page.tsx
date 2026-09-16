import Link from 'next/link';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import PageHero from '@/components/PageHero';
import Icon from '@/components/Icon';

export const metadata: Metadata = {
  title: 'Faculty Directory',
  description: 'Search the teaching and administrative faculty by department, designation or specialisation.',
};
export const dynamic = 'force-dynamic';

export default async function FacultyPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; department?: string }>;
}) {
  const { q, department } = await searchParams;

  const where: Record<string, unknown> = {};
  if (department) where.departmentId = department;
  if (q && q.trim().length > 1) {
    const term = q.trim();
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { specialization: { contains: term, mode: 'insensitive' } },
      { qualification: { contains: term, mode: 'insensitive' } },
      { designation: { contains: term, mode: 'insensitive' } },
    ];
  }

  const [faculty, departments, total] = await Promise.all([
    db.faculty.findMany({ where, include: { department: true }, orderBy: { order: 'asc' } }),
    db.department.findMany({ orderBy: { order: 'asc' } }),
    db.faculty.count(),
  ]);

  return (
    <>
      <PageHero
        title="Faculty Directory"
        lead="Search the teaching and administrative faculty of the college by name, department, designation or area of specialisation."
        crumbs={[{ label: 'Academics', href: '/departments' }, { label: 'Faculty' }]}
      />

      <section className="section">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '260px 1fr', gap: '2.5rem', alignItems: 'start' }}>
            <aside className="card">
              <h3>Filter</h3>
              <form action="/faculty" method="get">
                <div className="field" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="fac-q">Search</label>
                  <div className="search-field">
                    <Icon name="search" />
                    <input type="search" id="fac-q" name="q" defaultValue={q ?? ''} placeholder="Name or specialisation" />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="fac-dept">Department</label>
                  <select id="fac-dept" name="department" defaultValue={department ?? ''}>
                    <option value="">All departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="btn btn-primary btn-sm btn-block" type="submit" style={{ marginTop: '1.25rem' }}>
                  Apply filters
                </button>
                <Link className="btn btn-outline btn-sm btn-block" href="/faculty" style={{ marginTop: '.5rem' }}>
                  Reset
                </Link>
              </form>
            </aside>

            <div>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>
                {faculty.length} of {total} faculty members
              </p>
              {faculty.length === 0 ? (
                <div className="empty-state">
                  <Icon name="users" />
                  <p>No faculty member matches these filters.</p>
                </div>
              ) : (
                <div className="grid grid-2">
                  {faculty.map((f) => (
                    <article className="card card--hover" key={f.id}>
                      <div className="cluster" style={{ gap: '.9rem', alignItems: 'flex-start', marginBottom: '.9rem' }}>
                        <span className="avatar">{f.name.replace(/^(Prof\.|Dr\.|Mr\.|Ms\.)\s*/, '').charAt(0)}</span>
                        <div>
                          <strong style={{ display: 'block', fontSize: '1rem' }}>{f.name}</strong>
                          <span className="text-muted" style={{ fontSize: '.88rem' }}>
                            {f.designation}
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: '.88rem', marginBottom: '.6rem' }}>
                        <strong>Department:</strong>{' '}
                        {f.department ? (
                          <Link href={`/departments/${f.department.slug}`}>{f.department.name}</Link>
                        ) : (
                          'Administration'
                        )}
                        <br />
                        <strong>Qualification:</strong> {f.qualification}
                        <br />
                        <strong>Specialisation:</strong> {f.specialization}
                      </p>
                      <p className="mb-0" style={{ fontSize: '.88rem' }}>
                        <a href={`mailto:${f.email}`}>{f.email}</a>
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
