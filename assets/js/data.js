/*!
 * GDC Zaim — Central content data (single source of truth)
 * ---------------------------------------------------------
 * Every page renders from this file, and the site-wide search index is built
 * from it. When the backend/API of Phase 2 is ready, replace the literals
 * below with `fetch()` calls to the REST endpoints — the page-level render
 * functions do not need to change.
 *
 * NOTE: names, dates and figures below are realistic placeholders for the
 * college to replace with official records before going live.
 */

const siteConfig = {
  name: 'Government Degree College Zaim',
  nameUr: 'گورنمنٹ ڈگری کالج زعیم',
  shortName: 'GDC Zaim',
  tagline: 'Knowledge · Character · Service',
  taglineUr: 'علم · کردار · خدمت',
  established: 1998,
  affiliation: 'Affiliated with the University of Peshawar · Recognised by the Higher Education Department',
  address: 'Main Campus Road, Zaim, Khyber Pakhtunkhwa, Pakistan',
  phone: '+92 91 000 0000',
  admissionsPhone: '+92 91 000 0001',
  email: 'info@gdczaim.edu.pk',
  admissionsEmail: 'admissions@gdczaim.edu.pk',
  officeHours: 'Monday – Friday, 08:00 – 14:00 (Office) · Saturday, 09:00 – 12:00 (Helpdesk)',
  socials: [
    { label: 'Facebook', url: '#', icon: 'facebook' },
    { label: 'X (Twitter)', url: '#', icon: 'twitter' },
    { label: 'YouTube', url: '#', icon: 'youtube' },
    { label: 'LinkedIn', url: '#', icon: 'linkedin' }
  ],
  principal: {
    name: 'Prof. Dr. Muhammad Ayaz Khan',
    designation: 'Principal',
    qualification: 'Ph.D. Education, M.Phil. English Literature',
    message:
      'Government Degree College Zaim has served this region for more than two decades, opening the doors of higher education to students who might otherwise have been left behind. Our purpose is simple: to combine academic rigour with character, so that every graduate leaves here able to think independently and serve honourably. This portal is part of that commitment — it puts admissions, attendance, results, library services and official notices in one transparent place, accessible to students, parents and faculty alike. I welcome you to our campus and invite you to make full use of what it offers.',
    messageShort:
      'Our purpose is to combine academic rigour with character, so that every graduate leaves here able to think independently and serve honourably.'
  },
  stats: [
    { value: 4200, suffix: '+', label: 'Enrolled Students', labelUr: 'زیرِ تعلیم طلبہ' },
    { value: 148, suffix: '', label: 'Faculty Members', labelUr: 'اساتذہ' },
    { value: 9, suffix: '', label: 'Academic Departments', labelUr: 'شعبہ جات' },
    { value: 27, suffix: '', label: 'Years of Service', labelUr: 'سالہ خدمات' }
  ]
};

/* ------------------------------------------------------------------ *
 * Departments
 * ------------------------------------------------------------------ */
const departments = [
  {
    id: 'computer-science',
    name: 'Computer Science',
    nameUr: 'کمپیوٹر سائنس',
    icon: 'cpu',
    hod: 'Dr. Sadia Rehman',
    hodDesignation: 'Associate Professor & Head of Department',
    established: 2006,
    students: 610,
    faculty: 14,
    intro:
      'The Department of Computer Science offers a four-year BS programme built around programming fundamentals, data structures, databases, networks and software engineering, supported by three dedicated computer laboratories and an active final-year project culture.',
    programs: ['BS Computer Science (4 Years)', 'ICS — Intermediate in Computer Science (2 Years)'],
    courses: [
      'Programming Fundamentals', 'Object Oriented Programming', 'Data Structures & Algorithms',
      'Database Systems', 'Operating Systems', 'Computer Networks', 'Software Engineering',
      'Web Technologies', 'Artificial Intelligence', 'Information Security'
    ],
    facilities: ['3 Computer Labs (120 workstations)', 'Project & Research Lab', 'High-speed campus Wi-Fi'],
    achievements: [
      'Runner-up, Inter-Collegiate Programming Contest 2025',
      'Departmental FYP repository with 180+ archived projects'
    ],
    email: 'cs@gdczaim.edu.pk'
  },
  {
    id: 'english',
    name: 'English',
    nameUr: 'انگریزی',
    icon: 'book',
    hod: 'Prof. Nadia Bashir',
    hodDesignation: 'Professor & Head of Department',
    established: 1998,
    students: 480,
    faculty: 16,
    intro:
      'The Department of English develops language proficiency, critical reading and literary scholarship, from compulsory English for all intermediate students to a specialised BS programme in English Literature and Linguistics.',
    programs: ['BS English (4 Years)', 'Compulsory English — All Programmes'],
    courses: ['Introduction to Literature', 'Classical Poetry', 'Drama', 'Novel', 'Linguistics', 'Academic Writing', 'Literary Criticism'],
    facilities: ['Language Laboratory', 'Departmental Reading Room', 'Debating & Literary Society'],
    achievements: ['Winner, Provincial Declamation Contest 2024', 'Annual literary magazine "Aaghaz"'],
    email: 'english@gdczaim.edu.pk'
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    nameUr: 'ریاضی',
    icon: 'sigma',
    hod: 'Dr. Imran Ullah',
    hodDesignation: 'Assistant Professor & Head of Department',
    established: 1999,
    students: 395,
    faculty: 12,
    intro:
      'Mathematics underpins the college’s science and computing programmes, offering rigorous training in calculus, algebra, analysis and numerical methods alongside an applied-mathematics research group.',
    programs: ['BS Mathematics (4 Years)', 'Mathematics for FSc Pre-Engineering'],
    courses: ['Calculus I–III', 'Linear Algebra', 'Real Analysis', 'Complex Analysis', 'Numerical Methods', 'Probability & Statistics'],
    facilities: ['Mathematics Resource Centre', 'Computational Mathematics Lab access'],
    achievements: ['Two faculty publications in HEC-recognised journals (2025)'],
    email: 'maths@gdczaim.edu.pk'
  },
  {
    id: 'physics',
    name: 'Physics',
    nameUr: 'طبیعیات',
    icon: 'atom',
    hod: 'Dr. Tariq Mehmood',
    hodDesignation: 'Associate Professor & Head of Department',
    established: 1998,
    students: 340,
    faculty: 13,
    intro:
      'The Department of Physics combines a well-equipped experimental laboratory with a theory curriculum spanning mechanics, electromagnetism, modern physics and electronics.',
    programs: ['BS Physics (4 Years)', 'Physics for FSc Pre-Engineering & Pre-Medical'],
    courses: ['Mechanics', 'Waves & Oscillations', 'Electricity & Magnetism', 'Modern Physics', 'Electronics', 'Quantum Mechanics'],
    facilities: ['Advanced Physics Laboratory', 'Electronics Workshop'],
    achievements: ['Best Science Exhibition Project, District Science Fair 2025'],
    email: 'physics@gdczaim.edu.pk'
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    nameUr: 'کیمیا',
    icon: 'flask',
    hod: 'Dr. Ayesha Noor',
    hodDesignation: 'Assistant Professor & Head of Department',
    established: 2000,
    students: 365,
    faculty: 12,
    intro:
      'The Department of Chemistry provides practical training in organic, inorganic, physical and analytical chemistry within laboratories maintained to departmental safety standards.',
    programs: ['BS Chemistry (4 Years)', 'Chemistry for FSc Pre-Medical'],
    courses: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry', 'Biochemistry', 'Industrial Chemistry'],
    facilities: ['Organic & Inorganic Labs', 'Instrumentation Room', 'Chemical Store with safety protocol'],
    achievements: ['Collaborative water-quality survey with the district administration'],
    email: 'chemistry@gdczaim.edu.pk'
  },
  {
    id: 'botany',
    name: 'Botany',
    nameUr: 'نباتیات',
    icon: 'leaf',
    hod: 'Dr. Hina Gul',
    hodDesignation: 'Assistant Professor & Head of Department',
    established: 2002,
    students: 290,
    faculty: 10,
    intro:
      'The Department of Botany studies plant sciences from cell biology to ecology, supported by a herbarium and a campus botanical garden used for field practicals.',
    programs: ['BS Botany (4 Years)', 'Biology for FSc Pre-Medical'],
    courses: ['Plant Systematics', 'Plant Physiology', 'Genetics', 'Ecology', 'Cell Biology', 'Microbiology'],
    facilities: ['Herbarium (2,400 specimens)', 'Botanical Garden', 'Microscopy Lab'],
    achievements: ['Campus biodiversity survey published in the college research bulletin'],
    email: 'botany@gdczaim.edu.pk'
  },
  {
    id: 'zoology',
    name: 'Zoology',
    nameUr: 'حیوانیات',
    icon: 'dna',
    hod: 'Dr. Farhan Ali',
    hodDesignation: 'Associate Professor & Head of Department',
    established: 2002,
    students: 275,
    faculty: 10,
    intro:
      'The Department of Zoology covers animal diversity, physiology, genetics and wildlife studies, with a museum collection used across practical courses.',
    programs: ['BS Zoology (4 Years)', 'Biology for FSc Pre-Medical'],
    courses: ['Animal Diversity', 'Cell & Molecular Biology', 'Physiology', 'Genetics', 'Wildlife & Fisheries', 'Entomology'],
    facilities: ['Zoology Museum', 'Dissection & Physiology Lab'],
    achievements: ['Wildlife awareness campaign with the provincial Wildlife Department'],
    email: 'zoology@gdczaim.edu.pk'
  },
  {
    id: 'economics',
    name: 'Economics & Commerce',
    nameUr: 'معاشیات و کامرس',
    icon: 'chart',
    hod: 'Prof. Zahid Iqbal',
    hodDesignation: 'Professor & Head of Department',
    established: 2004,
    students: 410,
    faculty: 11,
    intro:
      'The Department of Economics & Commerce prepares students for careers in public administration, banking and business through applied coursework in economics, accounting and statistics.',
    programs: ['BS Economics (4 Years)', 'I.Com — Intermediate in Commerce (2 Years)'],
    courses: ['Microeconomics', 'Macroeconomics', 'Development Economics', 'Financial Accounting', 'Business Statistics', 'Public Finance'],
    facilities: ['Commerce Computer Lab', 'Economics Data Resource Centre'],
    achievements: ['Annual district economic survey compiled by final-year students'],
    email: 'economics@gdczaim.edu.pk'
  },
  {
    id: 'islamiyat',
    name: 'Islamic Studies & Urdu',
    nameUr: 'اسلامیات و اردو',
    icon: 'mosque',
    hod: 'Prof. Abdul Wahab',
    hodDesignation: 'Professor & Head of Department',
    established: 1998,
    students: 520,
    faculty: 12,
    intro:
      'The Department of Islamic Studies & Urdu delivers the compulsory curriculum for all programmes and specialised study in Quranic sciences, Islamic history and Urdu literature.',
    programs: ['BS Islamic Studies (4 Years)', 'BS Urdu (4 Years)', 'Compulsory Islamiyat & Urdu'],
    courses: ['Quranic Studies', 'Hadith & Fiqh', 'Islamic History', 'Urdu Adab', 'Urdu Grammar & Composition', 'Iqbaliyat'],
    facilities: ['Islamic Reference Library', 'Naat & Qirat Society'],
    achievements: ['First position, Inter-Collegiate Naat Competition 2025'],
    email: 'islamiyat@gdczaim.edu.pk'
  }
];

/* ------------------------------------------------------------------ *
 * Faculty directory
 * ------------------------------------------------------------------ */
const faculty = [
  { id: 'f01', name: 'Prof. Dr. Muhammad Ayaz Khan', designation: 'Principal', dept: 'administration', qualification: 'Ph.D. Education', specialization: 'Educational Leadership', email: 'principal@gdczaim.edu.pk' },
  { id: 'f02', name: 'Prof. Nadia Bashir', designation: 'Professor / HOD', dept: 'english', qualification: 'M.Phil. English', specialization: 'Modern Drama', email: 'nadia.bashir@gdczaim.edu.pk' },
  { id: 'f03', name: 'Dr. Sadia Rehman', designation: 'Associate Professor / HOD', dept: 'computer-science', qualification: 'Ph.D. Computer Science', specialization: 'Database Systems', email: 'sadia.rehman@gdczaim.edu.pk' },
  { id: 'f04', name: 'Mr. Bilal Ahmad', designation: 'Assistant Professor', dept: 'computer-science', qualification: 'MS Software Engineering', specialization: 'Web & Mobile Engineering', email: 'bilal.ahmad@gdczaim.edu.pk' },
  { id: 'f05', name: 'Ms. Kiran Shah', designation: 'Lecturer', dept: 'computer-science', qualification: 'MS Computer Science', specialization: 'Artificial Intelligence', email: 'kiran.shah@gdczaim.edu.pk' },
  { id: 'f06', name: 'Mr. Usman Ghani', designation: 'Lecturer', dept: 'computer-science', qualification: 'MSCS', specialization: 'Computer Networks', email: 'usman.ghani@gdczaim.edu.pk' },
  { id: 'f07', name: 'Dr. Imran Ullah', designation: 'Assistant Professor / HOD', dept: 'mathematics', qualification: 'Ph.D. Mathematics', specialization: 'Numerical Analysis', email: 'imran.ullah@gdczaim.edu.pk' },
  { id: 'f08', name: 'Ms. Sana Javed', designation: 'Lecturer', dept: 'mathematics', qualification: 'M.Phil. Mathematics', specialization: 'Applied Algebra', email: 'sana.javed@gdczaim.edu.pk' },
  { id: 'f09', name: 'Dr. Tariq Mehmood', designation: 'Associate Professor / HOD', dept: 'physics', qualification: 'Ph.D. Physics', specialization: 'Solid State Physics', email: 'tariq.mehmood@gdczaim.edu.pk' },
  { id: 'f10', name: 'Mr. Hamza Saeed', designation: 'Lecturer', dept: 'physics', qualification: 'M.Phil. Physics', specialization: 'Electronics', email: 'hamza.saeed@gdczaim.edu.pk' },
  { id: 'f11', name: 'Dr. Ayesha Noor', designation: 'Assistant Professor / HOD', dept: 'chemistry', qualification: 'Ph.D. Chemistry', specialization: 'Analytical Chemistry', email: 'ayesha.noor@gdczaim.edu.pk' },
  { id: 'f12', name: 'Mr. Adnan Malik', designation: 'Lecturer', dept: 'chemistry', qualification: 'M.Phil. Chemistry', specialization: 'Organic Synthesis', email: 'adnan.malik@gdczaim.edu.pk' },
  { id: 'f13', name: 'Dr. Hina Gul', designation: 'Assistant Professor / HOD', dept: 'botany', qualification: 'Ph.D. Botany', specialization: 'Plant Ecology', email: 'hina.gul@gdczaim.edu.pk' },
  { id: 'f14', name: 'Dr. Farhan Ali', designation: 'Associate Professor / HOD', dept: 'zoology', qualification: 'Ph.D. Zoology', specialization: 'Entomology', email: 'farhan.ali@gdczaim.edu.pk' },
  { id: 'f15', name: 'Prof. Zahid Iqbal', designation: 'Professor / HOD', dept: 'economics', qualification: 'M.Phil. Economics', specialization: 'Development Economics', email: 'zahid.iqbal@gdczaim.edu.pk' },
  { id: 'f16', name: 'Ms. Rabia Anwar', designation: 'Lecturer', dept: 'economics', qualification: 'MS Commerce', specialization: 'Financial Accounting', email: 'rabia.anwar@gdczaim.edu.pk' },
  { id: 'f17', name: 'Prof. Abdul Wahab', designation: 'Professor / HOD', dept: 'islamiyat', qualification: 'M.Phil. Islamic Studies', specialization: 'Quranic Sciences', email: 'abdul.wahab@gdczaim.edu.pk' },
  { id: 'f18', name: 'Mr. Shafiq ur Rehman', designation: 'Lecturer', dept: 'islamiyat', qualification: 'M.A. Urdu', specialization: 'Urdu Literature', email: 'shafiq.rehman@gdczaim.edu.pk' },
  { id: 'f19', name: 'Ms. Maryam Zeb', designation: 'Lecturer', dept: 'english', qualification: 'M.Phil. Linguistics', specialization: 'Applied Linguistics', email: 'maryam.zeb@gdczaim.edu.pk' },
  { id: 'f20', name: 'Mr. Naveed Anjum', designation: 'Librarian', dept: 'administration', qualification: 'MLIS', specialization: 'Library & Information Science', email: 'library@gdczaim.edu.pk' }
];

/* ------------------------------------------------------------------ *
 * Notices  (categories drive the filter chips on notices.html)
 * ------------------------------------------------------------------ */
const noticeCategories = ['Admission', 'Examination', 'Academic', 'Scholarship', 'Holiday', 'Emergency', 'General'];

const notices = [
  { id: 'n-2026-041', title: 'BS Admissions 2026 — Second Merit List Displayed', titleUr: 'بی ایس داخلے 2026 — دوسری میرٹ لسٹ آویزاں', category: 'Admission', date: '2026-09-14', dept: 'all', pinned: true, urgent: false, file: 'merit-list-2-2026.pdf', body: 'The second merit list for all BS four-year programmes has been displayed on the college notice board and published in the Downloads section. Selected candidates must deposit dues and complete enrolment at the Admission Office by 22 September 2026. Seats not confirmed by the deadline will be offered to candidates on the next merit list.' },
  { id: 'n-2026-040', title: 'Mid-Term Examination Schedule — Fall 2026', titleUr: 'وسط مدتی امتحانات شیڈول — خزاں 2026', category: 'Examination', date: '2026-09-11', dept: 'all', pinned: true, urgent: false, file: 'midterm-schedule-fall-2026.pdf', body: 'Mid-term examinations for all departments will be held from 6 to 17 October 2026. The detailed datesheet is available in Downloads and on each department page. Students must carry their college identity card to the examination hall; candidates with attendance below 75% will not be issued a roll number slip.' },
  { id: 'n-2026-039', title: 'Prime Minister’s Need-Based Scholarship — Applications Open', titleUr: 'وزیراعظم ضرورت پر مبنی وظائف — درخواستیں', category: 'Scholarship', date: '2026-09-08', dept: 'all', pinned: false, urgent: false, file: 'pm-scholarship-2026.pdf', body: 'Applications are invited from students of all BS programmes for the need-based scholarship scheme. Applicants must submit the prescribed form together with the guardian income certificate, the previous semester result card and a copy of the B-Form/CNIC to the Scholarship Cell by 30 September 2026.' },
  { id: 'n-2026-038', title: 'Annual Sports Week — Registration for Teams', titleUr: 'سالانہ اسپورٹس ویک — ٹیم رجسٹریشن', category: 'General', date: '2026-09-05', dept: 'all', pinned: false, urgent: false, file: '', body: 'Registration is open for cricket, football, volleyball, badminton and athletics teams for the Annual Sports Week starting 20 October 2026. Department sports representatives must submit team lists to the Sports Office before 1 October 2026.' },
  { id: 'n-2026-037', title: 'Computer Science — Final Year Project Proposal Defence', titleUr: 'کمپیوٹر سائنس — فائنل ایئر پروجیکٹ دفاع', category: 'Academic', date: '2026-09-03', dept: 'computer-science', pinned: false, urgent: false, file: 'fyp-defence-schedule.pdf', body: 'Final-year students of BS Computer Science will present their project proposals before the departmental evaluation committee on 24 and 25 September 2026 in the Project Lab. Each group is allotted 15 minutes for presentation and 10 minutes for questions.' },
  { id: 'n-2026-036', title: 'Library Timings Extended During Examination Period', titleUr: 'امتحانات کے دوران لائبریری کے اوقات میں توسیع', category: 'General', date: '2026-08-30', dept: 'all', pinned: false, urgent: false, file: '', body: 'The central library will remain open until 18:00 from 1 October to 20 October 2026 to facilitate students during the examination period. Borrowing counters will close 30 minutes before closing time.' },
  { id: 'n-2026-035', title: 'Fee Submission Deadline — Fall Semester 2026', titleUr: 'فیس جمع کرانے کی آخری تاریخ — خزاں 2026', category: 'General', date: '2026-08-27', dept: 'all', pinned: false, urgent: false, file: 'fee-challan-fall-2026.pdf', body: 'All continuing students must deposit the semester fee at the designated bank branch using the challan available in Downloads by 15 September 2026. A late fee of PKR 500 will apply after the deadline.' },
  { id: 'n-2026-034', title: 'Seminar on Career Opportunities in Public Service', titleUr: 'سرکاری ملازمتوں میں مواقع پر سیمینار', category: 'Academic', date: '2026-08-22', dept: 'economics', pinned: false, urgent: false, file: '', body: 'The Career Counselling Cell is organising a seminar on competitive examinations and public-service careers on 12 September 2026 at 11:00 in the college auditorium. Alumni serving in the provincial civil service will address the students.' },
  { id: 'n-2026-033', title: 'Closure of College on Account of Public Holiday', titleUr: 'عام تعطیل کے باعث کالج بند', category: 'Holiday', date: '2026-08-12', dept: 'all', pinned: false, urgent: false, file: '', body: 'The college will remain closed on 14 August 2026 in observance of Independence Day. The flag-hoisting ceremony will be held at 08:30 on 13 August 2026 and attendance of all staff and student representatives is required.' },
  { id: 'n-2026-032', title: 'Revised Class Timetable Effective From September', titleUr: 'نظرثانی شدہ ٹائم ٹیبل', category: 'Academic', date: '2026-08-08', dept: 'all', pinned: false, urgent: false, file: 'class-timetable-fall-2026.pdf', body: 'A revised class timetable for the Fall 2026 semester takes effect from 1 September 2026. Students and faculty should download the updated version; room allocations for laboratory sessions have changed for several departments.' }
];

/* ------------------------------------------------------------------ *
 * Events
 * ------------------------------------------------------------------ */
const events = [
  { id: 'e01', title: 'Annual Science Exhibition 2026', date: '2026-10-02', time: '09:00 – 15:00', venue: 'Main Auditorium & Science Block', category: 'Academic', registration: true, summary: 'Departmental project displays from Physics, Chemistry, Botany, Zoology and Computer Science, judged by a panel from the affiliated university.' },
  { id: 'e02', title: 'Inter-Departmental Programming Contest', date: '2026-10-09', time: '10:00 – 16:00', venue: 'Computer Lab I & II', category: 'Competition', registration: true, summary: 'Teams of three compete over five algorithmic problems. Open to all BS Computer Science and ICS students.' },
  { id: 'e03', title: 'Annual Sports Week', date: '2026-10-20', time: 'Full day', venue: 'College Sports Ground', category: 'Sports', registration: true, summary: 'Cricket, football, volleyball, badminton and athletics fixtures across one week, closing with the prize distribution ceremony.' },
  { id: 'e04', title: 'Workshop: Academic Writing & Research Skills', date: '2026-11-04', time: '11:00 – 13:00', venue: 'Seminar Hall', category: 'Workshop', registration: true, summary: 'Practical session on literature review, citation and plagiarism policy for final-year students of all departments.' },
  { id: 'e05', title: 'Blood Donation Camp', date: '2026-11-18', time: '09:00 – 14:00', venue: 'College Medical Room', category: 'Community', registration: false, summary: 'Organised by the Student Volunteer Society in collaboration with the district blood bank.' },
  { id: 'e06', title: 'Annual Prize Distribution & Alumni Meet', date: '2026-12-12', time: '10:00 – 14:00', venue: 'Main Auditorium', category: 'Cultural', registration: true, summary: 'Recognition of academic and co-curricular achievers of the year, followed by the annual gathering of the alumni association.' }
];

/* ------------------------------------------------------------------ *
 * Programs & admissions
 * ------------------------------------------------------------------ */
const programs = [
  { id: 'bscs', name: 'BS Computer Science', level: 'Undergraduate', duration: '4 Years (8 Semesters)', seats: 120, dept: 'computer-science', eligibility: 'FSc Pre-Engineering / ICS / FA with Mathematics, minimum 45% marks', fee: 'PKR 9,500 per semester' },
  { id: 'bsen', name: 'BS English', level: 'Undergraduate', duration: '4 Years (8 Semesters)', seats: 100, dept: 'english', eligibility: 'Intermediate in any discipline, minimum 45% marks', fee: 'PKR 7,500 per semester' },
  { id: 'bsma', name: 'BS Mathematics', level: 'Undergraduate', duration: '4 Years (8 Semesters)', seats: 80, dept: 'mathematics', eligibility: 'FSc Pre-Engineering / ICS, minimum 45% marks', fee: 'PKR 7,500 per semester' },
  { id: 'bsph', name: 'BS Physics', level: 'Undergraduate', duration: '4 Years (8 Semesters)', seats: 80, dept: 'physics', eligibility: 'FSc Pre-Engineering / Pre-Medical, minimum 45% marks', fee: 'PKR 8,000 per semester' },
  { id: 'bsch', name: 'BS Chemistry', level: 'Undergraduate', duration: '4 Years (8 Semesters)', seats: 80, dept: 'chemistry', eligibility: 'FSc Pre-Medical / Pre-Engineering, minimum 45% marks', fee: 'PKR 8,000 per semester' },
  { id: 'bsbo', name: 'BS Botany', level: 'Undergraduate', duration: '4 Years (8 Semesters)', seats: 60, dept: 'botany', eligibility: 'FSc Pre-Medical, minimum 45% marks', fee: 'PKR 8,000 per semester' },
  { id: 'bszo', name: 'BS Zoology', level: 'Undergraduate', duration: '4 Years (8 Semesters)', seats: 60, dept: 'zoology', eligibility: 'FSc Pre-Medical, minimum 45% marks', fee: 'PKR 8,000 per semester' },
  { id: 'bsec', name: 'BS Economics', level: 'Undergraduate', duration: '4 Years (8 Semesters)', seats: 90, dept: 'economics', eligibility: 'Intermediate in any discipline, minimum 45% marks', fee: 'PKR 7,500 per semester' },
  { id: 'bsis', name: 'BS Islamic Studies', level: 'Undergraduate', duration: '4 Years (8 Semesters)', seats: 60, dept: 'islamiyat', eligibility: 'Intermediate in any discipline, minimum 45% marks', fee: 'PKR 6,500 per semester' },
  { id: 'ics', name: 'ICS — Intermediate in Computer Science', level: 'Intermediate', duration: '2 Years', seats: 150, dept: 'computer-science', eligibility: 'Matriculation (Science), minimum 50% marks', fee: 'PKR 4,500 per semester' },
  { id: 'icom', name: 'I.Com — Intermediate in Commerce', level: 'Intermediate', duration: '2 Years', seats: 100, dept: 'economics', eligibility: 'Matriculation in any group, minimum 45% marks', fee: 'PKR 4,000 per semester' }
];

const admissionSchedule = [
  { stage: 'Issue of prospectus & online form', date: '01 Aug 2026 – 20 Aug 2026', status: 'done' },
  { stage: 'Last date for submission of applications', date: '25 Aug 2026', status: 'done' },
  { stage: 'Display of first merit list', date: '02 Sep 2026', status: 'done' },
  { stage: 'Display of second merit list', date: '14 Sep 2026', status: 'current' },
  { stage: 'Deposit of dues & enrolment', date: 'Up to 22 Sep 2026', status: 'current' },
  { stage: 'Commencement of classes', date: '01 Oct 2026', status: 'upcoming' }
];

const admissionDocuments = [
  'Matriculation & Intermediate detailed marks certificates (attested)',
  'Character certificate from the last institution attended',
  'Two attested copies of CNIC / B-Form and the guardian’s CNIC',
  'Four recent passport-size photographs',
  'Domicile certificate',
  'Migration certificate, where applicable'
];

/* ------------------------------------------------------------------ *
 * Library catalogue (sample of the digital-library module)
 * ------------------------------------------------------------------ */
const books = [
  { id: 'b001', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest & Stein', isbn: '978-0262046305', category: 'Computer Science', copies: 6, available: 2, shelf: 'CS-04' },
  { id: 'b002', title: 'Database System Concepts', author: 'Silberschatz, Korth & Sudarshan', isbn: '978-0078022159', category: 'Computer Science', copies: 5, available: 3, shelf: 'CS-05' },
  { id: 'b003', title: 'Operating System Concepts', author: 'Silberschatz & Galvin', isbn: '978-1118063330', category: 'Computer Science', copies: 4, available: 0, shelf: 'CS-06' },
  { id: 'b004', title: 'Calculus: Early Transcendentals', author: 'James Stewart', isbn: '978-1285741550', category: 'Mathematics', copies: 8, available: 5, shelf: 'MT-02' },
  { id: 'b005', title: 'Linear Algebra and Its Applications', author: 'David C. Lay', isbn: '978-0321982384', category: 'Mathematics', copies: 5, available: 4, shelf: 'MT-03' },
  { id: 'b006', title: 'Fundamentals of Physics', author: 'Halliday, Resnick & Walker', isbn: '978-1118230718', category: 'Physics', copies: 7, available: 3, shelf: 'PH-01' },
  { id: 'b007', title: 'Organic Chemistry', author: 'Paula Yurkanis Bruice', isbn: '978-0134042282', category: 'Chemistry', copies: 6, available: 1, shelf: 'CH-02' },
  { id: 'b008', title: 'Plant Physiology and Development', author: 'Taiz & Zeiger', isbn: '978-1605353890', category: 'Botany', copies: 4, available: 4, shelf: 'BT-01' },
  { id: 'b009', title: 'Principles of Economics', author: 'N. Gregory Mankiw', isbn: '978-1305585126', category: 'Economics', copies: 6, available: 2, shelf: 'EC-01' },
  { id: 'b010', title: 'A Study of History', author: 'Arnold J. Toynbee', isbn: '978-0195001983', category: 'History', copies: 3, available: 3, shelf: 'HS-01' },
  { id: 'b011', title: 'Bang-e-Dra', author: 'Allama Muhammad Iqbal', isbn: '978-9693500000', category: 'Urdu Literature', copies: 10, available: 7, shelf: 'UR-01' },
  { id: 'b012', title: 'Sahih Al-Bukhari (Urdu Translation)', author: 'Imam Muhammad al-Bukhari', isbn: '978-9694070000', category: 'Islamic Studies', copies: 5, available: 5, shelf: 'IS-01' },
  { id: 'b013', title: 'Software Engineering: A Practitioner’s Approach', author: 'Roger S. Pressman', isbn: '978-0078022128', category: 'Computer Science', copies: 5, available: 2, shelf: 'CS-07' },
  { id: 'b014', title: 'Molecular Biology of the Cell', author: 'Alberts et al.', isbn: '978-0815344322', category: 'Zoology', copies: 3, available: 1, shelf: 'ZO-02' },
  { id: 'b015', title: 'The Norton Anthology of English Literature', author: 'Stephen Greenblatt (Ed.)', isbn: '978-0393603125', category: 'English', copies: 4, available: 2, shelf: 'EN-01' }
];

/* ------------------------------------------------------------------ *
 * Downloads / document centre
 * ------------------------------------------------------------------ */
const downloads = [
  { id: 'd01', title: 'Admission Prospectus 2026', category: 'Admission', size: '3.2 MB', type: 'PDF', date: '2026-08-01' },
  { id: 'd02', title: 'BS Admission Application Form', category: 'Admission', size: '420 KB', type: 'PDF', date: '2026-08-01' },
  { id: 'd03', title: 'Second Merit List — All Programmes', category: 'Admission', size: '890 KB', type: 'PDF', date: '2026-09-14' },
  { id: 'd04', title: 'Class Timetable — Fall 2026', category: 'Academic', size: '650 KB', type: 'PDF', date: '2026-08-08' },
  { id: 'd05', title: 'Mid-Term Datesheet — Fall 2026', category: 'Examination', size: '380 KB', type: 'PDF', date: '2026-09-11' },
  { id: 'd06', title: 'Fee Challan Form — Fall 2026', category: 'Finance', size: '210 KB', type: 'PDF', date: '2026-08-27' },
  { id: 'd07', title: 'Need-Based Scholarship Form', category: 'Scholarship', size: '340 KB', type: 'PDF', date: '2026-09-08' },
  { id: 'd08', title: 'Bonafide / Character Certificate Request Form', category: 'Student Services', size: '190 KB', type: 'PDF', date: '2026-07-15' },
  { id: 'd09', title: 'Student Code of Conduct & Discipline Policy', category: 'Policy', size: '540 KB', type: 'PDF', date: '2026-06-20' },
  { id: 'd10', title: 'Hostel Application Form', category: 'Student Services', size: '260 KB', type: 'PDF', date: '2026-07-30' },
  { id: 'd11', title: 'Anti-Harassment Policy', category: 'Policy', size: '300 KB', type: 'PDF', date: '2026-05-10' },
  { id: 'd12', title: 'Library Membership & Borrowing Rules', category: 'Policy', size: '180 KB', type: 'PDF', date: '2026-05-10' }
];

/* ------------------------------------------------------------------ *
 * Scholarships, services, facilities, gallery
 * ------------------------------------------------------------------ */
const scholarships = [
  { name: 'Prime Minister’s Need-Based Scholarship', provider: 'HEC / Government of Pakistan', covers: 'Full tuition + monthly stipend', eligibility: 'Enrolled BS students with verified family income below the prescribed threshold', deadline: '2026-09-30' },
  { name: 'Ehsaas Undergraduate Scholarship', provider: 'HEC', covers: 'Tuition fee + living allowance', eligibility: 'First-year BS students from low-income households', deadline: '2026-10-15' },
  { name: 'Chief Minister’s Merit Scholarship', provider: 'Provincial Government', covers: 'Tuition fee waiver', eligibility: 'Top three positions in each department by CGPA', deadline: '2026-11-01' },
  { name: 'Zakat Fund Assistance', provider: 'District Zakat Committee', covers: 'Tuition fee & examination dues', eligibility: 'Deserving students on recommendation of the Zakat Committee', deadline: 'Open throughout the year' },
  { name: 'College Sports Talent Award', provider: 'GDC Zaim', covers: '50% fee concession', eligibility: 'Students representing the college at provincial or national level', deadline: 'Before the start of each semester' }
];

const studentServices = [
  { name: 'Bonafide Certificate', turnaround: '2 working days', requires: 'Registration number, purpose of request' },
  { name: 'Character Certificate', turnaround: '3 working days', requires: 'Clearance from department and library' },
  { name: 'Migration Certificate', turnaround: '5 working days', requires: 'No-dues clearance, original fee receipts' },
  { name: 'Academic Transcript', turnaround: '5 working days', requires: 'Completed semesters, transcript fee receipt' },
  { name: 'Duplicate Student ID Card', turnaround: '3 working days', requires: 'Application, affidavit for a lost card' },
  { name: 'Fee / Dues Certificate', turnaround: '2 working days', requires: 'Registration number, relevant session' }
];

const serviceStages = ['Submitted', 'Under Review', 'Approved', 'Ready', 'Delivered'];

const facilities = [
  { name: 'Central Library', icon: 'book', detail: '28,000+ volumes, reading hall for 120 readers, digital catalogue and e-resource terminals.' },
  { name: 'Computer Laboratories', icon: 'cpu', detail: 'Three labs with 120 workstations, campus-wide Wi-Fi and a dedicated final-year project room.' },
  { name: 'Science Laboratories', icon: 'flask', detail: 'Separate Physics, Chemistry, Botany and Zoology laboratories maintained to departmental safety standards.' },
  { name: 'Sports Ground', icon: 'trophy', detail: 'Cricket and football ground, volleyball and badminton courts, and an indoor table-tennis room.' },
  { name: 'Auditorium', icon: 'mic', detail: '500-seat auditorium with audio-visual facilities for seminars, ceremonies and cultural events.' },
  { name: 'Cafeteria', icon: 'cup', detail: 'Subsidised cafeteria serving hygienic meals and refreshments through the academic day.' },
  { name: 'Hostel', icon: 'home', detail: 'On-campus hostel accommodation for out-of-district students, with a warden and common study room.' },
  { name: 'Medical Room', icon: 'health', detail: 'First-aid facility with a visiting medical officer and referral arrangement with the district hospital.' },
  { name: 'Transport', icon: 'bus', detail: 'College buses on four routes covering the town and adjoining union councils.' },
  { name: 'Masjid & Prayer Area', icon: 'mosque', detail: 'Campus masjid with separate prayer space for female students.' }
];

const galleryItems = [
  { id: 'g01', title: 'Main Academic Block', category: 'Campus', tone: 'a' },
  { id: 'g02', title: 'Central Library Reading Hall', category: 'Campus', tone: 'b' },
  { id: 'g03', title: 'Computer Laboratory', category: 'Academic', tone: 'c' },
  { id: 'g04', title: 'Annual Science Exhibition', category: 'Events', tone: 'd' },
  { id: 'g05', title: 'Convocation Ceremony', category: 'Events', tone: 'e' },
  { id: 'g06', title: 'Inter-Collegiate Cricket Final', category: 'Sports', tone: 'f' },
  { id: 'g07', title: 'Botanical Garden', category: 'Campus', tone: 'b' },
  { id: 'g08', title: 'Chemistry Practical Session', category: 'Academic', tone: 'c' },
  { id: 'g09', title: 'Independence Day Assembly', category: 'Events', tone: 'a' },
  { id: 'g10', title: 'Debating Society Competition', category: 'Events', tone: 'd' },
  { id: 'g11', title: 'Sports Week Prize Distribution', category: 'Sports', tone: 'f' },
  { id: 'g12', title: 'Campus Masjid', category: 'Campus', tone: 'e' }
];

const alumni = [
  { name: 'Dr. Waqar Ahmed', batch: 'BS Physics, 2012', role: 'Assistant Professor, University of Peshawar' },
  { name: 'Ms. Samina Khalid', batch: 'BS English, 2014', role: 'Section Officer, Provincial Civil Service' },
  { name: 'Mr. Junaid Iqbal', batch: 'BS Computer Science, 2016', role: 'Senior Software Engineer, Islamabad' },
  { name: 'Dr. Nasreen Akhtar', batch: 'BS Zoology, 2013', role: 'Medical Officer, District Headquarters Hospital' },
  { name: 'Mr. Kamran Shah', batch: 'BS Economics, 2015', role: 'Branch Manager, National Bank of Pakistan' },
  { name: 'Mr. Asad Rauf', batch: 'ICS, 2017', role: 'Founder, local IT services startup' }
];

const careers = [
  { title: 'Lecturer (Visiting) — Computer Science', org: 'GDC Zaim', type: 'Visiting Faculty', deadline: '2026-09-28' },
  { title: 'Internship Programme — District IT Office', org: 'Government of KP', type: 'Internship', deadline: '2026-10-05' },
  { title: 'Junior Data Entry Operator', org: 'District Education Office', type: 'Government Job', deadline: '2026-10-10' },
  { title: 'Trainee Officer Programme', org: 'National Bank of Pakistan', type: 'Graduate Programme', deadline: '2026-10-20' }
];

/* Expose for the browser */
window.GDC = {
  siteConfig, departments, faculty, notices, noticeCategories, events, programs,
  admissionSchedule, admissionDocuments, books, downloads, scholarships,
  studentServices, serviceStages, facilities, galleryItems, alumni, careers
};
