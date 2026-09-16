import Link from 'next/link';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { GRADE_SCALE, ATTENDANCE_THRESHOLD } from '@/lib/grading';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Programmes, Timetable & Examinations',
  description: 'Degree programmes, grading scheme, class timetable and the examination calendar.',
};
export const dynamic = 'force-dynamic';

const RULES = [
  ['Attendance requirement', `A minimum of ${ATTENDANCE_THRESHOLD}% attendance in each course is required to appear in the terminal examination. Attendance is recorded by the course teacher and is visible to students in the portal, where a warning is generated once attendance falls below the threshold.`],
  ['Assessment weighting', 'Sessional work (assignments, quizzes and presentations) carries 25%, the mid-term examination 25% and the final examination 50% of the total marks for a course.'],
  ['Semester promotion', 'A student must maintain a minimum CGPA of 2.00 to be promoted. A student falling below this is placed on academic probation and is counselled by the departmental adviser.'],
  ['Re-appearing in a course', 'A course in which an F grade is obtained must be repeated. The better grade is recorded, and the attempt history is retained in the academic record.'],
  ['Result rectification', 'An application for rechecking may be submitted to the Controller of Examinations within 15 days of the result announcement, together with the prescribed fee.'],
];

const EXAM_CALENDAR = [
  ['Submission of sessional marks', '29 Sep – 03 Oct 2026', 'Upcoming'],
  ['Mid-term examinations', '06 – 17 Oct 2026', 'Upcoming'],
  ['Display of mid-term awards', '27 Oct 2026', 'Scheduled'],
  ['Practical examinations', '12 – 20 Jan 2027', 'Scheduled'],
  ['Final examinations', '26 Jan – 10 Feb 2027', 'Scheduled'],
  ['Result notification', '10 Mar 2027', 'Scheduled'],
];

export default async function AcademicsPage({ searchParams }: { searchParams: Promise<{ level?: string; department?: string }> }) {
  const { level, department } = await searchParams;

  const [programmes, departments, courses] = await Promise.all([
    db.programme.findMany({
      where: level ? { level } : {},
      include: { department: true },
      orderBy: { name: 'asc' },
    }),
    db.department.findMany({ orderBy: { order: 'asc' } }),
    db.course.findMany({
      where: department ? { department: { slug: department } } : { department: { slug: 'computer-science' } },
      include: { teacher: true },
      orderBy: [{ semester: 'asc' }, { title: 'asc' }],
    }),
  ]);

  const selectedDept = department ?? 'computer-science';

  return (
    <>
      <PageHero
        title="Programmes, Timetable & Examinations"
        lead="The college follows the semester system prescribed by the affiliating university. This page covers degree programmes, the grading scheme, courses and the examination calendar."
        crumbs={[{ label: 'Academics' }]}
      />

      <section className="section" id="programs">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Academics</span>
            <h2>Degree &amp; Intermediate Programmes</h2>
            <p>
              Seats shown are the sanctioned intake for the 2026 session; the fee is the semester tuition charge
              notified by the Higher Education Department.
            </p>
          </div>

          <div className="cluster" style={{ marginBottom: '1.25rem' }} role="group" aria-label="Filter programmes by level">
            <Link className="chip" href="/academics#programs" aria-pressed={!level}>All programmes</Link>
            <Link className="chip" href="/academics?level=Undergraduate#programs" aria-pressed={level === 'Undergraduate'}>BS (4 years)</Link>
            <Link className="chip" href="/academics?level=Intermediate#programs" aria-pressed={level === 'Intermediate'}>Intermediate</Link>
          </div>

          <div className="table-wrap">
            <table className="data">
              <caption className="visually-hidden">Programmes offered by the college</caption>
              <thead>
                <tr>
                  <th scope="col">Programme</th><th scope="col">Department</th><th scope="col">Duration</th>
                  <th scope="col">Seats</th><th scope="col">Eligibility</th><th scope="col">Fee</th>
                </tr>
              </thead>
              <tbody>
                {programmes.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td><Link href={`/departments/${p.department.slug}`}>{p.department.name}</Link></td>
                    <td>{p.duration}</td>
                    <td>{p.seats}</td>
                    <td>{p.eligibility}</td>
                    <td>{p.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section section--alt" id="grading">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
            <div>
              <span className="eyebrow">Assessment</span>
              <h2>Grading scheme</h2>
              <p>
                Semester grade points are calculated from the total marks obtained in each course. GPA and CGPA
                are calculated automatically by the examination module of the portal, using exactly this scale.
              </p>
              <div className="table-wrap">
                <table className="data" style={{ minWidth: 'auto' }}>
                  <caption className="visually-hidden">Marks to grade point conversion</caption>
                  <thead>
                    <tr><th scope="col">Marks (%)</th><th scope="col">Grade</th><th scope="col">Grade point</th></tr>
                  </thead>
                  <tbody>
                    {GRADE_SCALE.map((g, i) => (
                      <tr key={g.grade}>
                        <td>{i === 0 ? '85 – 100' : i === GRADE_SCALE.length - 1 ? 'Below 50' : `${g.min} – ${GRADE_SCALE[i - 1].min - 1}`}</td>
                        <td>{g.grade}</td>
                        <td>{g.point.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <span className="eyebrow">Regulations</span>
              <h2>Academic rules</h2>
              {RULES.map(([q, a], i) => (
                <details className="accordion" key={q} open={i === 0}>
                  <summary>{q}</summary>
                  <div className="acc-body">{a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="timetable">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Courses</span>
            <h2>Course catalogue</h2>
            <p>Courses offered by each department, with the teacher assigned where one has been allocated.</p>
          </div>

          <div className="cluster" style={{ marginBottom: '1.25rem' }} role="group" aria-label="Choose a department">
            {departments.map((d) => (
              <Link key={d.id} className="chip" href={`/academics?department=${d.slug}#timetable`} aria-pressed={selectedDept === d.slug}>
                {d.name}
              </Link>
            ))}
          </div>

          <div className="table-wrap">
            <table className="data">
              <caption className="visually-hidden">Course catalogue</caption>
              <thead>
                <tr>
                  <th scope="col">Code</th><th scope="col">Course</th>
                  <th scope="col">Semester</th><th scope="col">Credit hours</th><th scope="col">Teacher</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td>{c.code}</td>
                    <td><strong>{c.title}</strong></td>
                    <td>{c.semester}</td>
                    <td>{c.creditHours}</td>
                    <td>{c.teacher ? c.teacher.name : <span className="text-muted">To be assigned</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section section--alt" id="examinations">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Examinations</span>
            <h2>Examination Schedule &amp; Results</h2>
            <p>
              Mid-term and final examinations are conducted by the college under the supervision of the
              Controller of Examinations. Results are published to students only after the examination office
              verifies the marks a teacher submits.
            </p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'start' }}>
            <div>
              <h3>Examination calendar — Fall 2026</h3>
              <div className="table-wrap">
                <table className="data" style={{ minWidth: 'auto' }}>
                  <caption className="visually-hidden">Examination calendar</caption>
                  <thead>
                    <tr><th scope="col">Activity</th><th scope="col">Dates</th><th scope="col">Status</th></tr>
                  </thead>
                  <tbody>
                    {EXAM_CALENDAR.map(([activity, dates, status]) => (
                      <tr key={activity}>
                        <td>{activity}</td>
                        <td>{dates}</td>
                        <td><span className={`badge ${status === 'Upcoming' ? 'badge-warning' : ''}`}>{status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 style={{ marginTop: '2rem' }}>Examination rules</h3>
              <ul className="stack" style={{ paddingInlineStart: '1.2rem' }}>
                <li>The college identity card must be carried to every examination.</li>
                <li>Roll number slips are issued only to students meeting the {ATTENDANCE_THRESHOLD}% attendance requirement and clear of outstanding dues.</li>
                <li>Mobile phones, smart watches and programmable devices are not permitted in the examination hall.</li>
                <li>Use of unfair means is dealt with under the university&rsquo;s disciplinary regulations.</li>
              </ul>
            </div>

            <div className="card">
              <h3>Check your result</h3>
              <p style={{ fontSize: '.92rem' }}>
                Results, attendance, GPA and the full academic record are shown in the student portal, computed
                live from the examination records.
              </p>
              <Link className="btn btn-primary btn-block" href="/portal/login">
                Sign in to the student portal
              </Link>
              <hr />
              <p className="form-note mb-0">
                For a correction, apply for rechecking to the Controller of Examinations within 15 days of
                notification.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
