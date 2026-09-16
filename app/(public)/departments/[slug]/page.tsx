import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { publishedNotices } from '@/lib/queries';
import { fmtDate, dayOf, monthOf } from '@/lib/format';
import PageHero from '@/components/PageHero';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = await db.department.findUnique({ where: { slug } });
  return d ? { title: `${d.name} Department`, description: d.intro.slice(0, 160) } : { title: 'Department' };
}

export default async function DepartmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const department = await db.department.findUnique({
    where: { slug },
    include: {
      faculty: { orderBy: { order: 'asc' } },
      programmes: true,
      courses: { orderBy: { semester: 'asc' } },
    },
  });
  if (!department) notFound();

  const [notices, others] = await Promise.all([
    publishedNotices(4, { OR: [{ departmentId: department.id }, { departmentId: null }] }),
    db.department.findMany({ where: { id: { not: department.id } }, orderBy: { order: 'asc' } }),
  ]);

  return (
    <>
      <PageHero
        title={`Department of ${department.name}`}
        lead={department.intro}
        crumbs={[{ label: 'Departments', href: '/departments' }, { label: department.name }]}
      />

      <section className="section">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1fr 330px', gap: '3rem', alignItems: 'start' }}>
            <div>
              <h2>Programmes offered</h2>
              <div className="table-wrap" style={{ marginBottom: '2.5rem' }}>
                <table className="data">
                  <caption className="visually-hidden">Programmes offered by this department</caption>
                  <thead>
                    <tr>
                      <th scope="col">Programme</th>
                      <th scope="col">Level</th>
                      <th scope="col">Duration</th>
                      <th scope="col">Seats</th>
                      <th scope="col">Eligibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {department.programmes.length === 0 ? (
                      <tr>
                        <td colSpan={5}>Programme details are published with each admission cycle.</td>
                      </tr>
                    ) : (
                      department.programmes.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.name}</strong>
                          </td>
                          <td>{p.level}</td>
                          <td>{p.duration}</td>
                          <td>{p.seats}</td>
                          <td>{p.eligibility}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <h2>Courses taught</h2>
              <div className="cluster" style={{ marginBottom: '2.5rem' }}>
                {department.courses.map((c) => (
                  <span className="badge badge-brand" key={c.id} style={{ padding: '.35rem .8rem' }}>
                    {c.title}
                  </span>
                ))}
              </div>

              <h2>Faculty members</h2>
              <div className="grid grid-2" style={{ marginBottom: '2.5rem' }}>
                {department.faculty.map((f) => (
                  <article className="card" key={f.id}>
                    <div className="cluster" style={{ gap: '.9rem', alignItems: 'flex-start' }}>
                      <span className="avatar">{f.name.replace(/^(Prof\.|Dr\.|Mr\.|Ms\.)\s*/, '').charAt(0)}</span>
                      <div>
                        <strong style={{ display: 'block' }}>{f.name}</strong>
                        <span className="text-muted" style={{ fontSize: '.88rem' }}>
                          {f.designation}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '.88rem', margin: '.9rem 0 0' }}>
                      <strong>Qualification:</strong> {f.qualification}
                      <br />
                      <strong>Specialisation:</strong> {f.specialization}
                    </p>
                    <p style={{ margin: '.4rem 0 0', fontSize: '.88rem' }}>
                      <a href={`mailto:${f.email}`}>{f.email}</a>
                    </p>
                  </article>
                ))}
              </div>

              <h2>Departmental notices</h2>
              <ul className="notice-list" style={{ marginBottom: '2.5rem' }}>
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
                      <div className="notice-meta">
                        <span className="badge badge-brand">{n.category}</span>
                        <span className="text-muted" style={{ fontSize: '.85rem' }}>
                          {fmtDate(n.publishAt)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <h2>Achievements</h2>
              <ul className="stack" style={{ paddingInlineStart: '1.2rem' }}>
                {department.achievements.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>

            <aside className="stack">
              <div className="card">
                <h3>Head of Department</h3>
                <div className="cluster" style={{ gap: '.9rem' }}>
                  <span className="avatar">{department.hodName.replace(/^(Prof\.|Dr\.|Mr\.|Ms\.)\s*/, '').charAt(0)}</span>
                  <div>
                    <strong style={{ display: 'block' }}>{department.hodName}</strong>
                    <span className="text-muted" style={{ fontSize: '.86rem' }}>
                      {department.hodDesignation}
                    </span>
                  </div>
                </div>
                <p style={{ margin: '1rem 0 0', fontSize: '.9rem' }}>
                  <a href={`mailto:${department.email}`}>{department.email}</a>
                </p>
              </div>

              <div className="card">
                <h3>At a glance</h3>
                <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '.55rem 1rem', fontSize: '.92rem', margin: 0 }}>
                  <dt className="text-muted">Established</dt>
                  <dd style={{ margin: 0, fontWeight: 650 }}>{department.established}</dd>
                  <dt className="text-muted">Students</dt>
                  <dd style={{ margin: 0, fontWeight: 650 }}>{department.studentCount}</dd>
                  <dt className="text-muted">Faculty</dt>
                  <dd style={{ margin: 0, fontWeight: 650 }}>{department.faculty.length}</dd>
                  <dt className="text-muted">Courses</dt>
                  <dd style={{ margin: 0, fontWeight: 650 }}>{department.courses.length}</dd>
                </dl>
              </div>

              <div className="card">
                <h3>Facilities</h3>
                <ul className="stack" style={{ paddingInlineStart: '1.1rem', fontSize: '.92rem', margin: 0 }}>
                  {department.facilities.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <h3>Other departments</h3>
                <ul className="stack" style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '.92rem' }}>
                  {others.map((o) => (
                    <li key={o.id}>
                      <Link href={`/departments/${o.slug}`}>{o.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
