import type { Metadata } from 'next';
import { site } from '@/lib/site';
import PageHero from '@/components/PageHero';

export async function generateMetadata(): Promise<Metadata> {
  const inst = await site();
  return {
    title: 'Privacy Policy',
    description: `How ${inst.name} collects, uses, shares, protects and retains personal information.`,
  };
}

export default async function PrivacyPage() {
  const inst = await site();
  return (
    <>
      <PageHero
        title="Privacy Policy"
        lead="How the college collects, uses and protects personal information submitted through this website and the management portal."
        crumbs={[{ label: 'Privacy' }]}
      />
      <section className="section">
        <div className="container-narrow">
          <h2>Information we collect</h2>
          <ul className="stack" style={{ paddingInlineStart: '1.2rem' }}>
            <li><strong>Admission applications:</strong> name, parentage, CNIC or B-Form number, date of birth, contact details, academic records and uploaded supporting documents.</li>
            <li><strong>Enrolled students:</strong> registration number, programme and semester, attendance, assessment marks, fee and library records.</li>
            <li><strong>Faculty and staff:</strong> employment identifier, designation, department, assigned courses and official contact details.</li>
            <li><strong>Enquiries and complaints:</strong> the details you provide, including contact information where you choose to supply it.</li>
          </ul>

          <h2 style={{ marginTop: '2.5rem' }}>How we use it</h2>
          <p>
            Personal information is used only for the purposes for which it was collected: processing admissions,
            maintaining academic and administrative records, issuing certificates and results, operating library
            and hostel services, and responding to enquiries and complaints. Aggregated, non-identifying
            statistics may be used for institutional planning and official reporting.
          </p>

          <h2 style={{ marginTop: '2.5rem' }}>Sharing</h2>
          <p>
            Information is shared with the affiliating university and the Higher Education Department where
            required for examinations, degree issuance, scholarships and statutory reporting. It is not sold,
            rented or shared with any other third party for commercial purposes.
          </p>

          <h2 style={{ marginTop: '2.5rem' }}>How it is protected</h2>
          <ul className="stack" style={{ paddingInlineStart: '1.2rem' }}>
            <li>Passwords are stored as bcrypt hashes, never as plain text.</li>
            <li>Sessions are held server-side and referenced by an httpOnly cookie, so a session cannot be read by scripts in the browser.</li>
            <li>An account locks temporarily after repeated failed sign-in attempts.</li>
            <li>Access to records is restricted by role, checked on the server for every request — not merely hidden in the interface.</li>
            <li>Administrative actions are recorded in an activity log with the timestamp and responsible account.</li>
            <li>Uploaded files are validated by type and size and stored under generated names, never the name supplied by the browser.</li>
          </ul>

          <h2 style={{ marginTop: '2.5rem' }}>Retention</h2>
          <p>
            Academic records are retained permanently as institutional records, as required for the issuance of
            transcripts and verification of qualifications. Unsuccessful admission applications are retained for
            three years. Complaint records are retained for three years after resolution.
          </p>

          <h2 style={{ marginTop: '2.5rem' }}>Your choices</h2>
          <p>
            You may request correction of inaccurate personal information by applying to the Registrar&rsquo;s
            office with supporting evidence. Complaints may be submitted anonymously, in which case no contact
            information is collected and no outcome can be reported back to you.
          </p>

          <h2 style={{ marginTop: '2.5rem' }}>Cookies</h2>
          <p>
            This website sets two cookies: one recording your language choice, and one identifying your portal
            session when you are signed in. Neither is used for advertising or tracking. Your theme preference is
            stored in your browser&rsquo;s local storage and is never sent to the college.
          </p>

          <h2 style={{ marginTop: '2.5rem' }}>Contact</h2>
          <p>
            Questions about this policy may be sent to{' '}
            <a href={`mailto:${inst.email}`}>{inst.email}</a> or addressed to the Registrar, {inst.name},{' '}
            {inst.address}.
          </p>

          <p className="form-note" style={{ marginTop: '2rem' }}>
            This statement describes the handling of data by the system as built. It should be reviewed and
            formally approved by the college administration before the portal processes live records.
          </p>
        </div>
      </section>
    </>
  );
}
