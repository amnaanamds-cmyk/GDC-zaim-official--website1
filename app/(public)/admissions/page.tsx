import Link from 'next/link';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { site } from '@/lib/site';
import PageHero from '@/components/PageHero';
import ApplicationForm from '@/components/ApplicationForm';

export const metadata: Metadata = {
  title: 'Admissions 2026',
  description: 'Admission schedule, eligibility criteria, merit calculation, required documents and the online application form.',
};
export const dynamic = 'force-dynamic';

const DOCUMENTS = [
  'Matriculation & Intermediate detailed marks certificates (attested)',
  'Character certificate from the last institution attended',
  'Two attested copies of CNIC / B-Form and the guardian’s CNIC',
  'Four recent passport-size photographs',
  'Domicile certificate',
  'Migration certificate, where applicable',
];

const FAQS = [
  ['Can I apply for more than one programme?', 'Yes. Submit a separate application for each programme you wish to be considered for. Merit is assessed separately for each.'],
  ['Is there an entry test?', 'An entry test is conducted for programmes where applications exceed twice the sanctioned seats. The test date is notified on the notice board.'],
  ['What if my name does not appear on the merit list?', 'Subsequent merit lists are displayed as seats remain vacant after each enrolment deadline. Keep checking the notice board and this website.'],
  ['Are fee concessions available?', 'Yes. Need-based scholarships, Zakat assistance and merit concessions are available — see the scholarships page.'],
  ['Can I apply if my result is awaited?', 'Applications are accepted provisionally with a result-awaited certificate, but admission is confirmed only after the detailed marks certificate is verified.'],
];

export default async function AdmissionsPage() {
  const inst = await site();
  const [programmes, schedule, applicationCount] = await Promise.all([
    db.programme.findMany({ include: { department: true }, orderBy: { name: 'asc' } }),
    db.admissionStage.findMany({ orderBy: { order: 'asc' } }),
    db.application.count(),
  ]);

  return (
    <>
      <PageHero
        title="Admissions 2026"
        lead="Admission to all programmes is strictly on merit, calculated from academic record according to the weighting notified by the Higher Education Department."
        crumbs={[{ label: 'Admissions' }]}
      />

      <section className="section section--tight">
        <div className="container">
          <div className="callout callout--accent">
            <h3>Current status — second merit list displayed</h3>
            <p className="mb-0">
              Candidates on the second merit list must deposit dues and complete enrolment at the Admission
              Office by <strong>22 September 2026</strong>. Seats not confirmed by the deadline will be offered
              to candidates on the next list. <Link href="/downloads">Download the merit list</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1fr 330px', gap: '3rem', alignItems: 'start' }}>
            <div>
              <h2>How to apply</h2>
              <ol className="stack" style={{ paddingInlineStart: '1.3rem' }}>
                <li><strong>Check eligibility.</strong> Confirm that you meet the minimum marks and subject requirements listed below.</li>
                <li><strong>Prepare your documents.</strong> Scan or photograph the marks certificates, CNIC/B-Form and a photograph.</li>
                <li><strong>Complete the online form.</strong> Fill in the application below and upload the documents.</li>
                <li><strong>Keep your reference number.</strong> It is issued the moment the application is submitted.</li>
                <li><strong>Watch for the merit list.</strong> Lists are published on the notice board and on this website.</li>
                <li><strong>Confirm your seat.</strong> If selected, deposit the dues and complete enrolment within the notified period.</li>
              </ol>

              <h2 style={{ marginTop: '2.5rem' }}>Eligibility &amp; seats</h2>
              <div className="table-wrap">
                <table className="data">
                  <caption className="visually-hidden">Eligibility criteria and sanctioned seats by programme</caption>
                  <thead>
                    <tr>
                      <th scope="col">Programme</th><th scope="col">Eligibility</th>
                      <th scope="col">Seats</th><th scope="col">Semester fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programmes.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.name}</strong>
                          <br />
                          <span className="text-muted" style={{ fontSize: '.85rem' }}>{p.duration}</span>
                        </td>
                        <td>{p.eligibility}</td>
                        <td>{p.seats}</td>
                        <td>{p.fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 style={{ marginTop: '2.5rem' }}>Merit calculation</h2>
              <p>
                Merit is calculated by the admissions module using the weighting below. Where a candidate holds
                an additional qualification recognised by the university, the higher qualification is used.
              </p>
              <div className="grid grid-3">
                <div className="card text-center">
                  <span className="stat-value" style={{ color: 'var(--brand)', fontSize: 'var(--step-3)' }}>50%</span>
                  <p className="mb-0" style={{ marginTop: '.5rem' }}>Intermediate / FSc marks</p>
                </div>
                <div className="card text-center">
                  <span className="stat-value" style={{ color: 'var(--brand)', fontSize: 'var(--step-3)' }}>30%</span>
                  <p className="mb-0" style={{ marginTop: '.5rem' }}>Matriculation marks</p>
                </div>
                <div className="card text-center">
                  <span className="stat-value" style={{ color: 'var(--brand)', fontSize: 'var(--step-3)' }}>20%</span>
                  <p className="mb-0" style={{ marginTop: '.5rem' }}>Entry test / interview</p>
                </div>
              </div>
              <p className="form-note" style={{ marginTop: '1rem' }}>
                The online form records the intermediate component; the Admission Office adds the matriculation
                and test components when your documents are verified.
              </p>

              <h2 style={{ marginTop: '2.5rem' }}>Required documents</h2>
              <ul className="stack" style={{ paddingInlineStart: '1.2rem' }}>
                {DOCUMENTS.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <p className="form-note">
                All copies must be attested by a Grade 17 or above officer. Original documents are required at
                the time of interview for verification.
              </p>

              <h2 style={{ marginTop: '2.5rem' }} id="apply">Online application</h2>
              <p>
                Submit your application for the 2026 session. On submission you receive a reference number that
                identifies your application at every stage of processing.
              </p>
              <div className="card">
                <ApplicationForm programmes={programmes.map((p) => ({ id: p.id, name: p.name }))} />
              </div>
            </div>

            <aside className="stack">
              <div className="card">
                <h3>Admission schedule</h3>
                <ul className="timeline">
                  {schedule.map((s) => (
                    <li className={`is-${s.status}`} key={s.id}>
                      <span className="t-stage">{s.stage}</span>
                      <span className="t-date">{s.dates}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card">
                <h3>Applications received</h3>
                <p className="mb-0" style={{ fontSize: '.92rem' }}>
                  <strong style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)' }}>{applicationCount}</strong>
                  <br />
                  online applications recorded for the 2026 session so far.
                </p>
              </div>
              <div className="card">
                <h3>Admission Office</h3>
                <p className="mb-0" style={{ fontSize: '.92rem' }}>
                  Administration Block, Ground Floor
                  <br />
                  Mon – Fri, 08:30 – 13:30
                  <br />
                  <a href={`tel:${inst.admissionsPhone.replace(/\s/g, '')}`}>{inst.admissionsPhone}</a>
                  <br />
                  <a href={`mailto:${inst.admissionsEmail}`}>{inst.admissionsEmail}</a>
                </p>
              </div>
              <div className="card">
                <h3>Related</h3>
                <ul className="stack" style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '.92rem' }}>
                  <li><Link href="/downloads">Prospectus &amp; forms</Link></li>
                  <li><Link href="/scholarships">Scholarships &amp; fee concessions</Link></li>
                  <li><Link href="/academics#programs">Programmes &amp; courses</Link></li>
                  <li><Link href="/facilities">Hostel &amp; transport</Link></li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container-narrow">
          <h2>Admission FAQs</h2>
          {FAQS.map(([q, a], i) => (
            <details className="accordion" key={q} open={i === 0}>
              <summary>{q}</summary>
              <div className="acc-body">{a}</div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
