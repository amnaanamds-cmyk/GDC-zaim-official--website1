import Link from 'next/link';
import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = { title: 'Sitemap', description: 'All pages on the Government Degree College Zaim website.' };

const GROUPS: { heading: string; links: [string, string][] }[] = [
  { heading: 'About', links: [['Home', '/'], ['About the College', '/about'], ["Principal's Message", '/about#principal'], ['Administration', '/about#administration'], ['Campus Facilities', '/facilities']] },
  { heading: 'Academics', links: [['Departments', '/departments'], ['Programmes & Courses', '/academics'], ['Grading Scheme', '/academics#grading'], ['Examinations & Results', '/academics#examinations'], ['Faculty Directory', '/faculty']] },
  { heading: 'Admissions', links: [['Admission Information', '/admissions'], ['Online Application', '/admissions#apply'], ['Scholarships', '/scholarships'], ['Prospectus & Downloads', '/downloads']] },
  { heading: 'Campus life', links: [['Notices & Announcements', '/notices'], ['Events & Calendar', '/events'], ['Event Media', '/events#media'], ['Photo Gallery', '/gallery'], ['Digital Library', '/library'], ['Student Services', '/student-services'], ['Alumni & Careers', '/alumni']] },
  { heading: 'Portal', links: [['Portal Login', '/portal/login'], ['Student Dashboard', '/portal/student'], ['Faculty Dashboard', '/portal/teacher'], ['Administration Dashboard', '/portal/admin'], ['Event Media Manager', '/portal/admin/media']] },
  { heading: 'Information', links: [['Contact', '/contact'], ['Complaints & Feedback', '/contact#complaint'], ['Search', '/search'], ['Accessibility Statement', '/accessibility'], ['Privacy Policy', '/privacy']] },
];

export default function SitemapPage() {
  return (
    <>
      <PageHero title="Sitemap" lead="Every page on this website, grouped by section." crumbs={[{ label: 'Sitemap' }]} />
      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {GROUPS.map((g) => (
              <div className="card" key={g.heading}>
                <h3>{g.heading}</h3>
                <ul className="stack" style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '.93rem' }}>
                  {g.links.map(([label, href]) => (
                    <li key={href + label}>
                      <Link href={href}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
