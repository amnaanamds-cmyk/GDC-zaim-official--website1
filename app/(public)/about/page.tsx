import Link from 'next/link';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { site, aboutLeadOf, historyParagraphs, principalParagraphs, yearsSince } from '@/lib/site';
import PageHero from '@/components/PageHero';
import Icon from '@/components/Icon';
import type { IconName } from '@/lib/icons';

export async function generateMetadata(): Promise<Metadata> {
  const inst = await site();
  return {
    title: 'About the College',
    description: `History, vision, mission, principal\u2019s message, administration and affiliation of ${inst.name}.`,
  };
}
export const dynamic = 'force-dynamic';

const STRUCTURE = [
  ['1', 'Higher Education Department, Govt. of KP', 'Policy, budget, sanctioned posts and fee structure'],
  ['2', 'Principal', 'Institutional leadership, statutory correspondence, final approvals'],
  ['3', 'Vice Principal & Controller of Examinations', 'Academic calendar, examinations, discipline'],
  ['4', 'Heads of Department', 'Curriculum delivery, faculty workload, departmental results'],
  ['5', 'Administrative offices', 'Admissions, accounts, library, hostel, transport, IT services'],
];

export default async function AboutPage() {
  const [departments, programmes, faculty, students, facilities, leaders, campus] = await Promise.all([
    db.department.count(),
    db.programme.count(),
    db.faculty.count(),
    db.student.count(),
    db.facility.findMany({ orderBy: { order: 'asc' }, take: 6 }),
    db.leader.findMany({ orderBy: { order: 'asc' } }),
    db.siteImage.findUnique({ where: { slot: 'about-campus' } }),
  ]);
  const inst = await site();

  return (
    <>
      <PageHero
        title="About the College"
        lead={aboutLeadOf(inst)}
        crumbs={[{ label: 'About the College' }]}
      />

      <section className="section">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1fr 340px', alignItems: 'start', gap: '3rem' }}>
            <div>
              <span className="eyebrow">History</span>
              <h2>{yearsSince(inst)} years of public higher education</h2>
              {historyParagraphs(inst).map((para: string, i: number) => (
                <p key={i}>{para}</p>
              ))}
              <p>
                The college remains a fully government institution: fee structures are set by the Higher
                Education Department, admissions are governed by published merit criteria, and financial
                assistance is available to deserving students through federal and provincial scholarship schemes.
              </p>

              <h2 style={{ marginTop: '2.5rem' }}>Vision</h2>
              <div className="callout">
                <p className="mb-0">
                  To be a centre of learning where students of every background receive an education that is
                  academically rigorous, ethically grounded and directly useful to the development of their
                  communities.
                </p>
              </div>

              <h2 style={{ marginTop: '2.5rem' }}>Mission</h2>
              <ul className="stack" style={{ paddingInlineStart: '1.2rem' }}>
                <li>Deliver degree programmes that meet the academic standards of the affiliating university and the Higher Education Commission.</li>
                <li>Maintain transparent, merit-based admission, assessment and result processes.</li>
                <li>Provide laboratories, library resources and digital services sufficient for modern undergraduate study.</li>
                <li>Develop character, civic responsibility and respect for institutional and national values.</li>
                <li>Support students from low-income households through scholarships, fee concessions and counselling.</li>
              </ul>

              <h2 style={{ marginTop: '2.5rem' }}>Objectives</h2>
              <div className="grid grid-2">
                <div className="card"><h3>Academic quality</h3><p className="mb-0">Continuous review of curricula, teaching methods and assessment practices in line with university and HEC guidelines.</p></div>
                <div className="card"><h3>Access &amp; equity</h3><p className="mb-0">Keep higher education financially and geographically within reach of every eligible student in the district.</p></div>
                <div className="card"><h3>Digital administration</h3><p className="mb-0">Move admissions, attendance, examinations and records onto a single transparent, auditable platform.</p></div>
                <div className="card"><h3>Community engagement</h3><p className="mb-0">Contribute through health camps, literacy drives, environmental work and public seminars.</p></div>
              </div>
            </div>

            <aside className="stack">
              <figure className="photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={campus?.imagePath ?? '/images/campus-main-block.jpg'}
                  loading="lazy"
                  alt={campus?.alt || `The campus of ${inst.name}.`}
                />
                <figcaption>The main academic block and front lawn.</figcaption>
              </figure>

              <div className="card">
                <h3>At a glance</h3>
                <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '.55rem 1rem', fontSize: '.92rem', margin: 0 }}>
                  <dt className="text-muted">Established</dt><dd style={{ margin: 0, fontWeight: 650 }}>1998</dd>
                  <dt className="text-muted">Sector</dt><dd style={{ margin: 0, fontWeight: 650 }}>Government</dd>
                  <dt className="text-muted">Affiliation</dt><dd style={{ margin: 0, fontWeight: 650 }}>University of Peshawar</dd>
                  <dt className="text-muted">Departments</dt><dd style={{ margin: 0, fontWeight: 650 }}>{departments}</dd>
                  <dt className="text-muted">Programmes</dt><dd style={{ margin: 0, fontWeight: 650 }}>{programmes}</dd>
                  <dt className="text-muted">Students</dt><dd style={{ margin: 0, fontWeight: 650 }}>{students.toLocaleString('en-US')}</dd>
                  <dt className="text-muted">Faculty</dt><dd style={{ margin: 0, fontWeight: 650 }}>{faculty}</dd>
                  <dt className="text-muted">Campus</dt><dd style={{ margin: 0, fontWeight: 650 }}>24 acres</dd>
                </dl>
              </div>

              <div className="card">
                <h3>Affiliation &amp; accreditation</h3>
                <p style={{ fontSize: '.92rem' }}>
                  All degree programmes are affiliated with the University of Peshawar, which conducts final
                  examinations and awards degrees. The college is recognised by the Higher Education Department,
                  Government of Khyber Pakhtunkhwa.
                </p>
                <Link className="card-link" href="/downloads">Policy documents &amp; charters</Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section section--alt" id="principal">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '300px 1fr', gap: '3rem', alignItems: 'start' }}>
            <div className="ph ph-a" style={{ aspectRatio: '4/5', borderRadius: 'var(--radius-lg)', display: 'grid', placeItems: 'center', color: '#fff' }}>
              <Icon name="user" className="principal-silhouette" />
            </div>
            <div>
              <span className="eyebrow">Principal&rsquo;s Message</span>
              <h2>{inst.principalName}</h2>
              <p className="text-muted" style={{ marginTop: '-.5rem' }}>
                {inst.principalDesignation}{inst.principalQualification ? ` · ${inst.principalQualification}` : ''}
              </p>
              {principalParagraphs(inst).map((para: string, i: number) => (
                <p key={i}>{para}</p>
              ))}
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--brand)' }}>
                — {inst.principalName}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="administration">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Governance</span>
            <h2>Administration &amp; Organisational Structure</h2>
            <p>
              The college operates under the Higher Education Department, Government of Khyber Pakhtunkhwa.
              Academic matters are coordinated by departmental heads under the Principal and Vice Principal.
            </p>
          </div>

          <div className="grid grid-3">
            {leaders.map((m) => (
              <div className="card" key={m.id}>
                {m.photoPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="card-portrait" src={m.photoPath} alt={m.alt ?? `${m.name}, ${m.role}.`} loading="lazy" />
                ) : (
                  <span className="card-icon"><Icon name={(m.icon as IconName) ?? 'user'} /></span>
                )}
                <h3>{m.role}</h3>
                <p>{m.name}</p>
                <p className="mb-0" style={{ fontSize: '.88rem' }}>{m.detail}</p>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: '2.5rem' }}>Reporting structure</h3>
          <div className="table-wrap">
            <table className="data">
              <caption className="visually-hidden">Administrative reporting structure</caption>
              <thead>
                <tr><th scope="col">Level</th><th scope="col">Office</th><th scope="col">Responsibility</th></tr>
              </thead>
              <tbody>
                {STRUCTURE.map(([level, office, responsibility]) => (
                  <tr key={level}>
                    <td>{level}</td>
                    <td>{office}</td>
                    <td>{responsibility}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">Campus</span>
            <h2>Facilities on campus</h2>
          </div>
          <div className="grid grid-3">
            {facilities.map((f) => (
              <article className="card card--hover" key={f.id}>
                <span className="card-icon"><Icon name={f.icon as IconName} /></span>
                <h3>{f.name}</h3>
                <p className="mb-0">{f.detail}</p>
              </article>
            ))}
          </div>
          <p className="text-center" style={{ marginTop: '2rem' }}>
            <Link className="btn btn-primary" href="/facilities">All campus facilities</Link>
          </p>
        </div>
      </section>
    </>
  );
}
