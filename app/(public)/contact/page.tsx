import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { site, localised, mailbox } from '@/lib/site';
import PageHero from '@/components/PageHero';
import Icon from '@/components/Icon';
import ActionForm from '@/components/ActionForm';
import { sendEnquiry, submitComplaint } from '@/app/actions/public';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Office directory, enquiry form, complaints and feedback system, and directions to the campus.',
};
export const dynamic = 'force-dynamic';

/**
 * The offices a visitor might need. Only the mailbox name is listed — the
 * domain comes from the institution's own address, so these stay correct for
 * whichever college this deployment belongs to.
 */
const OFFICES = [
  ['Principal’s Office', 'Institutional matters, official correspondence', 'principal', 'Administration Block, First Floor'],
  ['Admission Office', 'Admissions, merit lists, enrolment', 'admissions', 'Administration Block, Ground Floor'],
  ['Examination Office', 'Datesheets, results, rechecking', 'exams', 'Administration Block, Room 5'],
  ['Registrar / Records', 'Certificates, transcripts, student records', 'registrar', 'Administration Block, Room 3'],
  ['Accounts Office', 'Fees, challans, dues clearance', 'accounts', 'Administration Block, Room 7'],
  ['Central Library', 'Membership, borrowing, clearance', 'library', 'Library Building'],
  ['Scholarship Cell', 'Scholarships and fee concessions', 'scholarships', 'Administration Block, Room 12'],
  ['IT & Portal Support', 'Portal accounts, password reset', 'itsupport', 'IT Block, Ground Floor'],
];

export default async function ContactPage() {
  const inst = await site();
  const [departments, campus] = await Promise.all([
    db.department.findMany({ orderBy: { order: 'asc' } }),
    db.siteImage.findUnique({ where: { slot: 'hero' } }),
  ]);

  return (
    <>
      <PageHero
        title="Contact the College"
        lead="Reach the relevant office directly, send a general enquiry, or submit a complaint that can be tracked through to resolution."
        crumbs={[{ label: 'Contact' }]}
      />

      <section className="section">
        <div className="container">
          <div className="grid grid-4">
            <div className="card">
              <span className="card-icon"><Icon name="pin" /></span>
              <h3>Address</h3>
              <p className="mb-0">{inst.address}</p>
            </div>
            <div className="card">
              <span className="card-icon"><Icon name="phone" /></span>
              <h3>Telephone</h3>
              <p className="mb-0">
                Office: <a href={`tel:${inst.phone.replace(/\s/g, '')}`}>{inst.phone}</a>
                <br />
                Admissions: <a href={`tel:${inst.admissionsPhone.replace(/\s/g, '')}`}>{inst.admissionsPhone}</a>
              </p>
            </div>
            <div className="card">
              <span className="card-icon"><Icon name="mail" /></span>
              <h3>Email</h3>
              <p className="mb-0">
                <a href={`mailto:${inst.email}`}>{inst.email}</a>
                <br />
                <a href={`mailto:${inst.admissionsEmail}`}>{inst.admissionsEmail}</a>
              </p>
            </div>
            <div className="card">
              <span className="card-icon"><Icon name="clock" /></span>
              <h3>Office hours</h3>
              <p className="mb-0">
                Mon – Fri: 08:00 – 14:00
                <br />
                Saturday: 09:00 – 12:00 (helpdesk)
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Directory</span>
            <h2>Office contacts</h2>
          </div>
          <div className="table-wrap">
            <table className="data">
              <caption className="visually-hidden">College office contact directory</caption>
              <thead>
                <tr>
                  <th scope="col">Office</th>
                  <th scope="col">Responsible for</th>
                  <th scope="col">Email</th>
                  <th scope="col">Location</th>
                </tr>
              </thead>
              <tbody>
                {OFFICES.map(([office, responsible, box, location]) => {
                  const address = mailbox(inst, box);
                  return (
                    <tr key={office}>
                      <td>{office}</td>
                      <td>{responsible}</td>
                      <td>
                        <a href={`mailto:${address}`}>{address}</a>
                      </td>
                      <td>{location}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
            <div>
              <h2>General enquiry</h2>
              <p>
                Use this form for admissions, academic or general questions. Enquiries are recorded and routed
                to the relevant office, and answered during working hours.
              </p>
              <div className="card">
                <ActionForm action={sendEnquiry} submitLabel="Send enquiry" pendingLabel="Sending…">
                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="c-name">Your name <span className="req">*</span></label>
                      <input type="text" id="c-name" name="name" required autoComplete="name" />
                    </div>
                    <div className="field">
                      <label htmlFor="c-email">Email <span className="req">*</span></label>
                      <input type="email" id="c-email" name="email" required autoComplete="email" />
                    </div>
                    <div className="field">
                      <label htmlFor="c-phone">Mobile number</label>
                      <input type="tel" id="c-phone" name="phone" autoComplete="tel" />
                    </div>
                    <div className="field">
                      <label htmlFor="c-subject">Subject <span className="req">*</span></label>
                      <select id="c-subject" name="subject" required defaultValue="">
                        <option value="">Select a subject</option>
                        <option>Admissions</option>
                        <option>Examinations &amp; results</option>
                        <option>Certificates &amp; records</option>
                        <option>Fees &amp; accounts</option>
                        <option>Library</option>
                        <option>Portal / IT support</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="field field--full">
                      <label htmlFor="c-message">Message <span className="req">*</span></label>
                      <textarea id="c-message" name="message" required minLength={10} />
                    </div>
                  </div>
                </ActionForm>
              </div>
            </div>

            <div id="complaint">
              <h2>Complaints &amp; feedback</h2>
              <p>
                Complaints are routed to the responsible department and tracked through{' '}
                <strong>Submitted → Under Review → Resolved</strong>. You receive a reference number on
                submission, and anonymous feedback is accepted without contact details.
              </p>
              <div className="card">
                <ActionForm action={submitComplaint} submitLabel="Submit complaint" pendingLabel="Submitting…">
                  <div className="form-grid">
                    <div className="field field--full">
                      <label htmlFor="cm-type">Category <span className="req">*</span></label>
                      <select id="cm-type" name="category" required defaultValue="">
                        <option value="">Select a category</option>
                        <option>Academic</option>
                        <option>Administrative</option>
                        <option>Facility / infrastructure</option>
                        <option>IT &amp; portal</option>
                        <option>Library</option>
                        <option>Transport</option>
                        <option>Hostel</option>
                        <option>General feedback</option>
                      </select>
                    </div>
                    <div className="field field--full">
                      <label htmlFor="cm-dept">Concerned department</label>
                      <select id="cm-dept" name="departmentId" defaultValue="">
                        <option value="">Not specific to a department</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field field--full">
                      <label htmlFor="cm-detail">Details <span className="req">*</span></label>
                      <textarea
                        id="cm-detail"
                        name="details"
                        required
                        minLength={15}
                        placeholder="Describe the issue, including dates and location where relevant."
                      />
                    </div>
                    <div className="field field--full">
                      <label htmlFor="cm-contact">Your name and contact (optional)</label>
                      <input type="text" id="cm-contact" name="contact" placeholder="Leave blank to submit anonymously" />
                      <span className="hint">
                        Anonymous complaints are investigated, but we cannot report the outcome back to you.
                      </span>
                    </div>
                  </div>
                </ActionForm>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
            <div>
              <span className="eyebrow">Getting here</span>
              <h2>Location &amp; directions</h2>
              <p>
                The campus is on Main Campus Road, about two kilometres from the town bus stand. College buses
                serve four routes covering the town and adjoining union councils.
              </p>
              <ul className="stack" style={{ paddingInlineStart: '1.2rem' }}>
                <li><strong>By college bus:</strong> four routes, departing between 07:00 and 07:30.</li>
                <li><strong>By public transport:</strong> local vans from the main bus stand stop at the college gate.</li>
                <li><strong>By car:</strong> visitor parking is available inside the main gate.</li>
              </ul>
            </div>
            <figure className={`photo${campus ? '' : ' photo--empty'}`}>
              {campus ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={campus.imagePath} loading="lazy" alt={campus.alt || `${inst.name}.`} />
              ) : (
                <span className="ph ph-b" aria-hidden="true" />
              )}
              <figcaption>
                {inst.address}. An interactive map will be embedded here once the official coordinates are
                confirmed by the administration.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>
    </>
  );
}
