export type NavChild = { label: string; key: string; href: string };
export type NavItem = { label: string; key: string; href?: string; children?: NavChild[] };

export const NAV: NavItem[] = [
  { label: 'Home', key: 'nav.home', href: '/' },
  {
    label: 'About',
    key: 'nav.about',
    children: [
      { label: 'About the College', key: 'nav.about.college', href: '/about' },
      { label: "Principal's Message", key: 'nav.about.principal', href: '/about#principal' },
      { label: 'Administration', key: 'nav.about.admin', href: '/about#administration' },
      { label: 'Campus Facilities', key: 'nav.about.facilities', href: '/facilities' },
    ],
  },
  {
    label: 'Academics',
    key: 'nav.academics',
    children: [
      { label: 'Departments', key: 'nav.academics.departments', href: '/departments' },
      { label: 'Programmes & Courses', key: 'nav.academics.programs', href: '/academics' },
      { label: 'Faculty Directory', key: 'nav.academics.faculty', href: '/faculty' },
      { label: 'Examinations & Results', key: 'nav.academics.exams', href: '/academics#examinations' },
    ],
  },
  {
    label: 'Admissions',
    key: 'nav.admissions',
    children: [
      { label: 'Admission Information', key: 'nav.admissions.main', href: '/admissions' },
      { label: 'Scholarships', key: 'nav.admissions.scholarships', href: '/scholarships' },
      { label: 'Prospectus & Downloads', key: 'nav.admissions.downloads', href: '/downloads' },
    ],
  },
  {
    label: 'Campus Life',
    key: 'nav.campus',
    children: [
      { label: 'Notices & Announcements', key: 'nav.campus.notices', href: '/notices' },
      { label: 'Events & Calendar', key: 'nav.campus.events', href: '/events' },
      { label: 'Photo Gallery', key: 'nav.campus.gallery', href: '/gallery' },
      { label: 'Digital Library', key: 'nav.campus.library', href: '/library' },
      { label: 'Student Services', key: 'nav.campus.services', href: '/student-services' },
      { label: 'Alumni & Careers', key: 'nav.campus.alumni', href: '/alumni' },
    ],
  },
  { label: 'Contact', key: 'nav.contact', href: '/contact' },
];
