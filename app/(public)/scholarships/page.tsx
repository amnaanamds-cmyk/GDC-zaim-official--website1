import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { fmtShort } from '@/lib/format';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Scholarships',
  description: 'Need-based and merit scholarships, fee concessions and financial assistance available to students.',
};
export const dynamic = 'force-dynamic';

const CONCESSIONS = [
  ['Merit concession', '100% tuition', 'First position in the department, previous semester'],
  ['Merit concession', '50% tuition', 'Second and third positions in the department'],
  ['Sibling concession', '25% tuition', 'Two or more siblings enrolled simultaneously'],
  ['Sports talent award', '50% tuition', 'Representation at provincial or national level'],
  ['Welfare assistance', 'Case by case', 'Recommendation of the welfare committee'],
];

export default async function ScholarshipsPage() {
  const scholarships = await db.scholarship.findMany({ orderBy: { name: 'asc' } });
  const today = new Date();

  return (
    <>
      <PageHero
        title="Scholarships & Financial Assistance"
        lead="No eligible student should leave this college for financial reasons. Federal, provincial and institutional schemes are available, and the Scholarship Cell assists with every application."
        crumbs={[{ label: 'Admissions', href: '/admissions' }, { label: 'Scholarships' }]}
      />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Open schemes</span>
            <h2>Scholarships currently available</h2>
          </div>
          <div className="table-wrap">
            <table className="data">
              <caption className="visually-hidden">Scholarship schemes</caption>
              <thead>
                <tr>
                  <th scope="col">Scheme</th>
                  <th scope="col">Provider</th>
                  <th scope="col">Covers</th>
                  <th scope="col">Eligibility</th>
                  <th scope="col">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {scholarships.map((s) => {
                  const open = !s.deadline || s.deadline >= today;
                  return (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.provider}</td>
                      <td>{s.covers}</td>
                      <td>{s.eligibility}</td>
                      <td>
                        {s.deadline ? fmtShort(s.deadline) : s.deadlineNote}{' '}
                        <span className={`badge ${open ? 'badge-success' : ''}`}>{open ? 'Open' : 'Closed'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
            <div>
              <h2>How to apply</h2>
              <ol className="stack" style={{ paddingInlineStart: '1.3rem' }}>
                <li>Download the application form for the relevant scheme from the Downloads section.</li>
                <li>Attach the guardian&rsquo;s income certificate, the previous result card and a copy of the CNIC/B-Form.</li>
                <li>Submit the completed file to the Scholarship Cell before the notified deadline.</li>
                <li>Attend the verification interview if called by the scrutiny committee.</li>
                <li>Selected candidates are notified on the notice board and through the student portal.</li>
              </ol>
              <div className="callout" style={{ marginTop: '1.5rem' }}>
                <p className="mb-0">
                  <strong>Scholarship Cell:</strong> Administration Block, Room 12 · Mon – Thu, 09:00 – 13:00 ·{' '}
                  <a href="mailto:scholarships@gdczaim.edu.pk">scholarships@gdczaim.edu.pk</a>
                </p>
              </div>
            </div>
            <div>
              <h2>Fee concessions</h2>
              <p>
                In addition to external scholarships, the college operates its own concession schemes approved by
                the Principal on the recommendation of the welfare committee.
              </p>
              <div className="table-wrap">
                <table className="data" style={{ minWidth: 'auto' }}>
                  <caption className="visually-hidden">College fee concession schemes</caption>
                  <thead>
                    <tr>
                      <th scope="col">Concession</th>
                      <th scope="col">Extent</th>
                      <th scope="col">Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CONCESSIONS.map(([name, extent, basis]) => (
                      <tr key={`${name}-${extent}`}>
                        <td>{name}</td>
                        <td>{extent}</td>
                        <td>{basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
