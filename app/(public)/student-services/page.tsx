import Link from 'next/link';
import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import Icon from '@/components/Icon';
import ActionForm from '@/components/ActionForm';
import TrackRequest from '@/components/TrackRequest';
import { requestService } from '@/app/actions/public';

export const metadata: Metadata = {
  title: 'Student Services',
  description: 'Request certificates and official documents, and track each request from submission to delivery.',
};
export const dynamic = 'force-dynamic';

const SERVICES = [
  ['Bonafide Certificate', '2 working days', 'Registration number, purpose of request'],
  ['Character Certificate', '3 working days', 'Clearance from department and library'],
  ['Migration Certificate', '5 working days', 'No-dues clearance, original fee receipts'],
  ['Academic Transcript', '5 working days', 'Completed semesters, transcript fee receipt'],
  ['Duplicate Student ID Card', '3 working days', 'Application, affidavit for a lost card'],
  ['Fee / Dues Certificate', '2 working days', 'Registration number, relevant session'],
];

const STAGES = [
  ['Submitted', 'Request received and a reference number issued'],
  ['Under review', 'Records, dues and clearance verified by the office'],
  ['Approved', 'Approved and signed by the competent authority'],
  ['Ready', 'Document prepared and available for collection'],
  ['Delivered', 'Collected by the student or authorised representative'],
];

export default function StudentServicesPage() {
  return (
    <>
      <PageHero
        title="Student Services"
        lead="Request certificates and official documents, and track each request from submission to delivery."
        crumbs={[{ label: 'Student Services' }]}
      />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Certificates &amp; documents</span>
            <h2>Services offered</h2>
            <p>
              All requests are processed by the Registrar&rsquo;s office. Turnaround times are counted from the
              date a complete request, with dues cleared, is received.
            </p>
          </div>
          <div className="grid grid-3">
            {SERVICES.map(([name, turnaround, requires]) => (
              <article className="card card--hover" key={name}>
                <span className="card-icon"><Icon name="file" /></span>
                <h3>{name}</h3>
                <p><strong>Requires:</strong> {requires}</p>
                <span className="badge badge-brand">{turnaround}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
            <div>
              <h2>How a request is processed</h2>
              <p>
                Every request moves through five recorded stages. You can see the current stage at any time
                using the reference number issued on submission.
              </p>
              <ul className="timeline">
                {STAGES.map(([stage, detail], i) => (
                  <li key={stage} className={i === 0 ? 'is-done' : ''}>
                    <span className="t-stage">{stage}</span>
                    <span className="t-date">{detail}</span>
                  </li>
                ))}
              </ul>
              <div className="callout" style={{ marginTop: '1.5rem' }}>
                <p className="mb-0">
                  <strong>Before you apply:</strong> clear outstanding library books and fee dues. Requests with
                  pending dues are held at the review stage until clearance is recorded.
                </p>
              </div>

              <div className="card" style={{ marginTop: '1.5rem' }}>
                <h3>Track a request</h3>
                <p style={{ fontSize: '.9rem' }}>
                  Enter the reference number you were given to see the current stage.
                </p>
                <TrackRequest />
              </div>
            </div>

            <div className="card">
              <h3>Submit a request</h3>
              <ActionForm action={requestService} submitLabel="Submit request" pendingLabel="Submitting…" block>
                <div className="stack">
                  <div className="field">
                    <label htmlFor="sv-name">Student name <span className="req">*</span></label>
                    <input type="text" id="sv-name" name="studentName" required minLength={2} />
                  </div>
                  <div className="field">
                    <label htmlFor="sv-reg">Registration number <span className="req">*</span></label>
                    <input type="text" id="sv-reg" name="regNo" required placeholder="Your registration number" />
                  </div>
                  <div className="field">
                    <label htmlFor="sv-type">Service required <span className="req">*</span></label>
                    <select id="sv-type" name="serviceType" required defaultValue="">
                      <option value="">Select a service</option>
                      {SERVICES.map(([name]) => (
                        <option key={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="sv-purpose">Purpose <span className="req">*</span></label>
                    <textarea id="sv-purpose" name="purpose" required minLength={5} placeholder="e.g. Required for a scholarship application" style={{ minHeight: 90 }} />
                  </div>
                  <div className="field">
                    <label htmlFor="sv-contact">Mobile number <span className="req">*</span></label>
                    <input type="tel" id="sv-contact" name="contact" required placeholder="03xx-xxxxxxx" />
                  </div>
                </div>
              </ActionForm>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            <article className="card">
              <span className="card-icon"><Icon name="home" /></span>
              <h3>Hostel</h3>
              <p>Applications for hostel accommodation are invited at the start of each session and allocated by committee.</p>
              <Link className="card-link" href="/downloads">Hostel form <Icon name="arrow" /></Link>
            </article>
            <article className="card">
              <span className="card-icon"><Icon name="bus" /></span>
              <h3>Transport</h3>
              <p>Register for a bus route at the start of each semester. Routes, timings and fees are published in advance.</p>
              <Link className="card-link" href="/facilities">Routes &amp; timings <Icon name="arrow" /></Link>
            </article>
            <article className="card">
              <span className="card-icon"><Icon name="health" /></span>
              <h3>Counselling &amp; welfare</h3>
              <p>Academic counselling, career guidance and confidential welfare support through departmental advisers.</p>
              <Link className="card-link" href="/contact">Contact the office <Icon name="arrow" /></Link>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
