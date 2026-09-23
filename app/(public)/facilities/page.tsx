import type { Metadata } from 'next';
import { db } from '@/lib/db';
import PageHero from '@/components/PageHero';
import Icon from '@/components/Icon';
import type { IconName } from '@/lib/icons';

export const metadata: Metadata = {
  title: 'Campus Facilities',
  description: 'Laboratories, library, hostel, transport, sports, auditorium, cafeteria and medical facilities on campus.',
};
export const dynamic = 'force-dynamic';


const ROUTES = [
  ['Route 1', 'Town Centre – Bus Stand – College', '07:15'],
  ['Route 2', 'Northern union councils', '07:00'],
  ['Route 3', 'Southern union councils', '07:00'],
  ['Route 4', 'Eastern villages & hostel shuttle', '07:30'],
];

const FAQS = [
  ['Is the library open to all students?', 'Yes. Every enrolled student is a member of the central library and may borrow up to three books at a time for 14 days. Membership is activated at enrolment.'],
  ['How is hostel accommodation allocated?', 'Applications are invited at the start of each academic session. Allocation is made by a committee on the basis of distance from home, financial need and academic record.'],
  ['Is there Wi-Fi on campus?', 'Wi-Fi is available in the IT block, library and departmental reading rooms. Access credentials are issued with the student identity card.'],
  ['What medical facilities are available?', 'The campus medical room provides first aid during college hours, with a visiting medical officer twice a week and a referral arrangement with the District Headquarters Hospital.'],
  ['Are there separate facilities for female students?', 'Yes. The campus has a separate common room, prayer area and reading space for female students, and dedicated seating in the library and laboratories.'],
];

export default async function FacilitiesPage() {
  const facilities = await db.facility.findMany({ orderBy: { order: 'asc' } });

  return (
    <>
      <PageHero
        title="Campus Facilities"
        lead="The campus houses academic blocks, computer and science laboratories, a central library, sports grounds and student welfare facilities."
        crumbs={[{ label: 'About', href: '/about' }, { label: 'Facilities' }]}
      />

      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {facilities.map((f) => (
              <article className="card card--hover" key={f.id}>
                <span className="card-icon"><Icon name={f.icon as IconName} /></span>
                <h3>{f.name}</h3>
                <p className="mb-0">{f.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Infrastructure</span>
            <h2>Laboratories &amp; teaching space</h2>
          </div>
          {facilities.length > 0 ? (
            <div className="table-wrap">
              <table className="data">
                <caption className="visually-hidden">Facilities on campus</caption>
                <thead>
                  <tr><th scope="col">Facility</th><th scope="col">Details</th></tr>
                </thead>
                <tbody>
                  {facilities.map((f) => (
                    <tr key={f.id}>
                      <td><strong>{f.name}</strong></td>
                      <td>{f.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="form-note">
              The administration has not listed the campus facilities yet.
            </p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            <div>
              <h2>Hostel</h2>
              <p>
                On-campus hostel accommodation is available for students from outside the district, allocated on
                the basis of distance from home, financial need and academic record. Rooms are shared, and the
                hostel has a common study room, prayer area and dining hall under a resident warden.
              </p>
              <ul className="stack" style={{ paddingInlineStart: '1.2rem' }}>
                <li>120 sanctioned seats, allocated each session on published criteria</li>
                <li>Hostel dues are charged separately from tuition fees</li>
                <li>Attendance and visitor records maintained by the warden&rsquo;s office</li>
              </ul>
            </div>
            <div>
              <h2>Transport</h2>
              <p>
                College buses operate on four routes covering the town and adjoining union councils. Transport
                registration is completed at the start of each semester and the fee is charged per route.
              </p>
              <div className="table-wrap">
                <table className="data" style={{ minWidth: 'auto' }}>
                  <caption className="visually-hidden">College bus routes</caption>
                  <thead>
                    <tr><th scope="col">Route</th><th scope="col">Coverage</th><th scope="col">Departure</th></tr>
                  </thead>
                  <tbody>
                    {ROUTES.map(([route, coverage, time]) => (
                      <tr key={route}><td>{route}</td><td>{coverage}</td><td>{time}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container-narrow">
          <h2>Frequently asked questions</h2>
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
