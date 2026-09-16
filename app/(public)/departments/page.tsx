import Link from 'next/link';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { getLocale } from '@/lib/i18n';
import PageHero from '@/components/PageHero';
import Icon from '@/components/Icon';
import type { IconName } from '@/lib/icons';

export const metadata: Metadata = {
  title: 'Departments',
  description: 'Nine academic departments offering BS and intermediate programmes at Government Degree College Zaim.',
};
export const dynamic = 'force-dynamic';

export default async function DepartmentsPage() {
  const locale = await getLocale();
  const departments = await db.department.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { faculty: true, programmes: true } } },
  });

  return (
    <>
      <PageHero
        title="Academic Departments"
        lead="Each department page lists its head, faculty, programmes, courses, facilities and notices."
        crumbs={[{ label: 'Departments' }]}
      />
      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {departments.map((d) => (
              <article className="card card--hover" key={d.id}>
                <span className="card-icon">
                  <Icon name={d.icon as IconName} />
                </span>
                <h3>{locale === 'ur' ? d.nameUr : d.name}</h3>
                <p style={{ fontSize: '.88rem', color: 'var(--text-muted)', marginBottom: '.75rem' }}>
                  <strong>Head:</strong> {d.hodName}
                </p>
                <p>{d.intro.slice(0, 140)}…</p>
                <div className="cluster" style={{ gap: '.4rem', marginBottom: '1rem' }}>
                  <span className="badge badge-brand">{d.studentCount} students</span>
                  <span className="badge">{d._count.faculty} faculty</span>
                  <span className="badge">Est. {d.established}</span>
                </div>
                <Link className="card-link" href={`/departments/${d.slug}`}>
                  Department page <Icon name="arrow" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
