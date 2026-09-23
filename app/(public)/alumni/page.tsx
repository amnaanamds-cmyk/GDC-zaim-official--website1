import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { site, mailbox } from '@/lib/site';
import { fmtShort } from '@/lib/format';
import PageHero from '@/components/PageHero';
import Icon from '@/components/Icon';

export const metadata: Metadata = {
  title: 'Alumni & Careers',
  description: 'Alumni association, mentorship and the Career Counselling Cell’s job, internship and guidance services.',
};
export const dynamic = 'force-dynamic';

export default async function AlumniPage() {
  const inst = await site();
  const [alumni, careers] = await Promise.all([
    db.alumnus.findMany({ orderBy: { order: 'asc' } }),
    db.careerOpportunity.findMany({ orderBy: { deadline: 'asc' } }),
  ]);

  return (
    <>
      <PageHero
        title="Alumni & Careers"
        lead="The alumni association keeps graduates connected to the college, and the Career Counselling Cell supports current students entering employment and further study."
        crumbs={[{ label: 'Alumni & Careers' }]}
      />

      <section className="section">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1fr 340px', gap: '3rem', alignItems: 'start' }}>
            <div>
              <span className="eyebrow">Alumni</span>
              <h2>Graduates of {inst.shortName}</h2>
              <p>
                More than 18,000 students have graduated from this college since 1998. Alumni serve in education,
                health, public administration, banking, engineering and technology across the province and beyond.
              </p>
              <div className="grid grid-2" style={{ marginTop: '1.5rem' }}>
                {alumni.map((a) => (
                  <article className="card" key={a.id}>
                    <div className="cluster" style={{ gap: '.9rem', alignItems: 'flex-start' }}>
                      <span className="avatar">{a.name.replace(/^(Dr\.|Mr\.|Ms\.)\s*/, '').charAt(0)}</span>
                      <div>
                        <strong style={{ display: 'block' }}>{a.name}</strong>
                        <span className="text-muted" style={{ fontSize: '.86rem' }}>{a.batch}</span>
                      </div>
                    </div>
                    <p className="mb-0" style={{ marginTop: '.8rem', fontSize: '.9rem' }}>{a.role}</p>
                  </article>
                ))}
              </div>

              <h2 style={{ marginTop: '2.5rem' }} id="careers">Career opportunities</h2>
              <p>Positions, internships and graduate programmes notified to the Career Counselling Cell.</p>
              <div className="table-wrap">
                <table className="data">
                  <caption className="visually-hidden">Career and internship opportunities</caption>
                  <thead>
                    <tr>
                      <th scope="col">Opportunity</th>
                      <th scope="col">Organisation</th>
                      <th scope="col">Type</th>
                      <th scope="col">Apply by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {careers.map((c) => (
                      <tr key={c.id}>
                        <td><strong>{c.title}</strong></td>
                        <td>{c.org}</td>
                        <td><span className="badge badge-brand">{c.type}</span></td>
                        <td>{c.deadline ? fmtShort(c.deadline) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 style={{ marginTop: '2.5rem' }}>Career guidance</h2>
              <div className="grid grid-3">
                <div className="card">
                  <span className="card-icon"><Icon name="clipboard" /></span>
                  <h3>Competitive exams</h3>
                  <p className="mb-0">Guidance on CSS, PMS and provincial recruitment, including recommended reading and past papers.</p>
                </div>
                <div className="card">
                  <span className="card-icon"><Icon name="book" /></span>
                  <h3>Postgraduate study</h3>
                  <p className="mb-0">Support with university applications, HEC scholarships and statement writing.</p>
                </div>
                <div className="card">
                  <span className="card-icon"><Icon name="users" /></span>
                  <h3>CV &amp; interviews</h3>
                  <p className="mb-0">Workshops on CV writing, interview practice and workplace expectations.</p>
                </div>
              </div>
            </div>

            <aside className="stack">
              <div className="card">
                <h3>What the association does</h3>
                <ul className="stack" style={{ paddingInlineStart: '1.1rem', fontSize: '.92rem', margin: 0 }}>
                  <li>Mentorship for final-year students</li>
                  <li>Career sessions each semester</li>
                  <li>Welfare fund for deserving students</li>
                  <li>Annual meet each December</li>
                </ul>
              </div>
              <div className="card">
                <h3>Career Counselling Cell</h3>
                <p className="mb-0" style={{ fontSize: '.92rem' }}>
                  Administration Block, Room 8
                  <br />
                  Mon – Thu, 10:00 – 13:00
                  <br />
                  <a href={`mailto:${mailbox(inst, 'careers')}`}>{mailbox(inst, 'careers')}</a>
                </p>
              </div>
              <div className="card">
                <h3>Employers</h3>
                <p className="mb-0" style={{ fontSize: '.92rem' }}>
                  Organisations wishing to notify a vacancy or internship to our graduates may write to the
                  Career Counselling Cell with the position details and closing date.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
