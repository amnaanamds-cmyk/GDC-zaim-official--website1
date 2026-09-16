import Link from 'next/link';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { SITE } from '@/lib/site';
import PageHero from '@/components/PageHero';
import Icon from '@/components/Icon';
import type { IconName } from '@/lib/icons';

export const metadata: Metadata = {
  title: 'About the College',
  description: 'History, vision, mission, principal’s message, administration and affiliation of Government Degree College Zaim.',
};
export const dynamic = 'force-dynamic';

const ADMIN_TEAM: { role: string; name: string; detail: string; icon: IconName }[] = [
  { role: 'Principal', name: 'Prof. Dr. Muhammad Ayaz Khan', detail: 'Overall academic and administrative head of the institution.', icon: 'user' },
  { role: 'Vice Principal', name: 'Prof. Shahid Mehmood', detail: 'Academic coordination, discipline and timetabling.', icon: 'users' },
  { role: 'Registrar / Admissions', name: 'Mr. Naeem Akhtar', detail: 'Admissions, enrolment, student records and certificates.', icon: 'clipboard' },
  { role: 'Controller of Examinations', name: 'Dr. Salman Yousaf', detail: 'Examination conduct, marks verification and result publication.', icon: 'chart' },
  { role: 'Librarian', name: 'Mr. Naveed Anjum', detail: 'Library services, catalogue and digital resources.', icon: 'book' },
  { role: 'Hostel Warden', name: 'Mr. Ejaz Ahmad', detail: 'Hostel allocation, residence discipline and welfare.', icon: 'home' },
];

const STRUCTURE = [
  ['1', 'Higher Education Department, Govt. of KP', 'Policy, budget, sanctioned posts and fee structure'],
  ['2', 'Principal', 'Institutional leadership, statutory correspondence, final approvals'],
  ['3', 'Vice Principal & Controller of Examinations', 'Academic calendar, examinations, discipline'],
  ['4', 'Heads of Department', 'Curriculum delivery, faculty workload, departmental results'],
  ['5', 'Administrative offices', 'Admissions, accounts, library, hostel, transport, IT services'],
];

export default async function AboutPage() {
  const [departments, programmes, faculty, students, facilities] = await Promise.all([
    db.department.count(),
    db.programme.count(),
    db.faculty.count(),
    db.student.count(),
    db.facility.findMany({ orderBy: { order: 'asc' }, take: 6 }),
  ]);

  return (
    <>
      <PageHero
        title="About the College"
        lead="Established in 1998 under the Higher Education Department, Government Degree College Zaim provides affordable, high-quality higher education to students across the district."
        crumbs={[{ label: 'About the College' }]}
      />

      <section className="section">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1fr 340px', alignItems: 'start', gap: '3rem' }}>
            <div>
              <span className="eyebrow">History</span>
              <h2>Twenty-seven years of public higher education</h2>
              <p>
                Government Degree College Zaim opened its doors in 1998 with two departments and fewer than 300
                students. It was established to serve a district where families had, until then, sent their
                children to distant cities for intermediate and degree-level study — an option many could not
                afford.
              </p>
              <p>
                The college was upgraded to degree-awarding status in 2004 and introduced four-year BS programmes
                in 2012 following the national shift to the semester system. Today it enrols more than 4,200
                students across nine departments, with laboratories, a central library, hostel accommodation and
                transport facilities developed steadily through provincial development schemes and community
                support.
              </p>
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
                  src="/images/campus-main-block.jpg"
                  width={899}
                  height={1599}
                  loading="lazy"
                  alt="The main academic block of Government Degree College Zaim: a two-storey brick building with arched windows and a central tower, fronted by a wide lawn and flowering shrubs."
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
              <h2>{SITE.principal.name}</h2>
              <p className="text-muted" style={{ marginTop: '-.5rem' }}>
                {SITE.principal.designation} · {SITE.principal.qualification}
              </p>
              <p>
                Government Degree College Zaim has served this region for more than two decades, opening the
                doors of higher education to students who might otherwise have been left behind. Our purpose is
                simple: to combine academic rigour with character, so that every graduate leaves here able to
                think independently and serve honourably.
              </p>
              <p>
                Over the past few years we have worked to strengthen the foundations of the college: laboratory
                equipment has been renewed, the library catalogue has been digitised, and departmental research
                activity has increased. The introduction of this website and management portal is the next step.
                It puts admissions, attendance, results, library services and official notices in one transparent
                place, accessible to students, parents and faculty alike.
              </p>
              <p>
                Transparency matters to us. A merit list published online, an attendance record a student can
                check the same week, a complaint that can be tracked to resolution — these are small things
                individually, but together they build the trust a public institution depends on.
              </p>
              <p>
                To our students: make full use of what this college offers. To parents: you are partners in this
                work, and the portal is open to you as well. To my colleagues: thank you for the commitment that
                keeps this institution standing.
              </p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--brand)' }}>
                — {SITE.principal.name}
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
            {ADMIN_TEAM.map((m) => (
              <div className="card" key={m.role}>
                <span className="card-icon"><Icon name={m.icon} /></span>
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
